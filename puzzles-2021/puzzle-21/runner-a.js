'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

function parseData(data) {

}

let lastRoll = 0;
let rollCount = 0;
function deterministicDiceRoll() {
  let roll = lastRoll + 1;
  if (roll > 100) {
    roll = 1;
  }
  lastRoll = roll;
  rollCount++;
  return roll;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);

  let playersPos = [3, 10];
  let playersScore = [0, 0];

  const numPlayers = 2;

  let winner = -1;
  while (winner === -1) {
    for (let i = 0; i < numPlayers; i++) {
      const move = deterministicDiceRoll() + deterministicDiceRoll() + deterministicDiceRoll();
      const nextSpace = ((playersPos[i] + move) - 1)%10 + 1;
      playersPos[i] = nextSpace;
      playersScore[i] += nextSpace;

      if (playersScore[i] >= 1000) {
        // Winner!
        winner = i;
      }
    }
  }

  if (winner === 0) {
    console.log(playersScore[1] * rollCount);
  }
  else {
    console.log(playersScore[0] * rollCount);
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
