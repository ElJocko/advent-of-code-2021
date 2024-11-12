'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data) {
  const stringData = data.split(',');
  const timers = stringData.map(x => parseInt(x));
  return timers;
}

function convertToCounts(timers) {
  const timerCounts = [0,0,0,0,0,0,0,0,0];

  timers.reduce(function(acc, current) {
      acc[current]++;
      return acc;
    },
    timerCounts);

  return timerCounts;
}

function step(timers) {
  let newCount = 0;
  for (let i = 0; i < timers.length; i++) {
    if (timers[i] === 0) {
      timers[i] = 6;
      newCount++;
    }
    else {
      timers[i]--;
    }
  }
  for (let i = 0; i < newCount; i++) {
    timers.push(8);
  }
}

function stepCounts(timerCounts) {
  const newTimerCount = timerCounts[0];
  for (let i = 1; i <= 8; i++) {
    timerCounts[i-1] = timerCounts[i];
  }
  timerCounts[6] += newTimerCount;
  timerCounts[8] = newTimerCount;
}

function totalCounts(timerCounts) {
  let total = 0;
  for (let i = 0; i <= 8; i++) {
    total += timerCounts[i];
  }
  return total;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  let timers = parseData(data[0]);
  let timerCounts = convertToCounts(timers);

  // for (let day = 1; day < 81; day++) {
  //   step(timers);
  //   console.log(`# Lanternfish: ${ timers.length } on day ${ day }`);
  // }

  for (let day = 1; day < 257; day++) {
    stepCounts(timerCounts);
    console.log(`# Lanternfish: ${ totalCounts(timerCounts) } on day ${ day }`);
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
