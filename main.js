Number.prototype.isOdd = function () {
    return this % 2 !== 0;
};

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
    movingPiece = null,
    lastColor = null;

function clickHandler(e) {
    if (!movingPiece && e.currentTarget.innerHTML === "") {
        return;
    }

    if (movingPiece) {
        e.currentTarget.appendChild(movingPiece);
        lastColor = movingPiece.dataset.color;
        movingPiece = null;
    } else {
        movingPiece = e.currentTarget.querySelector('.piece');

        if (!lastColor && movingPiece.dataset.color !== 'white' || movingPiece.dataset.color === lastColor) {
            movingPiece = null;
            return;
        }

        e.currentTarget.innerHTML = "";
    }
}

function callAtCell(letter, number, callback) {
    // console.log('get cell at: ', letter, ',', number);
    let row = table.getElementsByTagName('tr')[8 - number + 1];
    let cell = row.getElementsByTagName('td')[letterMap[letter] + 1];
    callback(cell);
}

function createPieces(color) {
    let start = color === 'black' ? ['a', 8] : ['a', 2];

    [start[1], start[1] - 1].forEach(function(row, rowIndex) {
        [0, 1, 2, 3, 4, 5, 6, 7].forEach(function(colIndex) {
            piece = pieceMap[color][rowIndex][colIndex];
            callAtCell(numberMap[letterMap[start[0]] + colIndex], row, cell => {
                cell.innerHTML = "<span class='piece' data-color='"+ color +"' style='color: "+ color +"'>" + piece + "</span>";
            });
        });
    });
}

function getCellColor(colIndex, rowIndex) {
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

function initCells() {
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(function(col, colIndex) {
        [1, 2, 3, 4, 5, 6, 7, 8].forEach(function(row, rowIndex) {
            callAtCell(col, row, (cell, currentCol, currentRow) => {
                cell.addEventListener('click', clickHandler);
                cell.style.backgroundColor = getCellColor(colIndex + 1, row);
                cell.classList.add('square');
            });
        });
    });
}

function generateBoard() {
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

generateBoard();
['black', 'white'].forEach(createPieces);
initCells();