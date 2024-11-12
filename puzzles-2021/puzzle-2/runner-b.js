'use strict';

const reader = require('../../lib/readTuples');

const dataFilePath = './data.txt';

async function runner() {
  const data = await reader.readFile(dataFilePath);

  let horizontalPos = 0;
  let depth = 0;
  let aim = 0;
  for (let i = 0; i < data.length; i++) {
    const tuple = data[i];
    const command = tuple[0];
    const size = Number.parseInt(tuple[1]);
    if (command === 'forward') {
      horizontalPos += size;
      depth += aim * size;
    }
    else if (command === 'down') {
      aim += size;
    }
    else if (command === 'up') {
      aim -= size;
    }
    else {
      console.log(`unknown command: ${ command }`);
    }
  }

  console.log(`horizontal position: ${ horizontalPos }`);
  console.log(`depth: ${ depth }`);
  console.log(`product: ${ horizontalPos * depth }`);
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
