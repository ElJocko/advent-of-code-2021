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

function sand1(point, cave, floor) {
    let pDown = [point[0], point[1] + 1];
    let pLeft = [point[0] - 1, point[1] + 1];
    let pRight = [point[0] + 1, point[1] + 1];

    if (pDown[1] < floor && !cave.has(makeKey(...pDown))) {
        return sand1(pDown, cave, floor);
    }
    else if (pDown[1] < floor && !cave.has(makeKey(...pLeft))) {
        return sand1(pLeft, cave, floor);
    }
    else if (pDown[1] < floor && !cave.has(makeKey(...pRight))) {
        return sand1(pRight, cave, floor);
    }
    else {
        // blocked
        cave.add(makeKey(point[0], point[1]));
        return point;
    }
}

function sand2(point, cave, floor) {
    sand2.path = sand2.path ?? [];
    let currentPoint = sand2.path.length ? sand2.path.pop() : point;
    while (true) {
        let pDown = [currentPoint[0], currentPoint[1] + 1];
        let pLeft = [currentPoint[0] - 1, currentPoint[1] + 1];
        let pRight = [currentPoint[0] + 1, currentPoint[1] + 1];

        if (pDown[1] < floor && !cave.has(makeKey(...pDown))) {
            sand2.path.push(currentPoint);
            currentPoint = pDown;
        }
        else if (pDown[1] < floor && !cave.has(makeKey(...pLeft))) {
            sand2.path.push(currentPoint);
            currentPoint = pLeft;
        }
        else if (pDown[1] < floor && !cave.has(makeKey(...pRight))) {
            sand2.path.push(currentPoint);
            currentPoint = pRight;
        }
        else {
            // blocked
            cave.add(makeKey(currentPoint[0], currentPoint[1]));
            return currentPoint;
        }
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);

    const lineSegments = data.map(parseLine).flat();

    const cave = buildCave(lineSegments);

    const maxY = lineSegments.reduce((acc, currentValue) => Math.max(acc, ...currentValue.map(point => point[1])), 0);
    let sandCount = 0;

    while (true) {
        let sandPoint = [500, 0];
        sandCount++;
        const finalPoint = sand2(sandPoint, cave, maxY + 2);

        if (sandPoint[0] === finalPoint[0] && sandPoint[1] === finalPoint[1]) {
            break;
        }
    }

    console.timeEnd();

    console.log(sandCount);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
