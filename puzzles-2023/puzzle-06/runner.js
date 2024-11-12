'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

function addVectors(a, b) {
    return a.map((e, i) => (b.length > i) ? e + b[i] : e);
}

function parseNumber(numberString) {
    const trimmedNumber = numberString.replaceAll(' ', '');
    return Number.parseInt(trimmedNumber);
}

function parseLine(line) {
    const start = line.indexOf(':');
    const numbers = line.slice(start + 1);
    return [parseNumber(numbers)];
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const raceTimes = parseLine(data[0]);
    const topDistances = parseLine(data[1]);

    let total = 1;
    for (let raceNumber = 0; raceNumber < raceTimes.length; raceNumber++) {
        let winDistanceCount = 0;
        for (let holdTime = 0; holdTime <= raceTimes[raceNumber]; holdTime++) {
            const moveTime = raceTimes[raceNumber] - holdTime;
            const distance = moveTime * holdTime;
            if (distance > topDistances[raceNumber]) {
                winDistanceCount++;
            }
        }
        total = total * winDistanceCount;
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
