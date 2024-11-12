'use strict';

const _ = require('lodash');
const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const mapSegmentsToValue = new Map();
mapSegmentsToValue.set('abcefg', 0);
mapSegmentsToValue.set('cf', 1);
mapSegmentsToValue.set('acdeg', 2);
mapSegmentsToValue.set('acdfg', 3);
mapSegmentsToValue.set('bcdf', 4);
mapSegmentsToValue.set('abdfg', 5);
mapSegmentsToValue.set('abdefg', 6);
mapSegmentsToValue.set('acf', 7);
mapSegmentsToValue.set('abcdefg', 8);
mapSegmentsToValue.set('abcdfg', 9);

function splitAndSortChunks(chunks) {
  let res = [];
  for (const chunk of chunks) {
    const splitChunk = chunk.split('');
    splitChunk.sort();
    res.push(splitChunk);
  }
  res.sort((a, b) => a.length - b.length);
  return res;
}

function splitChunks(chunks) {
  let res = [];
  for (const chunk of chunks) {
    const splitChunk = chunk.split('');
    splitChunk.sort();
    res.push(splitChunk);
  }
  return res;
}

function parseData(data) {
  const displays = [];
  for (const line of data) {
    const chunks = line.split(' ');
    const signalChunks = chunks.slice(0, 10);
    const outputChunks = chunks.slice(11);
    const signals = splitAndSortChunks(signalChunks);
    const encodedOutput = splitChunks(outputChunks);

    displays.push({ signals, encodedOutput });
  }

  return displays;
}

function findMissingValues(signals) {
  const allValueSegment = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const result = [];
  for (const signal of signals) {
    const value = _.difference(allValueSegment, signal);
    result.push(value[0]);
  }
  return result;
}

function createMapForDisplay(display) {
  const allValueSegment = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const map = {};
  const cfSegment = display.signals[0];
  const acfSegment = display.signals[1];
  const bcdfSegment = display.signals[2];

  const a = _.difference(acfSegment, cfSegment)[0];
  map[a] = 'a';

  const bdSegment = _.difference(bcdfSegment, cfSegment);
  const cdeSegment = findMissingValues(display.signals.slice(6, 9));

  const c = _.intersection(cdeSegment, cfSegment)[0];
  map[c] = 'c';

  const f = _.difference(cfSegment, [c])[0];
  map[f] = 'f';

  const d = _.intersection(cdeSegment, bdSegment)[0];
  map[d] = 'd';

  const b = _.difference(bdSegment, [d])[0];
  map[b] = 'b';

  const e = _.difference(cdeSegment, [c, d])[0];
  map[e] = 'e';

  const foundValuesSegment = [a, b, c, d, e, f];
  const g = _.difference(allValueSegment, foundValuesSegment)[0];
  map[g] = 'g';

  return map;
}

function createMaps(displays) {
  for (const display of displays) {
    const displayMap = createMapForDisplay(display);
    display.map = displayMap;
  }
}

function convertOutputForDisplay(display) {
  const result = [];
  for (const code of display.encodedOutput) {
    const decodedChars = [];
    for (const char of code) {
      decodedChars.push(display.map[char]);
    }
    const decodedString = decodedChars.sort().join('');
    const value = mapSegmentsToValue.get(decodedString);
    result.push(value);
  }
  return result;
}

function convertOutput(displays) {
  for (const display of displays) {
    const output = convertOutputForDisplay(display);
    display.output = output;
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const displays = parseData(data);

  createMaps(displays);
  convertOutput(displays);

  const targetValues = [1, 4, 7, 8];
  let count = 0;
  for (const display of displays) {
    for (const value of display.output) {
      if (targetValues.includes(value)) {
        count++;
      }
    }
  }

  console.log(count);

  let total = 0;
  for (const display of displays) {
    const value = (display.output[0] * 1000) + (display.output[1] * 100) + (display.output[2] * 10) + display.output[3];

    total += value;
  }

  console.log(total);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
