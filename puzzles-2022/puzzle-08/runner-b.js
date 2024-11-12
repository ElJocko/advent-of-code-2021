'use strict';

const reader = require('../../lib/readStrings');
const _ = require("lodash");

const dataFilePath = './data.txt';

function arrayFromRange(start, stop, step) {
    return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
}

function taller(forest) {
    // return true if the height of the tree at [rowIndex][columnIndex] is greater than or equal to height
    return (height, rowIndex, columnIndex) => forest[rowIndex][columnIndex].height >= height;
}

function countTreesInRow(test, range, rowIndex, height) {
    if (range.length) {
        const index = range.findIndex(columnIndex => test(height, rowIndex, columnIndex));
        return index === -1 ? range.length : index + 1;
    }
    else {
        return 0;
    }
}

function countTreesInColumn(test, range, columnIndex, height) {
    if (range.length) {
        const index = range.findIndex(rowIndex => test(height, rowIndex, columnIndex));
        return index === -1 ? range.length : index + 1;
    }
    else {
        return 0;
    }
}

function computeScenicScore(forest, rowIndex) {
    return function(tree, columnIndex) {
        const tallerTree = taller(forest);

        // Look left
        const rangeLeft = arrayFromRange(columnIndex - 1, 0, -1);
        const left = countTreesInRow(tallerTree, rangeLeft, rowIndex, tree.height);

        // Look right
        const rangeRight = arrayFromRange(columnIndex + 1, forest[0].length - 1, 1);
        const right = countTreesInRow(tallerTree, rangeRight, rowIndex, tree.height);

        // Look up
        const rangeUp = arrayFromRange(rowIndex - 1, 0, -1);
        const up = countTreesInColumn(tallerTree, rangeUp, columnIndex, tree.height);

        // Look down
        const rangeDown = arrayFromRange(rowIndex + 1, forest.length - 1, 1);
        const down = countTreesInColumn(tallerTree, rangeDown, columnIndex, tree.height);

        tree.scenicScore = left * right * up * down;
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    // Convert the input data into a 2D array of tree objects
    const forest = data.map(row => row.split('').map(e => { return { height: Number(e) } }));

    // Compute the scenic score for each tree
    forest.forEach((row, rowIndex) => row.forEach(computeScenicScore(forest, rowIndex)));

    // Find the max scenic score
    const maxScenicScore = forest.reduce((rowMax, row) => Math.max(rowMax, row.reduce((columnMax, tree) => Math.max(columnMax, tree.scenicScore), 0)), 0);

    console.timeEnd();

    console.log(maxScenicScore);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
