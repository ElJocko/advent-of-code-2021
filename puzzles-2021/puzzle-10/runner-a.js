'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const tokenSet = [
  { start: '(', end: ')', score: 3, completionScore: 1 },
  { start: '[', end: ']', score: 57, completionScore: 2 },
  { start: '{', end: '}', score: 1197, completionScore: 3 },
  { start: '<', end: '>', score: 25137, completionScore: 4 }
];

function findStart(token) {
  const tokenType = tokenSet.find(x => x.start === token);
  return tokenType;
}

function findEnd(token) {
  const tokenType = tokenSet.find(x => x.end === token);
  return tokenType;
}

function findLineScore(line) {
  const lineStack = [];
  const lineTokens = line.split('');

  for (const token of lineTokens) {
    let tokenType = findStart(token);
    if (tokenType) {
      lineStack.push(token);
    }
    else {
      tokenType = findEnd(token);
      if (!tokenType) {
        console.log('token not found!!!');
        throw new Error('token not found');
      }
      const startToken = lineStack.pop();
      if (startToken !== tokenType.start) {
        return tokenType.score;
      }
    }
  }

  return 0;
}

function findLineCompletionScore(line) {
  const lineStack = [];
  const lineTokens = line.split('');

  for (const token of lineTokens) {
    let tokenType = findStart(token);
    if (tokenType) {
      lineStack.push(token);
    }
    else {
      tokenType = findEnd(token);
      if (!tokenType) {
        console.log('token not found!!!');
        throw new Error('token not found');
      }
      const startToken = lineStack.pop();
      if (startToken !== tokenType.start) {
        // Error line
        return 0;
      }
    }
  }

  if (lineStack.length === 0) {
    return 0;
  }
  else {
    let score = 0;
    lineStack.reverse();
    for (const token of lineStack) {
      const tokenType = findStart(token);
      if (!tokenType) {
        console.log('token not found!!!');
        throw new Error('token not found');
      }
      score = (score * 5) + tokenType.completionScore;
    }

    console.log(`${ score } for tokens: ${ lineStack }`);
    return score;
  }
}

async function runner() {
  const testScore = findLineCompletionScore('<{([{{}}[<[[[<>{}]]]>[]]');


  const data = await reader.readFile(dataFilePath);

  let total = 0;
  for (const line of data) {
    total += findLineScore(line);
  }

  const completionScores = [];
  for (const line of data) {
    const completionScore = findLineCompletionScore(line);
    if (completionScore > 0) {
      completionScores.push(completionScore);
    }
  }

  completionScores.sort((a, b) => a - b);
  const medianCompletionScore = completionScores[((completionScores.length - 1) / 2)];

  console.log(total);
  console.log(medianCompletionScore);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
