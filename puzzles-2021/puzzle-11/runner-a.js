'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data) {
  const rows = [];
  for (const line of data) {
    const stringData = line.split('');
    const row = stringData.map(x => parseInt(x));
    rows.push(row);
  }
  return rows;
}

function increaseEnergy(map) {
  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      row[j] = row[j] + 1;
    }
  }
}

function countFlashes(map) {
  let flashes = 0;
  const allPlusPoints = [];
  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] >= 10) {
        row[j] = -1;
        flashes++;
        const plusPoints = getNeighborPoints({ x: j, y: i });
        allPlusPoints.push(...plusPoints);
      }
    }
  }

  if (allPlusPoints.length > 0) {
    for (const point of allPlusPoints) {
      if (pointOnMap(map, point)) {
        if (map[point.y][point.x] !== -1) {
          map[point.y][point.x] = map[point.y][point.x] + 1;
        }
      }
    }

    const newFlashes = countFlashes(map);
    flashes += newFlashes;
  }

  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] === -1) {
        row[j] = 0;
      }
    }
  }

  return flashes;
}

function pointOnMap(map, point) {
  return point.x >= 0 && point.x < map[0].length && point.y >= 0 && point.y < map.length;
}

function getNeighborPoints(point) {
  const points = [
    { x: point.x-1, y: point.y },
    { x: point.x+1, y: point.y },
    { x: point.x, y: point.y-1 },
    { x: point.x, y: point.y+1 },
    { x: point.x-1, y: point.y-1 },
    { x: point.x+1, y: point.y-1 },
    { x: point.x-1, y: point.y+1 },
    { x: point.x+1, y: point.y+1 }
  ];
  return points;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const map = parseData(data);

  let done = false;
  let i = 1;
  while (!done) {
    increaseEnergy(map);
    const flashes = countFlashes(map);
    if (flashes === 100) {
      console.log(`100 at step ${ i }`);
      done = true;
    }
    i++;
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
