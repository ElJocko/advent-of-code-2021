'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

function sumElementIds(acc, elem) {
    return acc + elem.id;
}

function parseLine(line) {
    return line.split('');
}

function isDigit(char) {
    return char >= '0' && char <= '9';
}

function isSymbol(char) {
    return !(isDigit(char) || char === '.');
}

function symbolIsAdjacent(i, j, lines) {
    if (i > 0) {
        // up left
        if (j > 0 && isSymbol(lines[i-1][j-1])) {
            return true;
        }
        // up
        if (isSymbol(lines[i-1][j])) {
            return true;
        }
        // up right
        if (j < (lines[i].length - 1) && isSymbol(lines[i-1][j+1])) {
            return true;
        }
    }
    // left
    if (j > 0 && isSymbol(lines[i][j-1])) {
        return true;
    }
    // right
    if (j < (lines[i].length - 1) && isSymbol(lines[i][j+1])) {
        return true;
    }
    if (i < (lines.length - 1)) {
        // down left
        if (j > 0 && isSymbol(lines[i+1][j-1])) {
            return true;
        }
        // down
        if (isSymbol(lines[i+1][j])) {
            return true;
        }
        // down right
        if (j < (lines[i].length - 1) && isSymbol(lines[i+1][j+1])) {
            return true;
        }

        return false;
    }
}

function findAdjacentNumbers(i, j, numbers) {
    const adjacentNumbers = [];

    for (const number of numbers) {
        if (number.line === i - 1 && number.start <= j + 1 && number.end >= j - 1) {
            adjacentNumbers.push(number.value);
        }
        else if (number.line === i && (number.start === j + 1 || number.end === j - 1)) {
            adjacentNumbers.push(number.value);
        }
        else if (number.line === i + 1 && number.start <= j + 1 && number.end >= j - 1) {
            adjacentNumbers.push(number.value);
        }
    }

    return adjacentNumbers;
}

// async function runner() {
//     const data = await reader.readFile(dataFilePath);
//
//     console.time();
//
//     const lines = data.map(parseLine);
//
//     let total = 0;
//     for (let i = 0; i < lines.length; i++) {
//         let currentNumber = '';
//         let symbolAdjacent = false;
//         for (let j = 0; j < lines[0].length; j++) {
//             const char = lines[i][j];
//             if (isDigit(char)) {
//                 currentNumber += char;
//                 if (symbolIsAdjacent(i, j, lines)) {
//                     symbolAdjacent = true;
//                 }
//             }
//             else {
//                 if (currentNumber.length !== 0 && symbolAdjacent) {
//                     total += Number.parseInt(currentNumber);
//                 }
//                 currentNumber = '';
//                 symbolAdjacent = false;
//             }
//         }
//     }
//
//     console.timeEnd();
//
//     console.log(total);
// }

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const lines = data.map(parseLine);

    let total = 0;
    const numbers = [];
    for (let i = 0; i < lines.length; i++) {
        let currentNumber = '';
        for (let j = 0; j < lines[0].length; j++) {
            const char = lines[i][j];
            if (isDigit(char)) {
                currentNumber += char;
            }
            else {
                if (currentNumber.length !== 0) {
                    const numberObject = {
                        line: i,
                        start: j - currentNumber.length,
                        end: j - 1,
                        value: Number.parseInt(currentNumber)
                    };
                    numbers.push(numberObject);
                }
                currentNumber = '';
            }
        }
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[0].length; j++) {
            const char = lines[i][j];
            if (char === '*') {
                const adjacentNumbers = findAdjacentNumbers(i, j, numbers);
                if (adjacentNumbers.length === 2) {
                    const gearRatio = adjacentNumbers[0] * adjacentNumbers[1];
                    total += gearRatio;
                }
            }
        }
    }


    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
