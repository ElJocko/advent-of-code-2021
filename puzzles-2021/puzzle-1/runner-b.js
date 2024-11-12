'use strict';

const reader = require('../../lib/readIntegers');

const dataFilePath = './data.txt';

async function runner() {
  const data = await reader.readFile(dataFilePath);

  let count = 0;
  for (let i = 3; i < data.length; i++) {
    const previous = data[i - 1] + data[i-2] + data[i-3];
    const current = data[i] + data[i-1] + data[i-2];
    count = count + (current > previous ? 1 : 0);
  }

  console.log(count);
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
