'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseLine(line) {
    return line.slice(1, line.length - 1).split('');
}

function parseData(data) {
    return data.slice(1, data.length - 1).map(parseLine);
}

function makeKey(x, y) {
    if (typeof x === 'object') {
        const coord = x;
        return `${ coord.x }//${ coord.y }`;
    }
    else {
        return `${x}//${y}`;
    }
}

function unmakeKey(key) {
    const tokens = key.split('//');
    return { x: Number(tokens[0]), y: Number(tokens[1]) };
}

const right = '>';
const down = 'v';
const left = '<';
const up = '^';
const space = '.';

function makeIceMap(data) {
    const iceMap = new Map();
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[0].length; x++) {
            if (data[y][x] !== space) {
                iceMap.set(makeKey(x, y), [ data[y][x] ]);
            }
        }
    }
    return iceMap;
}

const iceMapCache = [];

function getIceMap(time, bounds) {
    if (time < 0) {
        throw new Error('cannot get iceMap, time less than 0');
    }

    if (iceMapCache.length > time) {
        return iceMapCache[time];
    }

    const prevIceMap = getIceMap(time - 1, bounds);

    const newIceMap = new Map();
    for (const entry of prevIceMap.entries()) {
        const coord = unmakeKey(entry[0]);
        const directions = entry[1];
        for (const direction of directions) {
            const newCoord = {};
            if (direction === right) {
                newCoord.x = coord.x + 1;
                if (newCoord.x > bounds.maxX) {
                    newCoord.x = bounds.minX;
                }
                newCoord.y = coord.y;
            } else if (direction === down) {
                newCoord.x = coord.x;
                newCoord.y = coord.y + 1;
                if (newCoord.y > bounds.maxY) {
                    newCoord.y = bounds.minY;
                }
            } else if (direction === left) {
                newCoord.x = coord.x - 1;
                if (newCoord.x < bounds.minX) {
                    newCoord.x = bounds.maxX;
                }
                newCoord.y = coord.y;
            } else if (direction === up) {
                newCoord.x = coord.x;
                newCoord.y = coord.y - 1;
                if (newCoord.y < bounds.minY) {
                    newCoord.y = bounds.maxY;
                }
            }

            const currentEntryAtNewCoord = newIceMap.get(makeKey(newCoord));
            if (currentEntryAtNewCoord) {
                currentEntryAtNewCoord.push(direction);
            } else {
                newIceMap.set(makeKey(newCoord), [direction]);
            }
        }
    }

    if (time === iceMapCache.length) {
        iceMapCache.push(newIceMap);
    }
    else {
        throw new Error('cannot add to iceMapCache!');
    }

    return newIceMap;
}

function isTileAllowed(coord, iceMap, bounds, startCoord) {
    if (coord.x === startCoord.x && coord.y === startCoord.y) {
        return true;
    }
    else if (coord.x < bounds.minX || coord.x > bounds.maxX || coord.y < bounds.minY || coord.y > bounds.maxY) {
        return false;
    }
    else {
        return !iceMap.has(makeKey(coord));
    }
}

function* nextMove(coord) {
    yield { x: coord.x + 1, y: coord.y };
    yield { x: coord.x - 1, y: coord.y };
    yield { x: coord.x, y: coord.y + 1 };
    yield { x: coord.x, y: coord.y - 1 };
    yield { x: coord.x, y: coord.y };
}

function findPath(startCoord, endCoord, bounds, startTime) {
    let currentTime = startTime;
    let positions = new Set();
    positions.add(makeKey(startCoord));
    while (true) {
        currentTime++;
        console.log(`currentTime = ${ currentTime } (${ positions.size })`);

        const newPositions = new Set();
        for (const coord of positions.values()) {
            const iceMap = getIceMap(currentTime, bounds);

            for (const nextCoord of nextMove(unmakeKey(coord))) {
                if (nextCoord.x === endCoord.x && nextCoord.y === endCoord.y) {
                    return currentTime;
                }

                if (isTileAllowed(nextCoord, iceMap, bounds, startCoord)) {
                    newPositions.add(makeKey(nextCoord));
                }
            }
        }

        positions = newPositions;
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const inputData = parseData(data);
    const iceMap = makeIceMap(inputData);

    const bounds = { minX: 0, maxX: inputData[0].length - 1, minY: 0, maxY: inputData.length - 1 }

    const startCoord = { x: 0, y: -1 };
    const endCoord = { x: bounds.maxX, y: bounds.maxY + 1 };

    iceMapCache.push(iceMap);

    const time1 = findPath(startCoord, endCoord, bounds, 0);
    const time2 = findPath(endCoord, startCoord, bounds, time1);
    const time3 = findPath(startCoord, endCoord, bounds, time2);

    console.timeEnd();

    console.log(time3);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
