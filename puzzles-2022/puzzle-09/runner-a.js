'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function moveHead(direction, posH) {
    if (direction === 'U') {
        posH.y--;
    }
    else if (direction === 'D') {
        posH.y++;
    }
    else if (direction === 'L') {
        posH.x--;
    }
    else if (direction === 'R') {
        posH.x++;
    }
}

function moveTail(posH, posT) {
    const diffX = posH.x - posT.x;
    const diffY = posH.y - posT.y;
    if (diffX === 0) {
        if (diffY > 1) {
            posT.y++;
        }
        else if (diffY < -1) {
            posT.y--;
        }
    }
    else if (diffY === 0) {
        if (diffX > 1) {
            posT.x++;
        }
        else if (diffX < -1) {
            posT.x--;
        }
    }
    else if (diffX > 1) {
        posT.x++;
        if (diffY > 0) {
            posT.y++;
        }
        else {
            posT.y--;
        }
    }
    else if (diffX < -1) {
        posT.x--;
        if (diffY > 0) {
            posT.y++;
        }
        else {
            posT.y--;
        }
    }
    else if (diffY > 1) {
        posT.y++;
        if (diffX > 0) {
            posT.x++;
        }
        else {
            posT.x--;
        }
    }
    else if (diffY < -1) {
        posT.y--;
        if (diffX > 0) {
            posT.x++;
        }
        else {
            posT.x--;
        }
    }
}

function updatePos(move, positions, positionsVisited) {
    const lastPosition = positions[positions.length - 1];
    positionsVisited.add(`${ lastPosition.x }:${ lastPosition.y }`);

    for (let i = 0; i < move[1]; i++) {
        moveHead(move[0], positions[0]);
        for (let j = 1; j < positions.length; j++) {
            moveTail(positions[j-1], positions[j]);
        }
        positionsVisited.add(`${ lastPosition.x }:${ lastPosition.y }`);
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const moves = data.map(line => line.split(' '));

    const positionCount = 2;
    const positions = [];
    for (let i = 0; i < positionCount; i++) {
        positions.push({ x: 0, y: 0 });
    }

    const positionsVisited = new Set();

    moves.forEach(move => updatePos(move, positions, positionsVisited));

    console.timeEnd();

    console.log(positionsVisited.size);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
