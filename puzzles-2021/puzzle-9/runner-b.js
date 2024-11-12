'use strict';

const _ = require('lodash');
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

function findHigherNeighbors(map, point) {
  //console.log(`findHigherNeighbors() x: ${ point.x } y: ${ point.y }`);
  const pointHeight = map[point.y][point.x];
  const neighborPoints = getNeighborPoints(point);
  const basinPoints = [];
  for (const neighborPoint of neighborPoints) {
    if (pointOnMap(map, neighborPoint)) {
      if (map[neighborPoint.y][neighborPoint.x] < 9) {
        const neighborHeight = map[neighborPoint.y][neighborPoint.x];
        if (pointHeight < neighborHeight) {
          const higherNeighborPoints = findHigherNeighbors(map, neighborPoint);
          basinPoints.push(neighborPoint);
          basinPoints.push(...higherNeighborPoints);
        }
      }
    }
  }

  return basinPoints;
}

function pointsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function pointOnMap(map, point) {
  return point.x >= 0 && point.x < map[0].length && point.y >= 0 && point.y < map.length;
}

function getNeighborPoints(point) {
  const points = [
    { x: point.x-1, y: point.y },
    { x: point.x+1, y: point.y },
    { x: point.x, y: point.y-1 },
    { x: point.x, y: point.y+1 }
  ];
  return points;
}

function findBasin(map, point) {
  //console.log(`findBasin() x: ${ point.x } y: ${ point.y }`);
  const neighborPoints = getNeighborPoints(point);
  const basinPoints = [point];
  for (const neighborPoint of neighborPoints) {
    if (pointOnMap(map, neighborPoint)) {
      if (map[neighborPoint.y][neighborPoint.x] < 9) {
        basinPoints.push(neighborPoint);

        const higherNeighborPoints = findHigherNeighbors(map, neighborPoint);
        basinPoints.push(...higherNeighborPoints);
      }
    }
  }

  const finalBasinPoints = _.uniqWith(basinPoints, pointsAreEqual);
  return finalBasinPoints;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const map = parseData(data);

  const minPoints = []

  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      const height = row[j];
      const basinPoint = { x: j, y: i };
      const neighbors = getNeighborPoints(basinPoint);
      let minFound = true;
      for (const point of neighbors) {
        if (pointOnMap(map, point)) {
          const pointHeight = map[point.y][point.x];
          if (pointHeight <= height) {
            minFound = false;
          }
        }
      }
      if (minFound) {
        minPoints.push({ x: j, y: i })
      }
    }
  }

  const basins = [];
  for (const minPoint of minPoints) {
    const basinPoints = findBasin(map, minPoint);
    basins.push(basinPoints);
  }

  basins.sort((a,b) => b.length - a.length);

  const total = basins[0].length * basins[1].length * basins[2].length;

  console.log(total);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
