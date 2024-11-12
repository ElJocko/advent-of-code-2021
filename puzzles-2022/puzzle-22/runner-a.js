'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parsePathLine(line) {
    const path = [];
    while (line.length > 0) {
        const index = line.search(/[RL]/);
        if (index === -1) {
            const distance = Number(line);
            path.push({ distance, direction: null });
            line = '';
        }
        else {
            const distance = Number(line.slice(0, index));
            const direction = line.charAt(index);
            path.push({distance, direction});
            line = line.slice(index + 1);
        }
    }

    return path;
}

function parseMapLine(line) {
    return line.split('');
}

function parseData(data) {
    const path = parsePathLine(data[0]);

    const map = data.slice(1).map(parseMapLine);
    map.xLength = map.reduce((acc, value) => Math.max(acc, value.length), 0);

    return { path, map };
}

const right = '>';
const down = 'v';
const left = '<';
const up = '^';
const facingCodes = [right, down, left, up];
function decodeFacing(facing) {
    return facingCodes.indexOf(facing);
}

function getStartPos(map) {
    const index = map[0].indexOf('.');
    return { x: index, y: 0, facing: '>' };
}

const facingDelta = {
    '>': { x: 1, y: 0 },
    'v': { x: 0, y: 1 },
    '<': { x: -1, y: 0 },
    '^': { x: 0, y: -1 }
};
function addDelta(pos, delta) {
    if (!pos) {
        throw new Error('bad pos');
    }
    else if (!delta) {
        throw new Error('bad delta');
    }

    return {
        x: pos.x + delta.x,
        y: pos.y + delta.y,
        facing: pos.facing
    }
}

const openTile = '.';
const wallTile = '#';
const nullTile = ' ';
function isTileOnMap(pos, map) {
    return (
        pos.x >= 0 && pos.y >= 0 &&
        pos.y < map.length && pos.x < map[pos.y].length &&
        map[pos.y][pos.x] !== nullTile
    );
}

function findFirstTileInColumn(map, column) {
    for (let y = 0; y < map.length; y++) {
        if (map[y][column] === openTile || map[y][column] === wallTile) {
            return y;
        }
    }
    throw new Error('did not find tile in column (findFirst)');
}

function findLastTileInColumn(map, column) {
    for (let y = map.length - 1; y >= 0; y--) {
        if (map[y][column] === openTile || map[y][column] === wallTile) {
            return y;
        }
    }
    throw new Error('did not find tile in column (findlast)');
}

function getNextPos(pos, map) {
    let nextPos;
    try {
        nextPos = addDelta(pos, facingDelta[pos.facing]);
    }
    catch (err) {
        console.log(err);
    }

    if (!isTileOnMap(nextPos, map)) {
        if (nextPos.facing === right) {
            nextPos.x = map[nextPos.y].findIndex(t => t === '.' || t === '#');
        }
        else if (nextPos.facing === left) {
            nextPos.x = map[nextPos.y].length - 1;
        }
        else if (nextPos.facing === down) {
            nextPos.y = findFirstTileInColumn(map, nextPos.x);
        }
        else if (nextPos.facing === up) {
            nextPos.y = findLastTileInColumn(map, nextPos.x);
        }
        else {
            throw new Error ('cannot get next pos, bad facing');
        }
    }

    if (map[nextPos.y][nextPos.x] === openTile) {
        return { nextPos, wall: false };
    }
    else if (map[nextPos.y][nextPos.x] === wallTile) {
        nextPos = pos;
        return { nextPos , wall: true };
    }
    else {
        throw new Error('unexpected next pos');
    }
}

const clockwise = 'R';
const counterclockwise = 'L';
function move(startPos, path, map) {
    let pos = startPos;
    for (let i = 0; i < path.distance; i++) {
        const { nextPos, wall } = getNextPos(pos, map);
        pos = nextPos;
        if (wall) {
            break;
        }
    }

    if (path.direction === clockwise) {
        const facingIndex = facingCodes.indexOf(pos.facing);
        pos.facing = facingCodes[(facingIndex + 1)%4];
    }
    else if (path.direction === counterclockwise) {
        const facingIndex = facingCodes.indexOf(pos.facing);
        pos.facing = facingCodes[(facingIndex + 3)%4];
    }

    return pos;
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const { path, map } = parseData(data);

    let pos = getStartPos(map);
    for (let i = 0; i < path.length; i++) {
        pos = move(pos, path[i], map);
        console.log(`x = ${ pos.x }, y = ${ pos.y }, facing = ${ pos.facing }`);
    }

    const result = ((pos.x + 1) * 4) + ((pos.y + 1) * 1000) + decodeFacing(pos.facing);

    console.timeEnd();

    console.log(result);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
