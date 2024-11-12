'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function mostCommon(countOne, total) {
  return countOne >= (total / 2) ? '1' : '0';
}

function leastCommon(countOne, total) {
  return countOne < (total / 2) ? '1' : '0';
}

function findRating(data, pos, evaluate) {
  let count = 0;

  // How many have 1 in the first position?
  for (let i = 0; i < data.length; i++) {
    const string = data[i];
    const value = string[pos];
    if (value === '1') {
      count++;
    }
  }

  // Which is most common
  const mostCommon = evaluate(count, data.length);

  // Generate the new list
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    const string = data[i];
    const value = string[pos];
    if (value === mostCommon) {
      newData.push(string);
    }
  }

  return newData;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);

  let tempData = data.slice();
  for (let i = 0; i < data[0].length; i++) {
    tempData = findRating(tempData, i, mostCommon);
    if (tempData.length === 0) {
      console.log('Empty array while finding ox');
    }
    else if (tempData.length === 1) {
      break;
    }
  }

  const oxygenGeneratorRating = parseInt(tempData[0], 2);
  console.log(`Oxygen Generator Rating: ${ oxygenGeneratorRating } (${ tempData[0] })`);

  tempData = data.slice();
  for (let i = 0; i < data[0].length; i++) {
    tempData = findRating(tempData, i, leastCommon);
    if (tempData.length === 0) {
      console.log('Empty array while finding co2');
    }
    else if (tempData.length === 1) {
      break;
    }
  }

  const co2ScrubberRating = parseInt(tempData[0], 2);
  console.log(`CO2 Scrubber Rating: ${ co2ScrubberRating } (${ tempData[0] })`);

  const lifeSupportRating = oxygenGeneratorRating * co2ScrubberRating;
  console.log(`Life Support Rating: ${ lifeSupportRating }`);
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
