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

function intersection(acc, itemArray) {
    // Convert to a set to remove duplicates
    const accSet = new Set(acc);
    return Array.from(accSet).filter(item => itemArray.includes(item));
}

function scoreItem(acc, item) {
    return acc + scoreTable.get(item);
}

function extractItems(str) {
    return [str.slice(0, str.length/2).split(''), str.slice(str.length/2).split('')];
}

function getPriority(items) {
    const commonItems = items.reduce(intersection);
    return commonItems.reduce(scoreItem, 0);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const contents = data.map(extractItems);
    const priorities = contents.map(getPriority);

    const totalPriorities = Array.prototype.reduce.call(priorities, sumElements);

    console.timeEnd();

    console.log(totalPriorities);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
