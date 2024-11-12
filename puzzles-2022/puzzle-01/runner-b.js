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

function integersDescending(a, b) {
    return b - a;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const elfCalories = data.reduce(solver, { result: [], currentElf: [] });

    const elfCaloriesSum = elfCalories.result.map(elem => elem.reduce(sumElements));
    elfCaloriesSum.sort(integersDescending);

    const topThreeTotal = elfCaloriesSum.slice(0, 3).reduce(sumElements);

    console.timeEnd();

    console.log(topThreeTotal);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.log('runner() - Error: ' + err);
        process.exit(1);
    });
