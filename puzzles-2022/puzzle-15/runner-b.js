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

function isPointWithinSensorRange(point, sensor) {
    return distance(sensor.sensorLoc, point) <= sensor.distanceToBeacon;
}

function parseLine(line) {
    const coords = line.split(',');
    const sensor = {
        sensorLoc: { x: Number(coords[0]), y: Number(coords[1]) },
        beaconLoc: { x: Number(coords[2]), y: Number(coords[3]) },
    };
    sensor.distanceToBeacon = distance(sensor.sensorLoc, sensor.beaconLoc);

    return sensor;
}

function parseData(data) {
    const paths = data.map(parseLine);
    return paths.flat();
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const sensors = parseData(data);

    const maxCoord = 4000000;

    for (const sensor of sensors) {
        let found;
        console.log(`testing sensor at ${ sensor.sensorLoc.x }, ${ sensor.sensorLoc.y }`);
        for (const point of pointsAtDistance(sensor.sensorLoc, sensor.distanceToBeacon + 1)) {
            if (point.x < 0 || point.x > maxCoord || point.y < 0 || point.y > maxCoord) {
                continue;
            }

            found = true;
            for (const otherSensor of sensors) {
                if (isPointWithinSensorRange(point, otherSensor)) {
                    found = false;
                    break;
                }
            }
            if (found) {
                console.log('*** FOUND POINT ***');
                console.log(point);
                console.log(point.x * 4000000 + point.y);
                break;
            }
        }

        if (found) {
            break;
        }
    }

    console.timeEnd();

}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
