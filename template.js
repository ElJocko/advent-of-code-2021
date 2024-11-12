'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './sample.txt';

function parseLine(line) {
    return line;
}

function parseData(data) {
    return data.map(parseLine);
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const inputData = parseData(data);


    console.timeEnd();

}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
