Number.prototype.isOdd = function () {
    return this % 2 !== 0;
};

function range(length, start=1) {
    return [...Array(length).keys()].map(i => i + start);
}

function Chess() {
    let board,
        table,
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
            if (col === this.col && row === this.row) {
                return;
            }

            this.hasMoved = true;
            this.col = col;
            this.row = row;
            lastColor = movingPiece.color;
        };
    }

    function indicatePossibleTargetSquares() {
        let possibleSquares;

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
            callAtSquare(coord.col, coord.row, cell => cell.classList.add('highlight'));
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
            movingPiece.movedTo(
                Number(e.currentTarget.dataset.col),
                Number(e.currentTarget.dataset.row)
            );
            movingPiece = null;
            unIndicatePossibleSquares()
            return;
        }

        let candidatePiece = pieces[e.currentTarget.querySelector('.piece').dataset.id];
        if (!lastColor && !candidatePiece.isWhite || candidatePiece.color === lastColor) {
            return;
        }
        movingPiece = candidatePiece;
        indicatePossibleTargetSquares();
        e.currentTarget.classList.add('highlight');
    }

    function callAtSquare(col, row, callback) {
        callback(table.getElementsByTagName('tr')[8 - row + 1].getElementsByTagName('td')[col]);
    }

    function initializePieces(color) {
        let start = color === 'black' ? [1, 8] : [1, 2];

        [start[1], start[1] - 1].forEach(function(row, rowIndex) {
            range(8).forEach(function(col, colIndex) {
                piece = pieceMap[color][rowIndex][colIndex];
                callAtSquare(col, row, cell => {
                    let id = color + piece + Math.random();
                    pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.style.color = color;
                    pieceElement.innerText = piece;
                    pieceElement.dataset.id = id;
                    pieces[id] = new MovingPiece(pieceElement, id, color, piece, col, row);
                    cell.appendChild(pieceElement);
                });
            });
        });
    }

    function squareColorAt(colIndex, rowIndex) {
        let lightColor = "#998888";
        let darkColor = "#665555";

        if (rowIndex.isOdd()) {
            return colIndex.isOdd() ? darkColor : lightColor;
        }

        return colIndex.isOdd() ? lightColor : darkColor;
    }

    function initializeSquares() {
        range(8).forEach(function(col, colIndex) {
            range(8).forEach(function(row) {
                callAtSquare(col, row, cell => {
                    cell.addEventListener('click', squareClickHandler);
                    cell.style.backgroundColor = squareColorAt(col, row);
                    cell.classList.add('square');
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                });
            });
        });
    }

    function initializeBoard() {
        board = document.createElement('div');
        table = document.createElement('table');
        board.id = 'board';

        range(10).forEach(row => {
            let tr = document.createElement('tr');
            range(10).forEach(col => {
                let cell = document.createElement('td');
                if ((row === 1 || row === 10) && col > 1 && col < 10) {
                    cell.innerText = numberMap[col - 2];
                } else if (row > 1 && row < 10 && (col === 1 || col === 10)) {
                    cell.innerText = 10 - row;
                }
                tr.appendChild(cell)
            });
            table.appendChild(tr);
        });

        board.appendChild(table);
        document.getElementsByTagName('body')[0].appendChild(board)
    }

}