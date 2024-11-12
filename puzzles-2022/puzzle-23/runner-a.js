'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const space = '.';
const elf = '#';

function makeKey(x, y) {
    return `${ x }//${ y }`;
}

function unmakeKey(key) {
    const tokens = key.split('//');
    return { x: Number(tokens[0]), y: Number(tokens[1]) };
}

function parseMapLine(line) {
    return line.split('');
}

function parseData(data) {
    const map = data.map(parseMapLine);
    const elfMap = new Map();
    let elfId = 0;
    for (let y = 0 ; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === elf) {
                elfMap.set(makeKey(x, y), elfId);
                elfId++;
            }
        }
    }

    return elfMap;
}

function getAllCoords(elfCoord) {
    return [
        { x: elfCoord.x - 1, y: elfCoord.y - 1 },
        { x: elfCoord.x, y: elfCoord.y - 1 },
        { x: elfCoord.x + 1, y: elfCoord.y - 1 },
        { x: elfCoord.x - 1, y: elfCoord.y },
        { x: elfCoord.x + 1, y: elfCoord.y },
        { x: elfCoord.x - 1, y: elfCoord.y + 1 },
        { x: elfCoord.x, y: elfCoord.y + 1 },
        { x: elfCoord.x + 1, y: elfCoord.y + 1 }
    ];
}

function getNorthCoords(elfCoord) {
    return [
        { x: elfCoord.x - 1, y: elfCoord.y - 1 },
        { x: elfCoord.x, y: elfCoord.y - 1 },
        { x: elfCoord.x + 1, y: elfCoord.y - 1 }
    ];
}

function getSouthCoords(elfCoord) {
    return [
        { x: elfCoord.x - 1, y: elfCoord.y + 1 },
        { x: elfCoord.x, y: elfCoord.y + 1 },
        { x: elfCoord.x + 1, y: elfCoord.y + 1 }
    ];
}

function getWestCoords(elfCoord) {
    return [
        { x: elfCoord.x - 1, y: elfCoord.y - 1 },
        { x: elfCoord.x - 1, y: elfCoord.y },
        { x: elfCoord.x - 1, y: elfCoord.y + 1 }
    ];
}

function getEastCoords(elfCoord) {
    return [
        { x: elfCoord.x + 1, y: elfCoord.y - 1 },
        { x: elfCoord.x + 1, y: elfCoord.y },
        { x: elfCoord.x + 1, y: elfCoord.y + 1 }
    ];
}

function testNorth(elfCoord, elfMap) {
    const coords = getNorthCoords(elfCoord);
    if (coords.some(c => elfMap.has(makeKey(c.x, c.y)))) {
        return null;
    }
    else {
        return coords[1];
    }
}

function testSouth(elfCoord, elfMap) {
    const coords = getSouthCoords(elfCoord);
    if (coords.some(c => elfMap.has(makeKey(c.x, c.y)))) {
        return null;
    }
    else {
        return coords[1];
    }
}

function testWest(elfCoord, elfMap) {
    const coords = getWestCoords(elfCoord);
    if (coords.some(c => elfMap.has(makeKey(c.x, c.y)))) {
        return null;
    }
    else {
        return coords[1];
    }
}

function testEast(elfCoord, elfMap) {
    const coords = getEastCoords(elfCoord);
    if (coords.some(c => elfMap.has(makeKey(c.x, c.y)))) {
        return null;
    }
    else {
        return coords[1];
    }
}

const testFunctions = [ testNorth, testSouth, testWest, testEast ];
function proposeTile(elfKey, elfMap, round) {
    const elfCoord = unmakeKey(elfKey);

    const allCoords = getAllCoords(elfCoord);
    if (!allCoords.some(c => elfMap.has(makeKey(c.x, c.y)))) {
        return null;
    }

    for (let i = 0; i < 4; i++) {
        const test = (round + i)%4;
        const res = testFunctions[test](elfCoord, elfMap);
        if (res) {
            return res;
        }
    }

    return null;
}

function performRound(elfMap, round) {
    const proposedCoords = new Map();
    for (const elfKey of elfMap.keys()) {
        const coord = proposeTile(elfKey, elfMap, round);
        if (coord) {
            let count = proposedCoords.get(makeKey(coord.x, coord.y));
            if (count) {
                count++;
            } else {
                count = 1;
            }
            proposedCoords.set(makeKey(coord.x, coord.y), count);
        }
    }

    const newElfMap = new Map();
    let elfMoved = false;
    for (const elfKey of elfMap.keys()) {
        const elfId = elfMap.get(elfKey);
        const coord = proposeTile(elfKey, elfMap, round);
        if (coord) {
            const count = proposedCoords.get(makeKey(coord.x, coord.y));
            if (count === 1) {
                newElfMap.set(makeKey(coord.x, coord.y), elfId);
                elfMoved = true;
            }
            else {
                newElfMap.set(elfKey, elfId);
            }
        }
        else {
            newElfMap.set(elfKey, elfId);
        }
    }

    newElfMap.elfMoved = elfMoved;
    return newElfMap;
}

function elfArea(elfMap) {
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;
    for (const elfKey of elfMap.keys()) {
        const coord = unmakeKey(elfKey);
        minX = Math.min(minX, coord.x);
        maxX = Math.max(maxX, coord.x);
        minY = Math.min(minY, coord.y);
        maxY = Math.max(maxY, coord.y);
    }
    return (maxX - minX + 1) * (maxY - minY + 1);
}

function printMap(elfMap) {
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    for (const elfKey of elfMap.keys()) {
        const coord = unmakeKey(elfKey);
        minX = Math.min(minX, coord.x);
        maxX = Math.max(maxX, coord.x);
        minY = Math.min(minY, coord.y);
        maxY = Math.max(maxY, coord.y);
    }

    for (let y = minY ; y <= maxY; y++) {
        let line = '';
        for (let x = minX; x <= maxX; x++) {
            line = line + (elfMap.has(makeKey(x, y)) ? elf : space);
        }
        console.log(line);
    }
    console.log();
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    let elfMap = parseData(data);

    // printMap(elfMap);

    let i = 0;
    while (true) {
        elfMap = performRound(elfMap, i);
        i++;
        if (!elfMap.elfMoved) {
            break;
        }
        // console.log(i+1);
        // printMap(elfMap);
    }
    // const result = elfArea(elfMap) - elfMap.size;

    console.timeEnd();

    console.log(i);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
