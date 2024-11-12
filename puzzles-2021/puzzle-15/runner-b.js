'use strict';

const Denque = require('denque');
const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

function parseData(data) {
  const rows = [];
  for (const line of data) {
    const stringData = line.split('');
    const row = stringData.map(x => parseInt(x));
    rows.push(row);
  }
  return rows;
}

function duplicateTiles(map) {
  const newMap = [];
  for (let i = 0; i < 5; i++) {
    for (const row of map) {
      const newRow = [];
      for (let j = 0; j < 5; j++) {
        for (const value of row) {
          let newValue = value + i + j;
          if (newValue > 9) {
            newValue -= 9;
          }
          newRow.push(newValue);
        }
      }
      newMap.push(newRow);
    }
  }

  return newMap;
}

function makeKey(point) {
  return `${ point.x }|${ point.y }`;
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
    // { x: point.x-1, y: point.y-1 },
    // { x: point.x+1, y: point.y-1 },
    // { x: point.x-1, y: point.y+1 },
    // { x: point.x+1, y: point.y+1 }
  ];
  return points;
}

function getNeighbors(map, target) {
  let neighborPoints = getNeighborPoints(target.point);
  neighborPoints = neighborPoints.filter(p => pointOnMap(map, p));

  const neighborTargets = neighborPoints.map(p => {
    const cost = target.cost + map[p.y][p.x];
    return { point: p, path: [...target.path, target.point], cost };
  });

  return neighborTargets;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  let map = parseData(data);
  map = duplicateTiles(map);

  const start = { x: 0, y: 0 };
  const end = { x: map[0].length - 1, y: map.length - 1 };

  let stack = new Denque(null, { capacity: 500000 });
  stack.push({ point: start, path: [], cost: 0 });

  const bestPaths = new Map();
  bestPaths.set(makeKey(start), stack[0]);

  let i = 0;
  while(stack.length > 0) {
    i++;
    if (i%100000 === 0) {
      console.log(`${ i } stack: ${ stack.length }`);
      const stackArray = stack.toArray();
      stackArray.sort((a, b) => a.cost - b.cost);
      stack = new Denque(stackArray, { capacity: 500000 });
      console.log('sorted');
    }
    const nextTarget = stack.shift();

    let neighbors = getNeighbors(map, nextTarget);

    for (const n of neighbors) {
      const key = makeKey(n.point);
      const bestPath = bestPaths.get(key);
      if (!bestPath || bestPath.cost > n.cost) {
        bestPaths.set(key, n);
        stack.push(n);
      }
    }
  }

  const bestPathToEnd = bestPaths.get(makeKey(end));

  console.log(JSON.stringify(bestPathToEnd));

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
