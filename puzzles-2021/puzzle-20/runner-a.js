'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

function parseData(data) {
  const iea = data[0];
  const image = data.slice(2);

  return { iea, image };
}

function getCharForPixel(image, row, column, defaultChar) {
  if (row < 0 || row >= image.length || column < 0 || column >= image[0].length) {
    return defaultChar;
  }
  else {
    return image[row][column];
  }
}

function getStringForPixel(image, row, column, defaultChar) {
  const stringForPixel =
    getCharForPixel(image, row - 1, column - 1, defaultChar) +
    getCharForPixel(image, row - 1, column, defaultChar) +
    getCharForPixel(image, row - 1, column + 1, defaultChar) +
    getCharForPixel(image, row, column - 1, defaultChar) +
    getCharForPixel(image, row, column, defaultChar) +
    getCharForPixel(image, row, column + 1, defaultChar) +
    getCharForPixel(image, row + 1, column - 1, defaultChar) +
    getCharForPixel(image, row + 1, column, defaultChar) +
    getCharForPixel(image, row + 1, column + 1, defaultChar);

  return stringForPixel;
}

const imageMap = new Map([['.', '0'], ['#', '1']]);

function convertCodedStringToDecimal(str, charMap, stringBase) {
  stringBase = stringBase || 10;
  return parseInt(str.split('').map(c => charMap.get(c)).join(''), stringBase);
}

function enhanceImage(iea, image, defaultChar) {
  const enhancedImage = [];
  for (let row = -2; row < image.length + 2; row++) {
    let enhancedLine = '';
    for (let column = -2; column < image[0].length + 2; column++) {
      const str = getStringForPixel(image, row, column, defaultChar);
      const index = convertCodedStringToDecimal(str, imageMap, 2);
      enhancedLine += iea[index];
    }
    enhancedImage.push(enhancedLine);
  }

  return enhancedImage;
}

function counter(value) {
  return (count, x) => count + (x === value ? 1 : 0);
}

function countCharInArrayOfStrings(arr, char) {
  return arr.reduce((prevCount, str) => prevCount + str.split('').reduce(counter(char), 0), 0);
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const { iea, image } = parseData(data);

  let enhancedImage = image.slice();
  let defaultChar = '.';
  for (let i = 0; i < 50; i++) {
    enhancedImage = enhanceImage(iea, enhancedImage, defaultChar);
    if (defaultChar === '.') {
      defaultChar = '#';
    }
    else {
      defaultChar = '.';
    }
  }

  const count = countCharInArrayOfStrings(enhancedImage, '#');

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
