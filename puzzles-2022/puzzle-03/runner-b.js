'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

const scoreTable = buildScoreTable();
function buildScoreTable() {
    const items = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const itemScores = items.split('').map((item, index) => [ item, index + 1 ]);
    return new Map(itemScores);
}

// Use to find intersection of an array of arrays (i.e., all items that occur in all sub-arrays)
function intersection(acc, itemArray) {
    // Convert to a set to remove duplicates
    const accSet = new Set(acc);
    return Array.from(accSet).filter(item => itemArray.includes(item));
}

function scoreItems(acc, item) {
    return acc + scoreTable.get(item);
}

function getPriority(items) {
    const commonItems = items.reduce(intersection);
    return commonItems.reduce(scoreItems, 0);
}

function splitArray(groupSize) {
    // Accumulator must be initialized to [[]]
    // Note that accumulator is mutated!
    return function (acc, value) {
        const lastGroup = acc[acc.length - 1];
        if (lastGroup.length < groupSize) {
            lastGroup.push(value);
        }
        else {
            acc.push([ value ]);
        }
        return acc;
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const contents = data.map((str) => str.split(''));
    const groupContents = contents.reduce(splitArray(3), [[]]);
    const priorities = groupContents.map(getPriority);
    const totalPriorities = priorities.reduce(sumElements);

    console.timeEnd();

    console.log(totalPriorities);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
