'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data, key) {
    return data.map((v, index) => {
        return { value: Number(v * key), index }
    });
}

function getNewIndex(workingIndex, entry, length) {
    if (entry.value >= 0) {
        return (workingIndex + entry.value) % (length - 1);
    }
    else {
        let offsetIndex = workingIndex + entry.value;
        return (length - 1) - Math.abs(offsetIndex)%(length - 1);
    }
}

const decryptionKey = 811589153;
async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const inputData = parseData(data, decryptionKey);
    let workingData = inputData.slice();

    for (let i = 0; i < 10; i++) {
        for (const entry of inputData) {
            const startIndex = workingData.findIndex(e => e.index === entry.index);
            const finalIndex = getNewIndex(startIndex, entry, inputData.length);
            if (startIndex > finalIndex) {
                const part1 = workingData.slice(0, finalIndex);
                const part2 = [entry];
                const part3 = workingData.slice(finalIndex, startIndex);
                const part4 = workingData.slice(startIndex + 1);
                workingData = [...part1, ...part2, ...part3, ...part4];
            } else if (startIndex < finalIndex) {
                const part1 = workingData.slice(0, startIndex);
                const part2 = workingData.slice(startIndex + 1, finalIndex + 1);
                const part3 = [entry];
                const part4 = workingData.slice(finalIndex + 1);
                workingData = [...part1, ...part2, ...part3, ...part4];
            }

            // console.log(workingData.map(e => e.value));
        }
    }

    const zeroIndex = workingData.findIndex(e => e.value === 0);
    const coord1000 = workingData[(zeroIndex + 1000)%(workingData.length)];
    const coord2000 = workingData[(zeroIndex + 2000)%(workingData.length)];
    const coord3000 = workingData[(zeroIndex + 3000)%(workingData.length)];

    const sum = coord1000.value + coord2000.value + coord3000.value;

    console.timeEnd();

    console.log(sum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
