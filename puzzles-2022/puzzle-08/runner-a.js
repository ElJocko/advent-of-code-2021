'use strict';

const reader = require('../../lib/readStrings');
const _ = require("lodash");

const dataFilePath = './data.txt';

function rowVisibleCount(acc, tree) {
    return acc + (tree.visible ? 1 : 0);
}

function visibleCount(acc, row) {
    return acc + row.reduce(rowVisibleCount, 0);
}

function isVisible(acc, tree) {
    let maxHeight = acc;
    if (tree.height > maxHeight) {
        maxHeight = tree.height;
        tree.visible = true;
    }

    return maxHeight;
}

const columnHandler = {
    get(target, prop, receiver) {
        if (typeof prop === 'string') {
            if (prop === 'length') {
                return target.arr.length;
            } else {
                const rowIndex = Number(prop);
                if (Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < target.arr.length) {
                    return target.arr[rowIndex][target.columnIndex];
                }
            }
        }

        return Reflect.get(...arguments);
    },

    set (target, prop, value, receiver) {
        console.log(`set ${ prop }`);
    }
};

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const forest = data.map(row => row.split('').map(e => { return { height: Number(e), visible: false } }));

    forest.forEach(row => {
        row.reduce(isVisible, -1);
        row.reduceRight(isVisible, -1);
    });

    forest[0].forEach((tree, index) => {
        const column = { columnIndex: index, arr: forest };
        const columnProxy = new Proxy(column, columnHandler);
        const length = columnProxy.length;
        const firstTree = columnProxy[0];

        const _ = require('lodash');
        _.reduce(columnProxy, isVisible, -1);
        _.reduceRight(columnProxy, isVisible, -1);
        // Array.prototype.reduce.call(columnProxy, isVisible, -1);
    });

    const visibleTrees = forest.reduce(visibleCount, 0);

    console.timeEnd();

    console.log(visibleTrees);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
