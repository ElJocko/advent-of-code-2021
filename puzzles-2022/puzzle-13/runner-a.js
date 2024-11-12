'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const leftToken = '[';
const rightToken = ']';
const separator = ',';

function parseLine(line) {
    const lineTokens = line.split('');
    if (lineTokens.length === 0) {
        return null;
    }

    const rootNode = {
        parent: null,
        depth: 0,
        childNodes: []
    };
    const firstToken = lineTokens.shift();
    if (firstToken !== leftToken) {
        throw new Error(`Error at start: ${ firstToken }`);
    }

    let currentNode = rootNode;

    for (const token of lineTokens) {
        if (token === leftToken) {
            const newNode = {
                parent: currentNode,
                depth: currentNode.depth + 1,
                childNodes: []
            };
            currentNode.childNodes.push(newNode);
            currentNode = newNode;
        }
        else if (token === rightToken) {
            if (currentNode.parent) {
                currentNode = currentNode.parent;
            }
            else {
                // Should be back to root
            }
        }
        else if (token === separator) {
            // noop
        }
        else {
            if (token === 'X') {
                const newNode = {
                    parent: currentNode,
                    depth: currentNode.depth + 1,
                    value: 10,
                    leaf: true
                };
                currentNode.childNodes.push(newNode);
            }
            else {
                const newNode = {
                    parent: currentNode,
                    depth: currentNode.depth + 1,
                    value: parseInt(token),
                    leaf: true
                };
                currentNode.childNodes.push(newNode);
            }
        }
    }

    return rootNode;
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

function parseData(data) {
    const packets = [];
    for (const line of data) {
        const packet = parseLine(line);
        if (packet) {
            packets.push(packet);
        }
    }

    return packets.reduce(splitArray(2), [[]]);
}

function compareNodes(leftNode, rightNode) {
    if (leftNode.leaf && rightNode.leaf) {
        if (leftNode.value < rightNode.value) {
            return 'correct';
        }
        else if (leftNode.value > rightNode.value) {
            return 'incorrect';
        }
        else {
            return 'continue';
        }
    }
    else if (!leftNode.leaf && !rightNode.leaf) {
        let result = 'continue';
        let index = 0;
        while (result === 'continue') {
            if (leftNode.childNodes.length > index && rightNode.childNodes.length > index) {
                result = compareNodes(leftNode.childNodes[index], rightNode.childNodes[index]);
            }
            else if (leftNode.childNodes.length > index && rightNode.childNodes.length <= index) {
                result = 'incorrect';
            }
            else if (leftNode.childNodes.length <= index && rightNode.childNodes.length > index) {
                result = 'correct';
            }
            else {
                break;
            }
            index++;
        }
        return result;
    }
    else if (leftNode.leaf && !rightNode.leaf) {
        const newNode = {
            parent: leftNode.parent,
            depth: leftNode.depth + 1,
            childNodes: [ leftNode ]
        };
        return compareNodes(newNode, rightNode);
    }
    else if (!leftNode.leaf && rightNode.leaf) {
        const newNode = {
            parent: rightNode.parent,
            depth: rightNode.depth + 1,
            childNodes: [ rightNode ]
        };
        return compareNodes(leftNode, newNode);
    }
    else {
        throw new Error('cannot compare nodes');
    }
}

function isPairCorrectlyOrdered(pair) {
    let leftNode = pair[0];
    let rightNode = pair[1];

    return compareNodes(leftNode, rightNode);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const packetPairs = parseData(data);
    const results = packetPairs.map(isPairCorrectlyOrdered);

    const sum = results.reduce((acc, result, index) => result === 'correct' ? acc + index + 1 : acc, 0);

    console.timeEnd();

    console.log(sum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
