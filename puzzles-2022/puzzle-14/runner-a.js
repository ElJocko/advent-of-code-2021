'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseLine(line) {
    const pointsText = line.split(' -> ').map(pairText => pairText.split(','));
    const points = pointsText.map(point => [Number(point[0]), Number(point[1])]);
    const lineSegments = [];
    for (let i = 0; i < points.length - 1; i++) {
        lineSegments.push([points[i], points[i+1]]);
    }

    return lineSegments;
}

function parseData(data) {
    const paths = data.map(parseLine);
    return paths.flat();
}

function makeKey(x, y) {
    return `${ x }//${ y }`;
}

function addToCave(cave) {
    return function(lineSegment) {
        const point1 = lineSegment[0];
        const point2 = lineSegment[1];
        if (point1[0] === point2[0]) {
            // vertical line segment
            const minY = Math.min(point1[1], point2[1]);
            const maxY = Math.max(point1[1], point2[1]);
            for (let y = minY; y < maxY + 1; y++) {
                cave.add(makeKey(point1[0], y));
            }
        }
        else if ( point1[1] === point2[1]) {
            // horizontal line segment
            const minX = Math.min(point1[0], point2[0]);
            const maxX = Math.max(point1[0], point2[0]);
            for (let x = minX; x < maxX + 1; x++) {
                cave.add(makeKey(x, point1[1]));
            }
        }
        else {
            throw new Error('line segment not horiz or vert');
        }
    }
}

function buildCave(lineSegments) {
    const cave = new Set();
    lineSegments.forEach(addToCave(cave));

    return cave;
}

function sand(point, cave, maxY) {
    if (point[1] > maxY) {
        return true;
    }

    let pDown = [point[0], point[1] + 1];
    let pLeft = [point[0] - 1, point[1] + 1];
    let pRight = [point[0] + 1, point[1] + 1];

    if (!cave.has(makeKey(...pDown))) {
        return sand(pDown, cave, maxY);
    }
    else if (!cave.has(makeKey(...pLeft))) {
        return sand(pLeft, cave, maxY);
    }
    else if (!cave.has(makeKey(...pRight))) {
        return sand(pRight, cave, maxY);
    }
    else {
        // blocked
        cave.add(makeKey(point[0], point[1]));
        return false;
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const lineSegments = parseData(data);
    const cave = buildCave(lineSegments);

    const maxY = lineSegments.reduce((acc, currentValue) => Math.max(acc, ...currentValue.map(point => point[1])), 0);
    let done = false;
    let sandCount = 0;
    while (!done) {
        let sandPoint = [500, 0];
        done = sand(sandPoint, cave, maxY);
        sandCount++;
    }

    console.timeEnd();

    console.log(sandCount - 1);

}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
