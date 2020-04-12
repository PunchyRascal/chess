Number.prototype.isOdd = function () {
    return this % 2 !== 0;
};

String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
}

function range(length, start=1) {
    return [...Array(length).keys()].map(i => i + start);
}

function Chess() {
    let board,
        table,
        numberMap = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'},
        queenRow = {0: "rook", 1: "knight", 2: "bishop", 3: "queen", 4: "king", 5: "bishop", 6: "knight", 7: "rook"},
        pawnRow = {0: "pawn", 1: "pawn", 2: "pawn", 3: "pawn", 4: "pawn", 5: "pawn", 6: "pawn", 7: "pawn"},
        colorReverseMap = {'black': "white", 'white': "black"},
        pieceMap = {
            black: {0: queenRow, 1: pawnRow},
            white: {0: pawnRow, 1: queenRow}
        },
        movingPiece,
        pieces = {},
        squares = {},
        lastColor,
        historyLog,
        moveCounter = 0,
        body = document.getElementsByTagName('body')[0],
        capturedPieceLogs = {},
        highlightedSquares = [];

    initializeBoard();
    ['black', 'white'].forEach(initializePieces);
    initializeHistory();
    initializeCapturedPieceLog();

    function Square(element, col, row) {
        this.element = element;
        this.piece = null;
        this.col = col;
        this.row = row;
        this.isHighlighted = false;

        this.initialize = function() {
            this.element.addEventListener('click', squareClickHandler);
            this.element.style.backgroundColor = squareColorAt(col, row);
            this.element.classList.add('square');
        };

        this.highlight = function() {
            this.isHighlighted = true;
            this.element.classList.add('highlight');
            highlightedSquares.push(this);
        };

        this.unHighlight = function() {
            this.isHighlighted = false;
            this.element.classList.remove('highlight');
        };

        this.accommodatePiece = function (piece) {
            this.piece = piece;
            this.element.appendChild(piece.element);
        };
    }

    function Piece(id, color, pieceName, col, row) {
        this.isBlack = color === "black";
        this.isWhite = color === "white";
        this.color = color;
        this.id = id;
        this.name = pieceName;
        this.col = col;
        this.row = row;
        this.hasMoved = false;

        this.element = document.createElement('div');
        this.element.classList.add('piece');
        this.element.style.color = color;
        this.element.innerText = this.name;
        this.element.dataset.id = id;


        this.isSameColorAs = function(otherPiece) {
            return otherPiece.isWhite && this.isWhite || otherPiece.isBlack && this.isBlack;
        };

        this.moveTo = (square) => {
            if (square.col === this.col && square.row === this.row) {
                return;
            }

            let incumbentPiece = square.piece;

            if (incumbentPiece) {
                if (!incumbentPiece.isSameColorAs(movingPiece)) {
                    capturePiece(incumbentPiece);
                } else {
                    // TODO: handle by not highlighting occupied squares
                    return;
                }
            }

            square.accommodatePiece(this)
            addHistoryItem(square.col, square.row, this.col, this.row, incumbentPiece);
            this.hasMoved = true;
            this.col = square.col;
            this.row = square.row;
            lastColor = movingPiece.color;
            movingPiece = null;
            square.piece = this;
        };
    }

    function initializeCapturedPieceLog() {
        ['black', 'white'].forEach(color => {
            el = document.createElement('div');
            el.classList.add('capturedPieceLog');
            el.classList.add('logColor' + color.capitalize());
            body.appendChild(el);
            capturedPieceLogs[color] = el
        });
    }

    function capturePiece(piece) {
        item = document.createElement('div');
        item.innerText = piece.name;
        capturedPieceLogs[colorReverseMap[piece.color]].appendChild(item);
        piece.element.remove();
    }

    function addHistoryItem(newCol, newRow, oldCol, oldRow, capturedPiece) {
        moveCounter++;
        item = document.createElement('div');
        text = moveCounter + ') ' + movingPiece.color[0].toUpperCase() + ": " + movingPiece.name.capitalize()
            + " " + numberMap[oldCol - 1].toUpperCase() + oldRow
            + " -> " + numberMap[newCol - 1].toUpperCase() + newRow;

        if (capturedPiece) {
            text += " ⏺ " + capturePiece.name
        }

        d = new Date();
        date = '<span>' + d.getDate() +'/' + d.getMonth() +'/'+ d.getFullYear() + ' '
            + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</span>'
        item.innerHTML = text + date;
        historyLog.appendChild(item);
    }

    function initializeHistory() {
        historyLog = document.createElement('div');
        historyLog.id = 'historyLog';
        body.appendChild(historyLog);
    }

    function indicatePossibleTargetSquares(startSquare) {
        let possibleSquares;

        startSquare.highlight();

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
            callAtSquare(coord.col, coord.row, square => square.highlight());
        });
    }

    function squareClickHandler(e) {
        let square = squares[e.currentTarget.dataset.id];

        if (!movingPiece && !square.piece) {
            return;
        }

        if (movingPiece && !square.isHighlighted) {
            return;
        }

        if (movingPiece) {
            movingPiece.moveTo(square);
            highlightedSquares.forEach(square => square.unHighlight());
            highlightedSquares = [];
            return;
        }

        let candidatePiece = pieces[e.currentTarget.querySelector('.piece').dataset.id];

        if (!lastColor && !candidatePiece.isWhite || candidatePiece.color === lastColor) {
            return;
        }

        movingPiece = candidatePiece;
        indicatePossibleTargetSquares(square);
    }

    function callAtSquare(col, row, callback) {
        callback(
            squares[
                table
                    .getElementsByTagName('tr')[8 - row + 1]
                    .getElementsByTagName('td')[col]
                    .dataset.id
            ]
        );
    }

    function initializePieces(color) {
        let start = color === 'black' ? [1, 8] : [1, 2];

        [start[1], start[1] - 1].forEach(function(row, rowIndex) {
            range(8).forEach(function(col, colIndex) {
                pieceName = pieceMap[color][rowIndex][colIndex];
                callAtSquare(col, row, square => {
                    let id = color + pieceName + Math.random();
                    pieces[id] = new Piece(id, color, pieceName, col, row);
                    square.accommodatePiece(pieces[id]);
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
                } else if (col > 1 && col < 10 && row > 1 && row < 10) {
                    cell.dataset.id = `${col - 1}:${row - 1}`;
                    let square = new Square(cell, col - 1, 10 - row);
                    squares[cell.dataset.id] = square;
                    square.initialize();
                }

                tr.appendChild(cell)
            });
            table.appendChild(tr);
        });

        board.appendChild(table);
        body.appendChild(board)
    }

}