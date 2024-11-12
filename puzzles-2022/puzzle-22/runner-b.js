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

const faceLength = 50;
const faceCoords = {
    A: { x: { min: faceLength, max: faceLength * 2 }, y: { min: 0, max: faceLength }},
    B: { x: { min: faceLength * 2, max: faceLength * 3 }, y: { min: 0, max: faceLength }},
    C: { x: { min: faceLength, max: faceLength * 2 }, y: { min: faceLength, max: faceLength * 2 }},
    D: { x: { min: 0, max: faceLength }, y: { min: faceLength * 2, max: faceLength * 3 }},
    E: { x: { min: faceLength, max: faceLength * 2 }, y: { min: faceLength * 2, max: faceLength * 3 }},
    F: { x: { min: 0, max: faceLength }, y: { min: faceLength * 3, max: faceLength * 4 }}
};

function isOnFace(pos, face) {
    return (
        pos.x >= faceCoords[face].x.min &&
        pos.x < faceCoords[face].x.max &&
        pos.y >= faceCoords[face].y.min &&
        pos.y < faceCoords[face].y.max
    )
}

function mapFace(pos) {
    if (isOnFace(pos, 'A')) {
        return 'A';
    }
    else if (isOnFace(pos, 'B')) {
        return 'B';
    }
    else if (isOnFace(pos, 'C')) {
        return 'C';
    }
    else if (isOnFace(pos, 'D')) {
        return 'D';
    }
    else if (isOnFace(pos, 'E')) {
        return 'E';
    }
    else if (isOnFace(pos, 'F')) {
        return 'F';
    }
    else {
        throw new Error('unknown face');
    }
}

function localToGlobal(localPos) {
    const globalPos = {
        x: localPos.pos.x + faceCoords[localPos.face].x.min,
        y: localPos.pos.y + faceCoords[localPos.face].y.min,
        facing: localPos.pos.facing
    };

    return globalPos;
}

function globalToLocal(globalPos) {
    const face = mapFace(globalPos);
    return {
        face,
        pos: {
            x: globalPos.x - faceCoords[face].x.min,
            y: globalPos.y - faceCoords[face].y.min,
            facing: globalPos.facing
        }
    };
}

const faceTransitions = [
    { startFace: 'A', startFacing: left, endFace: 'D', endFacing: right },
    { startFace: 'A', startFacing: up, endFace: 'F', endFacing: right },
    { startFace: 'B', startFacing: right, endFace: 'E', endFacing: left },
    { startFace: 'B', startFacing: down, endFace: 'C', endFacing: left },
    { startFace: 'B', startFacing: up, endFace: 'F', endFacing: up },
    { startFace: 'C', startFacing: right, endFace: 'B', endFacing: up },
    { startFace: 'C', startFacing: left, endFace: 'D', endFacing: down },
    { startFace: 'D', startFacing: left, endFace: 'A', endFacing: right },
    { startFace: 'D', startFacing: up, endFace: 'C', endFacing: right },
    { startFace: 'E', startFacing: right, endFace: 'B', endFacing: left },
    { startFace: 'E', startFacing: down, endFace: 'F', endFacing: left },
    { startFace: 'F', startFacing: right, endFace: 'E', endFacing: up },
    { startFace: 'F', startFacing: down, endFace: 'B', endFacing: down },
    { startFace: 'F', startFacing: left, endFace: 'A', endFacing: down }
];

function getNextPos(pos, map) {
    let nextPos;
    try {
        nextPos = addDelta(pos, facingDelta[pos.facing]);
    }
    catch (err) {
        console.log(err);
    }

    if (!isTileOnMap(nextPos, map)) {
        const startPosLocal = globalToLocal(pos);
        const transition = faceTransitions.find(t => t.startFace === startPosLocal.face && t.startFacing === pos.facing);
        const endPosLocal = { face: transition.endFace, pos: { facing: transition.endFacing }};
        if (transition.startFacing === left && transition.endFacing === right) {
            endPosLocal.pos.x = 0;
            endPosLocal.pos.y = (faceLength - 1) - startPosLocal.pos.y;
        }
        else if (transition.startFacing === right && transition.endFacing === left) {
            endPosLocal.pos.x = faceLength - 1;
            endPosLocal.pos.y = (faceLength - 1) - startPosLocal.pos.y;
        }
        else if (transition.startFacing === right && transition.endFacing === up) {
            endPosLocal.pos.x = startPosLocal.pos.y;
            endPosLocal.pos.y = faceLength - 1;
        }
        else if (transition.startFacing === left && transition.endFacing === down) {
            endPosLocal.pos.x = startPosLocal.pos.y;
            endPosLocal.pos.y = 0;
        }
        else if (transition.startFacing === down && transition.endFacing === down) {
            endPosLocal.pos.x = startPosLocal.pos.x;
            endPosLocal.pos.y = 0;
        }
        else if (transition.startFacing === down && transition.endFacing === left) {
            endPosLocal.pos.x = faceLength - 1;
            endPosLocal.pos.y = startPosLocal.pos.x;
        }
        else if (transition.startFacing === up && transition.endFacing === up) {
            endPosLocal.pos.x = startPosLocal.pos.x;
            endPosLocal.pos.y = faceLength - 1;
        }
        else if (transition.startFacing === up && transition.endFacing === right) {
            endPosLocal.pos.x = 0;
            endPosLocal.pos.y = startPosLocal.pos.x;
        }
        else {
            throw new Error('unknown transition');
        }

        nextPos = localToGlobal(endPosLocal);
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
