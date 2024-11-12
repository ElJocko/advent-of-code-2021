'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parse(data) {
  const template = data[0];

  const rules = new Map();

  for (let i = 2; i < data.length; i++) {
    const chunks = data[i].split(' -> ');
    const pattern = chunks[0];
    const value = chunks[1];
    rules.set(pattern, value);
  }

  return { template, rules };
}

function makeKey(template, depth) {
  const key = `${ template }|${ depth }`;
  return key;
}

function makeChunks(template, depth) {
  const chunks = [];
  for (let i = 0; i < template.length - 1; i++) {
    const chunk = {
      str: template.slice(i, i + 2),
      depth
    };
    chunks.push(chunk);
  }

  return chunks;
}

function addChar(result, char) {
  if (result[char]) {
    result[char]++;
  }
  else {
    result[char] = 1;
  }
}

function addResult(first, second) {
  for (const property in second) {
    if (first[property]) {
      first[property] = first[property] + second[property];
    }
    else {
      first[property] = second[property];
    }
  }
}

function resultToArray(result) {
  const resArray = [];
  for (const property in result) {
    const value = {
      char: property,
      count: result[property]
    };
    resArray.push(value);
  }
  return resArray;
}

let minDepth = 0;
let chunkSolveCount = 0;
let chunkCacheCount = 0;

function solve(chunks, rules, cache) {
  const result = {};
  for (const chunk of chunks) {
    if (chunk.depth === 0) {
      const char = chunk.str.charAt(0);
      addChar(result, char);
    }
    else {
      const value = rules.get(chunk.str);
      const template = chunk.str.charAt(0) +  value + chunk.str.charAt(1);
      const key = makeKey(template, chunk.depth);
      if (cache.has(key)) {
        const chunkResult = cache.get(key);
        addResult(result, chunkResult);
        chunkCacheCount++;
        console.log(key);
      }
      else {
        const subchunks = makeChunks(template, chunk.depth - 1);
        const chunkResult = solve(subchunks, rules, cache);
        cache.set(key, chunkResult);
        addResult(result, chunkResult);
        chunkSolveCount++;
      }
    }
  }

  // if (chunks[0].depth > minDepth) {
  //   minDepth = chunks[0].depth;
  //   console.log(minDepth);
  //   console.log(result);
  // }
  return result;
}

function applyRules(template, rules) {
  let newTemplate = '';

  for (let i = 0; i < template.length; i++) {
    const pair = template.slice(i, i+2);
    const value = rules.get(pair);
    if (value) {
      newTemplate = newTemplate + pair.charAt(0) + value;
    }
    else {
      newTemplate = newTemplate + pair.charAt(0);
    }
  }

  //newTemplate = newTemplate + template.charAt(template.length - 1);

  return newTemplate;
}

function countElements(template) {
  const elementMap = new Map();
  const templateElements = template.split('');
  for (const element of templateElements) {
    if (elementMap.has(element)) {
      elementMap.set(element, elementMap.get(element) + 1);
    }
    else {
      elementMap.set(element, 1);
    }
  }

  const elementCounts = Array.from(elementMap);
  elementCounts.sort((a, b) => a[1] - b[1]);

  return elementCounts;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  let { template, rules } = parse(data);

//   for (let i = 0; i < 40; i++) {
//     console.log(`step: ${ i }, template length: ${ template.length }`);
//     template = applyRules(template, rules);
// //    console.log(template);
//   }

  const cache = new Map();
  const topChunks = makeChunks(template, 100);
  const result = solve(topChunks, rules, cache);
  const lastChar = template.charAt(template.length - 1);
  addChar(result, lastChar);

  console.log(`cache size: ${ cache.size }`);

  const elementCounts = resultToArray(result);
  elementCounts.sort((a, b) => a.count - b.count);

  const minElement = elementCounts[0];
  console.log(minElement.count);

  const maxElement = elementCounts[elementCounts.length - 1];
  console.log(maxElement.count);

  console.log(maxElement.count - minElement.count);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
