'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const leftToken = '[';
const rightToken = ']';
const separator = ',';

function parseLine(line) {
    const lineTokens = line.split(' ');

    let value = {};
    if (lineTokens[0] === '$') {
        if (lineTokens[1] === 'cd') {
            value = {
                type: 'command',
                command: 'cd',
                param: lineTokens[2],
            };
        }
        else if (lineTokens[1] === 'ls') {
            value = {
                type: 'command',
                command: 'ls'
            };
        }
        else {
            throw new Error(`Unexpected command token: ${ lineTokens[1] }`)
        }
    }
    else {
        if (lineTokens[0] === 'dir') {
            value = {
                type: 'contents',
                contentType: 'directory',
                name: lineTokens[1]
            };
        }
        else {
            value = {
                type: 'contents',
                contentType: 'file',
                name: lineTokens[1],
                size: Number(lineTokens[0])
            }
        }
    }

    return value;
}

function parseData(data) {
    const values = [];
    for (const line of data) {
        const value = parseLine(line);
        values.push(value);
    }

    return values;
}

function processValue(value, rootNode, currentNode) {
    if (value.type === 'command') {
        if (value.command === 'cd') {
            if (value.param === '/') {
                return rootNode;
            }
            else if (value.param === '..') {
                if (currentNode.parent) {
                    return currentNode.parent;
                }
                else {
                    throw new Error('Cannot cd ..');
                }
            }
            else {
                let childNode = currentNode.childNodes.find(c => c.name === value.param);
                if (childNode === undefined) {
                    childNode = {
                        name: value.param,
                        parent: currentNode,
                        childNodes: [],
                        depth: currentNode.depth + 1
                    };
                    currentNode.childNodes.push(childNode);
                }
                return childNode;
            }
        }
    }
    else {
        if (value.contentType === 'directory') {
            let childNode = currentNode.childNodes.find(c => c.name === value.name);
            if (childNode === undefined) {
                childNode = {
                    type: 'directory',
                    name: value.name,
                    parent: currentNode,
                    childNodes: [],
                    depth: currentNode.depth + 1
                };
                currentNode.childNodes.push(childNode);
            }
            return currentNode;
        }
        else if (value.contentType === 'file') {
            let childNode = currentNode.childNodes.find(c => c.name === value.name);
            if (childNode === undefined) {
                childNode = {
                    type: 'file',
                    name: value.name,
                    parent: currentNode,
                    size: value.size
                };
                currentNode.childNodes.push(childNode);
            }
            return currentNode;
        }
    }

    return currentNode;
}

function buildTree(values) {
    const rootNode = {
        type: 'directory',
        name: '/',
        parent: null,
        childNodes: [],
        depth: 0
    };

    let currentNode = rootNode;

    for (const value of values) {
        currentNode = processValue(value, rootNode, currentNode);
    }


    return rootNode;
}

function computeDirectorySizes(node) {
    if (!node.size) {
        let size = 0;
        for (const child of node.childNodes) {
            if (child.type === 'directory') {
                size += computeDirectorySizes(child);
            }
            else if (child.type === 'file') {
                size += child.size;
            }
        }
        node.size = size;
    }

    return node.size;
}

function sumDirectoriesBelowMax(node, max) {
    let sum = 0;
    if (node.type === 'directory') {
        if (node.size <= max) {
            sum += node.size;
        }

        for (const child of node.childNodes) {
            if (child.type === 'directory') {
                sum += sumDirectoriesBelowMax(child, max);
            }
        }
    }

    return sum;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const parsedData = parseData(data);
    const tree = buildTree(parsedData);
    computeDirectorySizes(tree);

    const total = sumDirectoriesBelowMax(tree, 100000);

    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
