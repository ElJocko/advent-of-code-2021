'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function distance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function* pointsAtDistance(point, distance) {
    for (let x = 0; x <= distance; x++) {
        yield { x: point.x + x, y: point.y + (distance - x) };
        yield { x: point.x - x, y: point.y + (distance - x) };
        yield { x: point.x + x, y: point.y - (distance - x) };
        yield { x: point.x - x, y: point.y - (distance - x) };
    }
}

function* pointsWithinDistance(point, distance) {
    for (let d = 1; d <= distance; d++) {
        // Special cases where delta x or delta y is 0
        yield { x: point.x, y: point.y + d };
        yield { x: point.x, y: point.y - d };
        yield { x: point.x + d, y: point.y };
        yield { x: point.x - d, y: point.y };

        for (let x = 1; x < d; x++) {
            yield { x: point.x + x, y: point.y + (d - x) };
            yield { x: point.x - x, y: point.y + (d - x) };
            yield { x: point.x + x, y: point.y - (d - x) };
            yield { x: point.x - x, y: point.y - (d - x) };
        }
    }
}

function* pointsWithinDistanceInRow(point, distance, row) {
    const distanceToRow = Math.abs(point.y - row);
    const maxXDelta = distance - distanceToRow;
    const minX = point.x - maxXDelta;
    const maxX = point.x + maxXDelta;
    for (let x = minX; x <= maxX; x++) {
        yield { x, y: row };
    }
}

function parseLine(line) {
    const coords = line.split(',');
    const sensor = {
        sensorLoc: { x: Number(coords[0]), y: Number(coords[1]) },
        beaconLoc: { x: Number(coords[2]), y: Number(coords[3]) }
    };

    return sensor;
}

function parseData(data) {
    const paths = data.map(parseLine);
    return paths.flat();
}

function makeKey(point) {
    return `${ point.x }//${ point.y }`;
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const sensors = parseData(data);

    const sensorSet = new Set();
    for (const sensor of sensors) {
        sensorSet.add(makeKey(sensor.sensorLoc));
    }

    const beaconSet = new Set();
    for (const sensor of sensors) {
        beaconSet.add(makeKey(sensor.beaconLoc));
    }

    const rowSet = new Set();
    for (const sensor of sensors) {
        console.log(sensor.sensorLoc);
        const distanceToBeacon = distance(sensor.sensorLoc, sensor.beaconLoc);
        console.log(distanceToBeacon);
        for (const point of pointsWithinDistanceInRow(sensor.sensorLoc, distanceToBeacon, 2000000)) {
            if (!sensorSet.has(makeKey(point)) && !beaconSet.has(makeKey(point))) {
                rowSet.add(makeKey(point));
            }
        }
    }

    console.timeEnd();

    console.log(rowSet.size);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
