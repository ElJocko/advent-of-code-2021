'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parse(data) {
  const dots = [];
  const folds = [];

  let startFolds = false;
  for (const line of data) {
    if (!startFolds) {
      if (line.length > 0) {
        const chunks = line.split(',');
        const point = {
          x: parseInt(chunks[0]),
          y: parseInt(chunks[1])
        }
        dots.push(point);
      }
      else {
        startFolds = true;
      }
    }
    else {
      const chunk = line.substr(11);
      const direction = chunk.charAt(0);
      const position = parseInt(chunk.substr(2));
      const fold = { direction, position };
      folds.push(fold);
    }
  }

  return { dots, folds };
}

function reflectDot(dot, fold) {

  if (fold.direction === 'x') {
    if (dot.x > fold.position) {
      const diff = dot.x - fold.position;
      const newX = fold.position - diff;
      dot.x = newX;
    }
  }
  else {
    if (dot.y > fold.position) {
      const diff = dot.y - fold.position;
      const newY = fold.position - diff;
      dot.y = newY;
    }
  }
}

function makeKey(dot) {
  const key = `${ dot.x }|${ dot.y }`;
  return key;
}

function removeDuplicateDots(dots) {
  const newDots = [];
  const dotMap = new Map();

  for (const dot of dots) {
    const key = makeKey(dot);
    const isDot = dotMap.get(key);
    if (!isDot) {
      newDots.push(dot);
      dotMap.set(key, true);
    }
  }

  return newDots;
}

function buildMap(dots) {
  const dotMap = new Map();

  for (const dot of dots) {
    const key = makeKey(dot);
    const isDot = dotMap.get(key);
    if (!isDot) {
      dotMap.set(key, true);
    }
  }

  return dotMap;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  let { dots, folds } = parse(data);

  for (const fold of folds) {
    for (const dot of dots) {
      reflectDot(dot, fold);
    }

    dots = removeDuplicateDots(dots);

    console.log(dots.length);
  }

  const maxX = dots.reduce((acc, current) => Math.max(acc, current.x), 0);
  const maxY = dots.reduce((acc, current) => Math.max(acc, current.y), 0);
  const dotMap = buildMap(dots);

  for (let i = 0; i <= maxY; i++) {
    let line = '';
    for (let j = 0; j <= maxX; j++) {
      const key = makeKey({ x: j, y: i });
      line = line + (dotMap.has(key) ? '*' : ' ');
    }
    console.log(line);
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
