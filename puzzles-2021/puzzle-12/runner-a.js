'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parse(data) {
  const edges = [];

  for (const line of data) {
    const chunks = line.split('-');
    const edge = [{ label: chunks[0] }, { label: chunks[1] }];
    setNodeType(edge[0]);
    setNodeType(edge[1]);

    edges.push(edge);
  }

  return edges;
}

function setNodeType(node) {
  if (node.label === 'start') {
    node.type = 'start';
  }
  else if (node.label === 'end') {
    node.type = 'end';
  }
  else {
    const char = node.label.charAt(0);
    if (char === char.toLowerCase()) {
      node.type = 'small';
    }
    else {
      node.type = 'large';
    }
  }
}

function isSmall(label) {
  const char = label.charAt(0);
  return char === char.toLowerCase();
}

function contains(edge, label) {
  if (edge[0].label === label) {
    return edge[1];
  }
  else if (edge[1].label === label) {
    return edge[0];
  }
  else {
    return null;
  }
}

function nextPaths(path, edges) {
  const lastNodeLabel = path[path.length-1];
  const candidatePaths = [];

  // Find all the nodes that connect to lastNodeLabel
  for (const edge of edges) {
    const connectedNode = contains(edge, lastNodeLabel);
    if (connectedNode) {
      const candidatePath = path.slice();
      candidatePath.push(connectedNode.label);
      candidatePaths.push(candidatePath);
    }
  }

  return candidatePaths;
}

function findPaths(edges) {
  const paths = [];
  const incompletePaths = [['start']];

  while (incompletePaths.length > 0) {
    const nextPath = incompletePaths.pop();
    const candidatePaths = nextPaths(nextPath, edges);

    for (const path of candidatePaths) {
      const lastNodeLabel = path[path.length - 1];
      if (lastNodeLabel === 'end') {
        paths.push(path);
      } else if (lastNodeLabel === 'start') {
        // Ignore path back to start
      } else if (isSmall(lastNodeLabel)) {
        // Search for the same node earlier in the path
        let nodeFound = false;
        for (let i = path.length - 2; i >= 0; i--) {
          if (path[i] === lastNodeLabel) {
            nodeFound = true;
            break;
          }
        }
        if (nodeFound) {
          // Second time at small cave, ignore path
        }
        else {
          // First time at small cave, keep going
          incompletePaths.push(path);
        }
      } else {
        // Large cave, keep going
        incompletePaths.push(path);
      }
    }
  }

  return paths;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const edges = parse(data);

  const paths = findPaths(edges);

  console.log(paths.length);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
