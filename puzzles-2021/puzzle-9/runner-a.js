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

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const map = parseData(data);

  let total = 0;

  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      const height = row[j];
      const points = [];
      points.push({ x: j-1, y: i });
      points.push({ x: j+1, y: i });
      points.push({ x: j, y: i-1 });
      points.push({ x: j, y: i+1 });
      let minFound = true;
      for (const point of points) {
        if (point.x >= 0 && point.x < row.length && point.y >= 0 && point.y < map.length) {
          const pointHeight = map[point.y][point.x];
          if (pointHeight <= height) {
            minFound = false;
          }
        }
      }
      if (minFound) {
        total += (height + 1);
      }
    }
  }

  console.log(total);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
