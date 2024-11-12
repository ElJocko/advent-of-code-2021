'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data) {
  const chunks = data[0].slice(15).split(',');
  const xRange = chunks[0].split('..');
  const yRange = chunks[1].slice(3).split('..');

  const targetArea = {
    xRange: {
      min: parseInt(xRange[0]),
      max: parseInt(xRange[1])
    },
    yRange: {
      min: parseInt(yRange[0]),
      max: parseInt(yRange[1])
    }
  }
  return targetArea;
}

function pointInTargetRange(point, targetRange) {
  return point.x >= targetRange.xRange.min && point.x <= targetRange.xRange.max && point.y >= targetRange.yRange.min && point.y <= targetRange.yRange.max;
}

function pointExceedsBounds (point, targetRange) {
  return point.x > targetRange.xRange.max || point.y < targetRange.yRange.min;
}

function simulate(initialVector, targetRange) {
  const vector = {
    dx: initialVector.dx,
    dy: initialVector.dy
  };
  const point = { x: 0, y: 0 };

  while (true) {
    // Move the point
    point.x += vector.dx;
    point.y += vector.dy;

    if (pointInTargetRange(point, targetRange)) {
      return initialVector;
    }
    else if (pointExceedsBounds(point, targetRange)) {
      return null;
    }

    // Adjust the velocity
    if (vector.dx > 0) {
      vector.dx = vector.dx -1;
    }
    vector.dy = vector.dy - 1;
  }

}

async function runner() {
  const data = await reader.readFile(dataFilePath);

  console.time();

  const targetArea = parseData(data);

  const successfulInitialVectors = [];
  for (let x = 1; x <= targetArea.xRange.max; x++) {
    for (let y = targetArea.yRange.min; y <= (targetArea.yRange.min * -1); y++) {
      const initialVector = { dx: x, dy: y };
      if (simulate(initialVector, targetArea)) {
        successfulInitialVectors.push(initialVector);
      }
    }
  }

  console.timeEnd();

  console.log(successfulInitialVectors.length);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
