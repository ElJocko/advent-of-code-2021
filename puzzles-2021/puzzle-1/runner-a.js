'use strict';

const reader = require('../../lib/readIntegers');

const dataFilePath = './data.txt';

function solver(acc, current) {
  if (current > acc.previous) {
    acc.count++;
  }
  acc.previous = current;

  return acc;
}

function extractPairs(arr) {
  if (arr.length >= 2) {
    const remainder = extractPairs(arr.slice(1));
    return [[arr[0], arr[1]], ...remainder];
  }
  else {
    return [];
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);

  console.time();

  // const pairs = extractPairs(data);
  // const countFunc = pairs.reduce((acc, elem) => acc + (elem[1] > elem[0] ? 1 : 0), 0);
  //
  // console.timeLog();

  let countProc = 0;
  for (let i = 1; i < data.length; i++) {
    countProc = countProc + (data[i] > data[i - 1] ? 1 : 0);
  }

  console.timeEnd();

//  console.log(countFunc);
  console.log(countProc);
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
