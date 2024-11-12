'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseAssignment(assignment) {
    const range = assignment.split('-');
    return { start: Number(range[0]), end: Number(range[1])};
}

function hasSubset(rangeList) {
    function check(a1, a2) {
        return a1.start <= a2.start && a1.end >= a2.end;
    }

    return check(rangeList[0], rangeList[1]) || check(rangeList[1], rangeList[0]);
}

const movePattern = /^move (\d+) from (\d+) to (\d+)$/;
function extractMoves(input) {
    const match = input.match(movePattern);

    // Note: adjust stack to use 0-index
    return {
        count: match[1],
        from: match[2] - 1,
        to: match[3] - 1
    };
}

function applyMoves(stacks) {
    return function(move) {
        // Remove the crates from the first stack
        const moveStack = stacks[move.from].splice(stacks[move.from].length - move.count);
        moveStack.reverse();

        // Add the crates to the second stack
        stacks[move.to].push(...moveStack);
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    // Parse the data to get the stacks of crates
    let longestInput = 0;
    let inputRowCount = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].charAt(0) === '[') {
            data[i] = data[i].split('');
            longestInput = Math.max(longestInput, data[i].length);
        }
        else {
            inputRowCount = i;
            break;
        }
    }
    const crateStackCount = ((longestInput - 3) / 4) + 1;

    const stacks = Array(crateStackCount).fill().map(e => []);
    let outputRow = 0;
    for (let inputColumn = 1; inputColumn < longestInput; inputColumn+=4) {
        for (let inputRow = 0; inputRow < inputRowCount; inputRow++) {
            if (data[inputRow].length > inputColumn && data[inputRow][inputColumn] !== ' ') {
                stacks[outputRow].unshift(data[inputRow][inputColumn]);
            }
        }
        outputRow++;
    }

    // Parse the data to get the moves and apply moves
    const moves = data.slice(inputRowCount+2).map(extractMoves);
    moves.forEach(applyMoves(stacks));

    const result = stacks.reduce((acc, stack) => acc + stack[stack.length-1], '');

    console.timeEnd();

    console.log(result);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
