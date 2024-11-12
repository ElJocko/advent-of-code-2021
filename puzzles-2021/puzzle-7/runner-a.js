'use strict';

const simpleStats = require('simple-statistics');
const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data) {
  const stringData = data.split(',');
  const timers = stringData.map(x => parseInt(x));
  return timers;
}

function calculateFuelCost1(positions, toPosition) {
  let cost = 0;
  for (const pos of positions) {
    cost += Math.abs(pos - toPosition);
  }

  return cost;
}

function calculateFuelCost2(positions, toPosition) {
  let cost = 0;
  for (const pos of positions) {
    const distance =  Math.abs(pos - toPosition);
    const posCost = (distance * (distance + 1)) / 2;
    cost += posCost;
  }

  return cost;
}

function findMinCost2(positions, startPos) {
  const cost1 = calculateFuelCost2(positions, startPos - 1);
  const cost2 = calculateFuelCost2(positions, startPos);
  const cost3 = calculateFuelCost2(positions, startPos + 1);

  if (cost1 > cost2 && cost3 > cost2) {
    return { minCost: cost2, pos: startPos };
  }
  else if (cost1 < cost2) {
    const newPos = startPos - 1;
    const { minCost, pos } = findMinCost2(positions, newPos);
    return { minCost, pos: newPos };
  }
  else {
    const newPos = startPos + 1;
    const { minCost, pos } = findMinCost2(positions, newPos);
    return { minCost, pos: newPos };
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const positions = parseData(data[0]);

  const median = simpleStats.median(positions);
  const medianCost = calculateFuelCost1(positions, median);

  let mean = simpleStats.mean(positions);
  mean = Math.round(mean);
  const { minCost, pos } = findMinCost2(positions, mean);

  console.log(`Total Fuel Cost (median): ${ medianCost } to position: ${ median }`);
  console.log(`Total Fuel Cost (mean): ${ minCost } to position: ${ pos }`);
  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
