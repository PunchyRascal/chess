Number.prototype.isOdd = function () {
    return this % 2 !== 0;
};

function Chess() {
    let board,
        table,
        letterMap = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7},
        numberMap = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'},
        queenRow = {0: "rook", 1: "knight", 2: "bishop", 3: "queen", 4: "king", 5: "bishop", 6: "knight", 7: "rook"},
        pawnRow = {0: "pawn", 1: "pawn", 2: "pawn", 3: "pawn", 4: "pawn", 5: "pawn", 6: "pawn", 7: "pawn"},
        pieceMap = {
            black: {0: queenRow, 1: pawnRow},
            white: {0: pawnRow, 1: queenRow}
        },
        movingPiece,
        pieces = {},
        lastColor;

    initializeBoard();
    ['black', 'white'].forEach(initializePieces);
    initializeSquares();

    function MovingPiece(element, id, color, piece, col, row) {
        this.isWhite = color === "white";
        this.color = color;
        this.id = id;
        this.name = piece;
        this.element = element;
        this.col = col;
        this.row = row;
        this.hasMoved = false
        this.movedTo = (col, row) => {
            console.log('hasMoved to:', col, row);
            this.hasMoved = true;
            this.col = col;
            this.row = row;
        };
    }

    function indicatePossibleTargetSquares() {
        let possibleSquares;
        console.log(movingPiece);

        if (movingPiece.name === 'pawn') {
            if (!movingPiece.hasMoved) {
                if (movingPiece.isWhite) {
                    possibleSquares = [
                        {col: movingPiece.col, row: 3},
                        {col: movingPiece.col, row: 4}
                    ];
                } else {
                    possibleSquares = [
                        {col: movingPiece.col, row: 6},
                        {col: movingPiece.col, row: 5}
                    ];
                }
            } else {
                possibleSquares = [
                    {
                        col: movingPiece.col,
                        row: movingPiece.row + (movingPiece.isWhite ? 1 : -1)
                    }
                ]
            }
        }

        possibleSquares.forEach(coord => {
            callAtSquare2(coord.col, coord.row, cell => cell.classList.add('highlight'));
        });
    }

    function unIndicatePossibleSquares() {
        document.querySelectorAll('.square.highlight').forEach(el => el.classList.remove('highlight'));
    }

    function squareClickHandler(e) {
        if (!movingPiece && e.currentTarget.innerHTML === "") {
            return;
        }

        if (movingPiece && !e.currentTarget.classList.contains('highlight')) {
            return;
        }

        if (movingPiece) {
            e.currentTarget.appendChild(movingPiece.element);
            lastColor = movingPiece.color;
            movingPiece.movedTo(
                Number(e.currentTarget.dataset.col),
                Number(e.currentTarget.dataset.row)
            );
            movingPiece = null;
            unIndicatePossibleSquares()
        } else {
            let candidatePiece = pieces[e.currentTarget.querySelector('.piece').dataset.id];
            if (!lastColor && !candidatePiece.isWhite || candidatePiece.color === lastColor) {
                return;
            }
            movingPiece = candidatePiece;
            indicatePossibleTargetSquares();
            e.currentTarget.innerHTML = "";
        }
    }

    // TODO: merge with callAtSquare
    function callAtSquare2(col, row, callback) {
        console.log('callAtSquare2', col, row);
        callback(table.getElementsByTagName('tr')[8 - row + 1].getElementsByTagName('td')[col]);
    }

    function callAtSquare(col, number, callback) {
        // console.log('get cell at: ', letter, ',', number);
        let row = table.getElementsByTagName('tr')[8 - number + 1];
        let cell = row.getElementsByTagName('td')[letterMap[col] + 1];
        callback(cell);
    }

    function initializePieces(color) {
        let start = color === 'black' ? ['a', 8] : ['a', 2];

        [start[1], start[1] - 1].forEach(function(row, rowIndex) {
            [0, 1, 2, 3, 4, 5, 6, 7].forEach(function(colIndex) {
                piece = pieceMap[color][rowIndex][colIndex];
                callAtSquare(numberMap[letterMap[start[0]] + colIndex], row, cell => {
                    let id = color + piece + Math.random();
                    pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.style.color = color;
                    pieceElement.innerText = piece;
                    pieceElement.dataset.id = id;
                    pieces[id] = new MovingPiece(pieceElement, id, color, piece, colIndex + 1, rowIndex + 1);
                    cell.appendChild(pieceElement);
                });
            });
        });
    }

    function squareColorAt(colIndex, rowIndex) {
        let lightColor = "#998888";
        let darkColor = "#665555";

        // console.log("color at: ", colIndex, rowIndex);

        if (rowIndex.isOdd()) {
            if (colIndex.isOdd()) {
                return darkColor;
            } else {
                return lightColor;
            }
        } else {
            if (colIndex.isOdd()) {
                return lightColor;
            } else {
                return darkColor;
            }
        }
    }

    function initializeSquares() {
        ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(function(col, colIndex) {
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(function(row, rowIndex) {
                callAtSquare(col, row, (cell, currentCol, currentRow) => {
                    cell.addEventListener('click', squareClickHandler);
                    cell.style.backgroundColor = squareColorAt(colIndex + 1, row);
                    cell.classList.add('square');
                    cell.dataset.row = row;
                    cell.dataset.col = colIndex + 1;
                });
            });
        });
    }

    function initializeBoard() {
        board = document.createElement('div');
        table = document.createElement('table');
        board.id = 'board';

        for (let i = 1; i <= 10; i++) {
            let row = document.createElement('tr');
            for (let j = 1; j <= 10; j++) {
                let cell = document.createElement('td');
                if ((i === 1 || i === 10) && j > 1 && j < 10) {
                    cell.innerText = numberMap[j - 2];
                }
                if (i > 1 && i < 10 && (j === 1 || j === 10)) {
                    cell.innerText = 10 - i;
                }
                row.appendChild(cell)
            }
            table.appendChild(row);
        }

        board.appendChild(table);
        document.getElementsByTagName('body')[0].appendChild(board)
    }

}