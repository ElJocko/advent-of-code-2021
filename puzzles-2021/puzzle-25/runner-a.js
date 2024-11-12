'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

const eastbound = '>';
const southbound = 'v';
const empty = '.';

function parseData(data) {
  const rows = [];
  for (const line of data) {
    const row = line.split('');
    rows.push(row);
  }

  return rows;
}

function makeEmptyMap(width, height) {
  const map = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(empty);
    }
    map.push(row);
  }

  return map;
}

function nextEastCoord(map, x, y) {
  const nextX = x + 1;
  if (nextX < map[0].length) {
    return { nextX, nextY: y };
  }
  else {
    return { nextX: 0, nextY: y };
  }
}

function nextSouthCoord(map, x, y) {
  const nextY = y + 1;
  if (nextY < map.length) {
    return { nextX: x, nextY };
  }
  else {
    return { nextX: x, nextY: 0 };
  }
}

function moveSeaCucumbers(map) {
  const eastMap = makeEmptyMap(map[0].length, map.length);
  let moveCount = 0;

  // Move eastbound sea cucumbers
  for (let x = 0; x < map[0].length; x++){
    for (let y = 0; y < map.length; y++) {
      if (map[y][x] === eastbound) {
        const { nextX, nextY } = nextEastCoord(map, x, y);
        if (map[nextY][nextX] === empty) {
          eastMap[nextY][nextX] = eastbound;
          moveCount++;
        }
        else {
          eastMap[y][x] = eastbound;
        }
      }
      else if (map[y][x] === southbound) {
        eastMap[y][x] = southbound;
      }
    }
  }

  const southMap = makeEmptyMap(map[0].length, map.length);

  // Move southbound sea cucumbers
  for (let x = 0; x < map[0].length; x++){
    for (let y = 0; y < map.length; y++) {
      if (eastMap[y][x] === southbound) {
        const { nextX, nextY } = nextSouthCoord(map, x, y);
        if (eastMap[nextY][nextX] === empty) {
          southMap[nextY][nextX] = southbound;
          moveCount++;
        }
        else {
          southMap[y][x] = southbound;
        }
      }
      else if (eastMap[y][x] === eastbound) {
        southMap[y][x] = eastbound;
      }
    }
  }

  return { moveCount, map: southMap };
}

function printMap(map) {
  for (let i = 0; i < map.length; i++) {
    console.log(map[i].join(''));
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const initialMap = parseData(data);

  let map = initialMap;
  let moveCount;
  let steps = 0;
  while (moveCount !== 0) {
    moveCount = 0;
    steps++;

    const move = moveSeaCucumbers(map);
    moveCount = move.moveCount;
    map = move.map;

    console.log(moveCount);
    //printMap(map);
  }

  console.log(steps);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
