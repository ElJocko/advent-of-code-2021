'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

// const monkeyList = [
//     {
//         items: [79, 98],
//         operation: {op: 'mult', value: 19},
//         divisor: 23,
//         throwTo: [2, 3],
//         inspectCount: 0
//     },
//     {
//         items: [54, 65, 75, 74],
//         operation: {op: 'add', value: 6},
//         divisor: 19,
//         throwTo: [2, 0],
//         inspectCount: 0
//     },
//     {
//         items: [79, 60, 97],
//         operation: {op: 'mult', value: 'self'},
//         divisor: 13,
//         throwTo: [1, 3],
//         inspectCount: 0
//     },
//     {
//         items: [74],
//         operation: {op: 'add', value: 3},
//         divisor: 17,
//         throwTo: [0, 1],
//         inspectCount: 0
//     }];

const monkeyList = [
    {
        items: [52, 60, 85, 69, 75, 75],
        operation: {op: 'mult', value: 17},
        divisor: 13,
        throwTo: [6, 7],
        inspectCount: 0
    },
    {
        items: [96, 82, 61, 99, 82, 84, 85],
        operation: {op: 'add', value: 8},
        divisor: 7,
        throwTo: [0, 7],
        inspectCount: 0
    },
    {
        items: [95, 79],
        operation: {op: 'add', value: 6},
        divisor: 19,
        throwTo: [5, 3],
        inspectCount: 0
    },
    {
        items: [88, 50, 82, 65, 77],
        operation: {op: 'mult', value: 19},
        divisor: 2,
        throwTo: [4, 1],
        inspectCount: 0
    },
    {
        items: [66, 90, 59, 90, 87, 63, 53, 88],
        operation: {op: 'add', value: 7},
        divisor: 5,
        throwTo: [1, 0],
        inspectCount: 0
    },
    {
        items: [92, 75, 62],
        operation: {op: 'mult', value: 'self'},
        divisor: 3,
        throwTo: [3, 4],
        inspectCount: 0
    },
    {
        items: [94, 86, 76, 67],
        operation: {op: 'add', value: 1},
        divisor: 11,
        throwTo: [5, 2],
        inspectCount: 0
    },
    {
        items: [57],
        operation: {op: 'add', value: 2},
        divisor: 17,
        throwTo: [6, 2],
        inspectCount: 0
    }];

function adjustItem(item, operation, monkeyList) {
    const worryFactor = 1;
    const remainders = [];
    for (let i = 0; i < item.length; i++) {
        const oldRemainder = item[i];
        if (operation.op === 'add') {
            remainders.push(Math.floor((oldRemainder + operation.value) / worryFactor)%monkeyList[i].divisor);
        } else if (operation.value === 'self') {
            remainders.push(Math.floor((oldRemainder * oldRemainder) / worryFactor)%monkeyList[i].divisor);
        } else {
            remainders.push(Math.floor((oldRemainder * operation.value) / worryFactor)%monkeyList[i].divisor);
        }
    }
    return remainders;
}

function monkeyInspects(index, monkeyList) {
    const monkey = monkeyList[index];
    while (monkey.items.length) {
        const item = monkey.items.shift();
        const newItem = adjustItem(item, monkey.operation, monkeyList);
        if (newItem[index]%monkey.divisor === 0) {
            // console.log(`Monkey ${ index } throwing item to Monkey ${ monkey.throwTo[0] }`);
            monkeyList[monkey.throwTo[0]].items.push(newItem);
        }
        else {
            // console.log(`Monkey ${ index } throwing item to Monkey ${ monkey.throwTo[1] }`);
            monkeyList[monkey.throwTo[1]].items.push(newItem);
        }
        monkey.inspectCount++;
    }
}

function prepMonkeys(monkeyList) {
    // Convert items to remainders
    for (const monkey of monkeyList) {
        const oldItems = monkey.items;
        monkey.items = [];
        for (const item of oldItems) {
            const remainders = [];
            monkey.items.push(remainders);
            for (const testingMonkey of monkeyList) {
                remainders.push(item%testingMonkey.divisor);
            }
        }
    }
}

async function runner() {
    console.time();

    prepMonkeys(monkeyList);

    for (let round = 0; round < 10000; round++) {
        // console.log(`\nRound ${ round }`);
        const itemCounts = monkeyList.map(monkey => monkey.items.length);
        // console.log(itemCounts);
        for (let i = 0; i < monkeyList.length; i++) {
            monkeyInspects(i, monkeyList);
        }
    }

    for (const monkey of monkeyList) {
        console.log(monkey.inspectCount);
    }

    console.timeEnd();
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
