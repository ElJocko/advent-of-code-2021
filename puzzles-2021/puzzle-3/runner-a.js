'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function evaluateReport(data) {
  // Initialize the accumulator
  const accum = [];
  for (let i = 0; i < data[0].length; i++) {
    accum.push(0);
  }

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    for (let j = 0; j < value.length; j++) {
      if (value[j] === '1') {
        accum[j] += 1;
      }
    }
  }

  return accum;
}

function generateResult(found, total) {
  return found >= (total / 2) ? '1' : '0';
}

async function runner() {
  const data = await reader.readFile(dataFilePath);

  const accum = evaluateReport(data);

  let gammaString = '';
  let epsilonString = '';
  for (let i = 0; i < data[0].length; i++) {
    const resG = generateResult(accum[i], data.length);
    const resE = resG === '0' ? '1' : '0';
    gammaString = gammaString + resG;
    epsilonString = epsilonString + resE;
  }

  const gamma = parseInt(gammaString, 2);
  const epsilon = parseInt(epsilonString, 2);

  console.log(gammaString, gamma);
  console.log(epsilonString, epsilon);

  console.log(gamma * epsilon);
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
