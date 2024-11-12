'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parsePoint(pointString) {
  const points = pointString.split(',');
  const point = {
    x: parseInt(points[0]),
    y: parseInt(points[1])
  };

  return point;
}

function parseEntry(entry) {
  const entryParts = entry.split(' ');
  const lineSegment = {
    point1: parsePoint(entryParts[0]),
    point2: parsePoint((entryParts[2]))
  };

  return lineSegment;
}

function parseData(data) {
  const lineSegments = [];
  for (const entry of data) {
    const lineSegment = parseEntry(entry);
    lineSegments.push(lineSegment);
  }

  return lineSegments;
}

function makeKey(point) {
  const key = `${ point.x }|${ point.y}`;
  return key;
}

function setPoint(ventMap, point) {
  const key = makeKey(point);
  let ventCount = ventMap.get(key);
  if (ventCount) {
    ventCount++;
    ventMap.set(key, ventCount);
  }
  else {
    ventMap.set(key, 1);
  }
}

function verticalLineSegment(ventMap, lineSegment) {
  let start;
  let end;
  if (lineSegment.point1.y < lineSegment.point2.y) {
    start = lineSegment.point1.y;
    end = lineSegment.point2.y;
  }
  else {
    start = lineSegment.point2.y;
    end = lineSegment.point1.y;
  }
  for (let y = start; y < end + 1; y++) {
    const point = {
      x: lineSegment.point1.x,
      y
    }
    setPoint(ventMap, point);
  }
}

function horizontalLineSegment(ventMap, lineSegment) {
  let start;
  let end;
  if (lineSegment.point1.x < lineSegment.point2.x) {
    start = lineSegment.point1.x;
    end = lineSegment.point2.x;
  }
  else {
    start = lineSegment.point2.x;
    end = lineSegment.point1.x;
  }
  for (let x = start; x < end + 1; x++) {
    const point = {
      x,
      y: lineSegment.point1.y
    }
    setPoint(ventMap, point);
  }
}

function diagonalLineSegment(ventMap, lineSegment) {
  let dirX;
  if (lineSegment.point1.x < lineSegment.point2.x) {
    dirX = 1;
  }
  else {
    dirX = -1;
  }

  let dirY;
  if (lineSegment.point1.y < lineSegment.point2.y) {
    dirY = 1;
  }
  else {
    dirY = -1;
  }

  let diffX = Math.abs(lineSegment.point1.x - lineSegment.point2.x);
  let y = lineSegment.point1.y;
  for (let offset = 0; offset <= diffX; offset++) {
    const point = {
      x: lineSegment.point1.x + (offset * dirX),
      y
    }
    setPoint(ventMap, point);
    y += dirY;
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const lineSegments = parseData(data);

  const ventMap = new Map();
  for (const lineSegment of lineSegments) {
    if (lineSegment.point1.x === lineSegment.point2.x) {
      verticalLineSegment(ventMap, lineSegment);
    }
    else if (lineSegment.point1.y === lineSegment.point2.y) {
      horizontalLineSegment(ventMap, lineSegment);
    }
    else {
      // Should be diagonal at exactly 45 deg.
      const diffX = Math.abs(lineSegment.point1.x - lineSegment.point2.x);
      const diffY = Math.abs(lineSegment.point1.y - lineSegment.point2.y);
      if (diffX === diffY) {
        diagonalLineSegment(ventMap, lineSegment);
      }
      else {
        console.error('Not diagonal at 45 deg.!!!');
      }
    }
  }

  let dangerCount = 0;
  for (const value of ventMap.values()) {
    if (value >= 2) {
      dangerCount++;
    }
  }

  console.log(dangerCount);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
