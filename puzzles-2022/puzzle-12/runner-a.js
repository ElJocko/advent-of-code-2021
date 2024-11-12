'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const letterToInteger = new Map([
    ['S', 1], ['E', 26],
    ['a', 1],
    ['b', 2],
    ['c', 3],
    ['d', 4],
    ['e', 5],
    ['f', 6],
    ['g', 7],
    ['h', 8],
    ['i', 9],
    ['j', 10],
    ['k', 11],
    ['l', 12],
    ['m', 13],
    ['n', 14],
    ['o', 15],
    ['p', 16],
    ['q', 17],
    ['r', 18],
    ['s', 19],
    ['t', 20],
    ['u', 21],
    ['v', 22],
    ['w', 23],
    ['x', 24],
    ['y', 25],
    ['z', 26]
]);

function findSquare(map, char) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === char) {
                return { x, y };
            }
        }
    }

    return null;
}

function findSquares(map, value) {
    const squares = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === value) {
                squares.push({ x, y });
            }
        }
    }

    return squares;
}

function makeKey(square) {
    return `${ square.x }//${ square.y }`;
}

function squareIsOnMap(map) {
    return square =>
        square.x >= 0 &&
        square.x < map[0].length &&
        square.y >= 0 &&
        square.y < map.length;
}

function getAdjacentSquares(map, square) {
    const adjacentSquares = [
        { x: square.x - 1, y: square.y },
        { x: square.x + 1, y: square.y },
        { x: square.x, y: square.y - 1 },
        { x: square.x, y: square.y + 1 }
    ];

    return adjacentSquares.filter(squareIsOnMap(map));
}

function canMoveTo(map, fromSquare) {
    return toSquare => map[fromSquare.y][fromSquare.x] + 1 >= map[toSquare.y][toSquare.x];
}

function findNextSquares(map, visited, currentNode) {
    const adjacentSquares = getAdjacentSquares(map, currentNode.square);
    const notVisitedAdjacentSquares = adjacentSquares.filter(square => !visited.has(makeKey(square)));
    const legalMoveSquares = notVisitedAdjacentSquares.filter(canMoveTo(map, currentNode.square));

    legalMoveSquares.forEach(square => {
        visited.add(makeKey(square));
        const nextNode = { square, steps: currentNode.steps + 1, childNodes: [] }
        currentNode.childNodes.push(nextNode);
    });

    return currentNode.childNodes;
}

function findPath(map, start, end) {
    const visited = new Set();

    const tree = { square: start, steps: 0, childNodes: [] };
    visited.add(makeKey(tree.square));

    let currentNodes = [ tree ];
    while (currentNodes.length > 0) {
        const nextNodes = [];
        for (let i = 0; i < currentNodes.length; i++) {
            nextNodes.push(...findNextSquares(map, visited, currentNodes[i]));
        }

        const endNode = nextNodes.filter(node => node.square.x === end.x && node.square.y === end.y);
        if (endNode.length) {
            return endNode[0].steps;
        }
        else {
            currentNodes = nextNodes;
        }
    }

    return Number.MAX_VALUE;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const letterMap = data.map(row => row.split(''));
    const end = findSquare(letterMap, 'E');

    const map = letterMap.map(row => row.map(char => letterToInteger.get(char)));

    const startingSquares = findSquares(map, 1);

    const pathLengths = startingSquares.map(square => findPath(map, square, end));
    const shortestPathLength = pathLengths.reduce((acc, length) => Math.min(length, acc), Number.MAX_VALUE);

    console.timeEnd();

    console.log(shortestPathLength);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
