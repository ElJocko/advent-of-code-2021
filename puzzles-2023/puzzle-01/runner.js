'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

function isDigit(char) {
    return char >= '0' && char <= '9';
}

const digitStrings = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine'
];

function getDigitChar(line) {
    for (let i = 0; i < 9; i++) {
        if (line.startsWith(digitStrings[i])) {
            return `${ i + 1}`;
        }
    }
}

function getCalibrationValue1(line) {
    let firstDigit;
    let lastDigit;
    for (const char of line) {
        if (isDigit(char)) {
            if (!firstDigit) {
                firstDigit = char;
            }
            lastDigit = char;
        }
    }
    return Number.parseInt(firstDigit + lastDigit);
}

function getCalibrationValue2(line) {
    let firstDigit;
    let lastDigit;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (isDigit(char)) {
            if (!firstDigit) {
                firstDigit = char;
            }
            lastDigit = char;
        }
        else {
            const digitChar = getDigitChar(line.slice(i));
            if (digitChar) {
                if (!firstDigit) {
                    firstDigit = digitChar;
                }
                lastDigit = digitChar;
            }
        }
    }
    return Number.parseInt(firstDigit + lastDigit);
}

async function runner(mapFunc) {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const totalCalibrationValues = data.map(mapFunc).reduce(sumElements);

    console.timeEnd();

    console.log(totalCalibrationValues);
}

runner(getCalibrationValue2)
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
