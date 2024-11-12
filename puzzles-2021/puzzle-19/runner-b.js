'use strict';

const reader = require('../../lib/readStrings');

//const dataFilePath = './data.txt';
const dataFilePath = './test.txt';

const rotationMatrices = [];

function generateTransformMatrices() {
  const sinMap = new Map([[0, 0], [90, 1], [180, 0], [270, -1]]);
  const cosMap = new Map([[0, 1], [90, 0], [180, -1], [270, 0]]);

  function sin(deg) {
    return sinMap.get(deg);
  }

  function cos(deg) {
    return cosMap.get(deg);
  }

  function matrixToString (m) {
    return `${ m.a11 }|${ m.a12 }|${ m.a13 }|${ m.a21 }|${ m.a22 }|${ m.a23 }|${ m.a31 }|${ m.a32 }|${ m.a33 }`;
  }

  function applyRotation(a, b, c) {
    const matrix = {
      a11: parseInt(cos(a) * cos(b)),
      a12: parseInt(cos(a) * sin(b) * sin(c) - sin(a) * cos(c)),
      a13: parseInt(cos(a) * sin(b) * cos(c) + sin(a) * sin(c)),
      a21: parseInt(sin(a) * cos(b)),
      a22: parseInt(sin(a) * sin(b) * sin(c) + cos(a) * cos(c)),
      a23: parseInt(sin(a) * sin(b) * cos(c) - cos(a) * sin(c)),
      a31: parseInt(sin(b) * -1),
      a32: parseInt(cos(b) * sin(c)),
      a33: parseInt(cos(b) * cos(c))
    }
    return matrix;
  }

  const mMap = new Map();
  for (let a = 0; a < 360; a += 90) {
    for (let b = 0; b < 360; b += 90) {
      for (let c = 0; c < 360; c += 90) {
        const matrix = applyRotation(a, b, c);
        const matrixString = matrixToString(matrix);
        if (!mMap.has(matrixString)) {
          mMap.set(matrixString, true);
          rotationMatrices.push(matrix);
        }
      }
    }
  }
}

function parseData(data) {
  const scanners = [];
  let currentScanner;
  for (const line of data) {
    if (line.slice(0, 12) === '--- scanner ') {
      if (currentScanner) {
        scanners.push(currentScanner);
      }
      currentScanner = {
        beaconPositions: []
      };
    }
    else if (line.length > 0) {
      const position = line.split(',').map(x => parseInt(x));
      currentScanner.beaconPositions.push(position);
    }
  }

  if (currentScanner) {
    scanners.push(currentScanner);
  }

  return scanners;
}

function rotate(position, matrix) {
  const x = position[0] * matrix.a11 + position[1] * matrix.a12 + position[2] * matrix.a13;
  const y = position[0] * matrix.a21 + position[1] * matrix.a22 + position[2] * matrix.a23;
  const z = position[0] * matrix.a31 + position[1] * matrix.a32 + position[2] * matrix.a33;

  return [x, y, z];
}

function rotate2(position, matrix) {
  // Invert the matrix
  const x = position[0] * matrix.a11 + position[1] * matrix.a21 + position[2] * matrix.a31;
  const y = position[0] * matrix.a12 + position[1] * matrix.a22 + position[2] * matrix.a32;
  const z = position[0] * matrix.a13 + position[1] * matrix.a23 + position[2] * matrix.a33;

  return [x, y, z];
}

function translate(position, vector) {
  return [position[0] + vector[0], position[1] + vector[1], position[2] + vector[2]];
}

function translate2(position, vector) {
  return [position[0] - vector[0], position[1] - vector[1], position[2] - vector[2]];
}

function offsetToString(offset) {
  return `${ offset[0] }|${ offset[1] }|${ offset[2] }`;
}

function findOffsetString(position1, position2) {
  const offset = [Math.abs(position1[0] - position2[0]), Math.abs(position1[1] - position2[1]), Math.abs(position1[2] - position2[2])];
  // if (offset[0] < 0) {
  //   for (let i = 0; i < offset.length; i++) {
  //     offset[0] = offset[0] * -1;
  //     if (offset[1] !== 0) {
  //       offset[1] = offset[1] * -1;
  //     }
  //     if (offset[2] !== 0) {
  //       offset[2] = offset[2] * -1;
  //     }
  //   }
  // }

  offset.sort((a, b) => a - b);

  return offsetToString(offset);
}

function findFirstDup(arr) {
  const map = new Map();
  for (const e of arr) {
    const found = map.get(e);
    if (found) {
      return e;
    }
    else {
      map.set(e, 1);
    }
  }

  return null;
}

function getTransforms(position1, position2) {
  const transforms = [];

  for (const rotation of rotationMatrices) {
    const rotatedPosition = rotate(position1, rotation);
    const translationVector = [ position2[0] - rotatedPosition[0], position2[1] - rotatedPosition[1], position2[2] - rotatedPosition[2]];
    transforms.push({ rotation, translationVector });
  }

  return transforms;
}

function applyTransformToAll(positions, rotationMatrix, translationVector) {
  const transformedPositions = [];
  for (const position of positions) {
    const rotatedPosition = rotate(position, rotationMatrix);
    const translatedPosition = translate(rotatedPosition, translationVector);
    transformedPositions.push(translatedPosition);
  }

  return transformedPositions;
}

function applyTransformToAll2(positions, rotationMatrix, translationVector) {
  const transformedPositions = [];
  for (const position of positions) {
    const translatedPosition = translate2(position, translationVector);
    const rotatedPosition = rotate2(translatedPosition, rotationMatrix);
    transformedPositions.push(rotatedPosition);
  }

  return transformedPositions;
}

function findParentNodeWithLabel(node, label) {
  if (node.scannerLabel === label) {
    return node;
  }
  else if (node.parent) {
    return findParentNodeWithLabel(node.parent, label);
  }
  else {
    return null;
  }
}

function buildConversionTree(rootNode, scannerPairs) {
  rootNode = rootNode || { scannerLabel: 0, children: [] };
  for (const pair of scannerPairs) {
    if (pair.scanner1.label === rootNode.scannerLabel) {
      const parent = findParentNodeWithLabel(rootNode, pair.scanner2.label);
      if (!parent) {
        const node = {
          parent: rootNode,
          scannerLabel: pair.scanner2.label,
          children: []
        };
        rootNode.children.push(node);
        buildConversionTree(node, scannerPairs);
      }
    }
    else if (pair.scanner2.label === rootNode.scannerLabel) {
      const parent = findParentNodeWithLabel(rootNode, pair.scanner1.label);
      if (!parent) {
        const node = {
          parent: rootNode,
          scannerLabel: pair.scanner1.label,
          children: []
        };
        rootNode.children.push(node);
        buildConversionTree(node, scannerPairs);
      }
    }
  }

  return rootNode;
}

function findConversionPath(rootNode, label) {
  const path = [];
  if (rootNode.scannerLabel === label) {
    path.push(rootNode.scannerLabel);
    return path;
  }
  else {
    for (const childNode of rootNode.children) {
      const childPath = findConversionPath(childNode, label);
      if (childPath) {
        path.push(rootNode.scannerLabel);
        path.push(...childPath);
        return path;
      }
    }
  }
  return null;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const scanners = parseData(data);

  const scannerPairs = [];

  for (let i = 0; i < scanners.length; i++) {
    for (let j = i + 1; j < scanners.length; j++) {
      const scanner1 = scanners[i];
      scanner1.label = i;
      scanner1.selfPosition = [0, 0, 0];
      const scanner2 = scanners[j];
      scanner2.label = j;
      scanner2.selfPosition = [0, 0, 0];

      const candidateTransforms = [];

      for (let b1 = 0; b1 < scanner1.beaconPositions.length; b1++) {
        const position1 = scanner1.beaconPositions[b1];
        for (let b2 = 0; b2 < scanner2.beaconPositions.length; b2++) {
          const position2 = scanner2.beaconPositions[b2];
          const transforms = getTransforms(position2, position1);
          candidateTransforms.push(...transforms);
        }
      }

      // Test transforms
      for (const transform of candidateTransforms) {
        let successCount = 0;
        for (let b1 = 0; b1 < scanner1.beaconPositions.length; b1++) {
          const position1 = scanner1.beaconPositions[b1];
          for (let b2 = 0; b2 < scanner2.beaconPositions.length; b2++) {
            const position2 = scanner2.beaconPositions[b2];
            const rotatedPosition = rotate(position2, transform.rotation);
            const trialPosition = translate(rotatedPosition, transform.translationVector);
            if (position1[0] === trialPosition[0] && position1[1] === trialPosition[1] && position1[2] === trialPosition[2]) {
              successCount++;
            }
          }
        }

        if (successCount >= 12) {
          console.log(`Scanner pair ${ i }, ${ j }: found transform`);
          scannerPairs.push({
            scanner1,
            scanner2,
            transform
          });
          break;
        }
      }
    }
  }

  const globalBeaconPositions = [];
  function addToGlobal(positions) {
    for (const position of positions) {
      if (!globalBeaconPositions.find(x => x[0] === position[0] && x[1] === position[1] && x[2] === position[2])) {
        console.log(`===Adding (${ globalBeaconPositions.length }) [${ position[0] },${ position[1] },${ position[2] }]`);
        globalBeaconPositions.push(position);
      }
    }
  }

  const conversionRoot = buildConversionTree(null, scannerPairs);

  for (const scanner of scanners) {
    if (scanner.label === 0) {
      console.log(`Adding scanner ${ scanner.label } positions to global positions`);
      addToGlobal(scanner.beaconPositions);
    }
    else {
      const path = findConversionPath(conversionRoot, scanner.label);
      console.log(`path for label: ${ scanner.label } ` + JSON.stringify(path));
      let tempBeaconPositions = scanner.beaconPositions.slice();

      for (let i = path.length - 1; i > 0; i--) {
        const sourceLabel = path[i];
        const targetLabel = path[i-1];

        console.log(`Converting ${ sourceLabel } to ${ targetLabel }`);

        // Find the scanner pair
        let converted = false;
        for (const pair of scannerPairs) {
          if (pair.scanner1.label === targetLabel && pair.scanner2.label === sourceLabel) {
            console.log(`Converting scanner ${ pair.scanner2.label } positions to scanner ${ pair.scanner1.label } positions (1)`);
            tempBeaconPositions = applyTransformToAll(tempBeaconPositions, pair.transform.rotation, pair.transform.translationVector);
            converted = true;
            break;
          }
          else if (pair.scanner2.label === targetLabel && pair.scanner1.label === sourceLabel) {
            console.log(`Converting scanner ${ pair.scanner1.label } positions to scanner ${ pair.scanner2.label } positions (2)`);
            tempBeaconPositions = applyTransformToAll2(tempBeaconPositions, pair.transform.rotation, pair.transform.translationVector);
            converted = true;
            break;
          }
        }

        if (!converted) {
          console.warn('NOT CONVERTED');
        }
      }

      console.log(`Adding scanner ${ scanner.label } positions to global positions`);
      addToGlobal(tempBeaconPositions);
    }
  }

  globalBeaconPositions.sort((a, b) => a[0] - b[0]);

  console.log(globalBeaconPositions.length);

  console.log('done');
}

generateTransformMatrices();
runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
