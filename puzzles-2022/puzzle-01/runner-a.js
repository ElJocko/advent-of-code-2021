'use strict';

const reader = require('../../lib/readIntegers');

const dataFilePath = './data.txt';

function solver(acc, elem) {
    if (Number.isNaN(elem)) {
        acc.result.push(acc.currentElf);
        acc.currentElf = [];
    }
    else {
        acc.currentElf.push(elem);
    }

    return acc;
}

function sumElements(acc, elem) {
    return acc + elem;
}

function maxElement(acc, elem) {
    return elem > acc ? elem : acc;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const elfCalories = data.reduce(solver, { result: [], currentElf: [] });

    const elfCaloriesSum = elfCalories.result.map(elem => elem.reduce(sumElements));

    const maxCalories = elfCaloriesSum.reduce(maxElement);

    console.timeEnd();

    console.log(maxCalories);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.log('runner() - Error: ' + err);
        process.exit(1);
    });
