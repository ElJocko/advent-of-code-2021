'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

const leftToken = '[';
const rightToken = ']';
const separator = ',';

function parseLine(line) {
  const lineTokens = line.split('');

  const rootNode = {
    parent: null,
    depth: 0
  };
  const firstToken = lineTokens.shift();
  if (firstToken !== leftToken) {
    console.log(`Error at start: ${ firstToken }`);
  }

  let currentNode = rootNode;
  let pos = 'left';

  for (const token of lineTokens) {
    if (token === leftToken) {
      const newNode = {
        parent: currentNode,
        depth: currentNode.depth + 1
      };
      currentNode[pos] = newNode;
      currentNode = newNode;
      pos = 'left';
    }
    else if (token === rightToken) {
      if (currentNode.parent) {
        currentNode = currentNode.parent;
      }
      else {
        // Should be back to root
      }
    }
    else if (token === separator) {
      pos = 'right';
    }
    else {
      currentNode[pos] = {
        parent: currentNode,
        depth: currentNode.depth + 1,
        value: parseInt(token),
        leaf: true
      };
    }
  }

  return rootNode;
}

function parseData(data) {
  const values = [];
  for (const line of data) {
    const value = parseLine(line);
    values.push(value);
  }

  return values;
}

function explode(node) {
  // Find first regular number to the left and right
  const rootNode = findRoot(node);
  const leafNodes = depthFirstFilter(rootNode, n => n.leaf);

  for (let i = 0; i < leafNodes.length; i++) {
    if (leafNodes[i] === node.left) {
      if (i === 0) {
        // No regular number to the left
      }
      else {
        leafNodes[i-1].value += node.left.value;
      }
    }
    if (leafNodes[i] === node.right) {
      if (i === leafNodes.length - 1) {
        // No regular number to the right
      }
      else {
        leafNodes[i+1].value += node.right.value;
      }
    }
  }

  // Replace node on parent node
  const parentNode = node.parent;
  const replacementNode = {
    parent: parentNode,
    depth: node.depth,
    value: 0,
    leaf: true
  };
  if (parentNode.left === node) {
    parentNode.left = replacementNode;
  }
  else if (parentNode.right === node) {
    parentNode.right = replacementNode;
  }
  else {
    console.log('Cannot explode!!!');
  }
}

function split(node) {
  node.leaf = false;
  node.left = {
    parent: node,
    depth: node.depth + 1,
    value: Math.floor(node.value/2),
    leaf: true
  };
  node.right = {
    parent: node,
    depth: node.depth + 1,
    value: Math.ceil(node.value/2),
    leaf: true
  };
  node.value = null;
}

function depthFirstSearch(node, predicate) {
  if (node) {
    if (predicate(node)) {
      return node;
    } else {
      // Search the left
      const leftSearchNode = depthFirstSearch(node.left, predicate);
      if (leftSearchNode) {
        return leftSearchNode;
      }

      // Search the right
      const rightSearchNode = depthFirstSearch(node.right, predicate);
      if (rightSearchNode) {
        return rightSearchNode;
      }

      // Not found
      return null;
    }
  }
  else {
    return null;
  }
}

function depthFirstFilter(node, predicate) {
  if (node) {
    if (predicate(node)) {
      return [ node ];
    } else {
      const leftSearchNodes = depthFirstFilter(node.left, predicate);
      const rightSearchNodes = depthFirstFilter(node.right, predicate);
      return [...leftSearchNodes, ...rightSearchNodes];
    }
  }
  else {
    return [];
  }
}

function findRoot(node) {
  if (node.parent) {
    return findRoot(node.parent);
  }
  else {
    return node;
  }
}

function map(node, func) {
  if (node) {
    func(node);
    map(node.left, func);
    map(node.right, func);
  }
}

function reduce(node) {
  // Find the first non-leaf node at depth 4
  let targetNode = depthFirstSearch(node, n => !n.leaf && n.depth === 4);
  if (targetNode) {
    explode(targetNode);
    return true;
  }

  // Find the first leaf node with a value greater than or equal to 10
  targetNode = depthFirstSearch(node, n => n.leaf && n.value >= 10);
  if (targetNode) {
    split(targetNode);
    return true;
  }

  return false;
}

function sum(left, right) {
  const sfNumber = { left, right };
  sfNumber.depth = 0;
  left.parent = sfNumber;
  right.parent = sfNumber;
  map(left, n => n.depth++);
  map(right, n => n.depth++);

  while (true) {
    const reduced = reduce(sfNumber);
    if (!reduced) {
      return sfNumber;
    }
  }
}

function magnitude(node) {
  if (node.leaf) {
    return node.value;
  }
  else {
    return (3 * magnitude(node.left)) + (2* magnitude(node.right));
  }
}

function treeToString(rootNode) {
  if (typeof rootNode.value === "number") {
    return rootNode.value.toString();
  }
  else {
    const result = `[${treeToString(rootNode.left)},${treeToString(rootNode.right)}]`;
    return result;
  }
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const sfNumbers = parseData(data);

  let currentSum;
  for (const sfNumber of sfNumbers) {
    if (!currentSum) {
      currentSum = sfNumber;
    }
    else {
      currentSum = sum(currentSum, sfNumber);
    }
  }

  console.log(treeToString(currentSum));

  const sumMagnitude = magnitude(currentSum);

  console.log(sumMagnitude);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
