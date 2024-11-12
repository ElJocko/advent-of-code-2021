'use strict';

const reader = require('../../lib/readStrings');

//const dataFilePath = './data.txt';
const dataFilePath = './test.txt';

const transformMatrices = [];

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
          transformMatrices.push(matrix);
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

function transform(position, matrix) {
  const x = position[0] * matrix.a11 + position[1] * matrix.a12 + position[2] * matrix.a13;
  const y = position[0] * matrix.a21 + position[1] * matrix.a22 + position[2] * matrix.a23;
  const z = position[0] * matrix.a31 + position[1] * matrix.a32 + position[2] * matrix.a33;

  return [x, y, z];
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

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const scanners = parseData(data);

  const globalUniquePositions = [];

  for (let i = 0; i < scanners.length; i++) {
    for (let j = i + 1; j < scanners.length; j++) {
      const scanner1 = scanners[i];
      const scanner2 = scanners[j];

//      const matchingOffsets = [];
      const uniquePositionsScanner1 = new Map();
      const uniquePositionsScanner2 = new Map();

      // Look for pairs of positions with the same offsets
      for (let bpS11 = 0; bpS11 < scanner1.beaconPositions.length; bpS11++) {
        const beaconPositionS11 = scanner1.beaconPositions[bpS11];
        for (let bpS12 = bpS11+1; bpS12 < scanner1.beaconPositions.length; bpS12++) {
          const beaconPositionS12 = scanner1.beaconPositions[bpS12];
          const diff1 = findOffsetString(beaconPositionS11, beaconPositionS12);
          for (let bpS21 = 0; bpS21 < scanner2.beaconPositions.length; bpS21++) {
            const beaconPositionS21 = scanner2.beaconPositions[bpS21];
            for (let bpS22 = bpS21+1; bpS22 < scanner2.beaconPositions.length; bpS22++) {
              const beaconPositionS22 = scanner2.beaconPositions[bpS22];
              const diff2 = findOffsetString(beaconPositionS21, beaconPositionS22);
              if (diff1 === diff2) {
                console.log(diff1);
                const offset = {
                  scanners: [scanner1, scanner2],
                  offset: diff1,
                  positions: [[beaconPositionS11, beaconPositionS12], [beaconPositionS21, beaconPositionS22]]
                };
//                matchingOffsets.push(offset);

                let foundPosition = uniquePositionsScanner1.get(offsetToString(beaconPositionS11));
                if (foundPosition) {
                  foundPosition.matchingBeacons.push(beaconPositionS21);
                  foundPosition.matchingBeacons.push(beaconPositionS22);
                }
                else {
                  const newPosition = {
                    position: beaconPositionS11,
                    matchingBeacons: [beaconPositionS21, beaconPositionS22]
                  };
                  uniquePositionsScanner1.set(offsetToString(beaconPositionS11), newPosition);
                }

                foundPosition = uniquePositionsScanner1.get(offsetToString(beaconPositionS12));
                if (foundPosition) {
                  foundPosition.matchingBeacons.push(beaconPositionS21);
                  foundPosition.matchingBeacons.push(beaconPositionS22);
                }
                else {
                  const newPosition = {
                    position: beaconPositionS12,
                    matchingBeacons: [beaconPositionS21, beaconPositionS22]
                  };
                  uniquePositionsScanner1.set(offsetToString(beaconPositionS12), newPosition);
                }

                foundPosition = uniquePositionsScanner2.get(offsetToString(beaconPositionS21));
                if (foundPosition) {
                  foundPosition.matchingBeacons.push(beaconPositionS11);
                  foundPosition.matchingBeacons.push(beaconPositionS12);
                }
                else {
                  const newPosition = {
                    position: beaconPositionS21,
                    matchingBeacons: [beaconPositionS11, beaconPositionS12]
                  };
                  uniquePositionsScanner2.set(offsetToString(beaconPositionS21), newPosition);
                }

                foundPosition = uniquePositionsScanner2.get(offsetToString(beaconPositionS22));
                if (foundPosition) {
                  foundPosition.matchingBeacons.push(beaconPositionS11);
                  foundPosition.matchingBeacons.push(beaconPositionS12);
                }
                else {
                  const newPosition = {
                    position: beaconPositionS22,
                    matchingBeacons: [beaconPositionS11, beaconPositionS12]
                  };
                  uniquePositionsScanner2.set(offsetToString(beaconPositionS22), newPosition);
                }
              }
            }

//            console.log(matchingOffsets.length);
          }
        }
      }

      if (uniquePositionsScanner1.size >= 12) {
        console.log(`Scanner1 is $ ${ i }`);
        console.log(`Scanner2 is $ ${ j }`);
        for (const foundPosition of uniquePositionsScanner1.values()) {
          const mostFreqPosition = findFirstDup(foundPosition.matchingBeacons);
          console.log(`scanner1 position: ${offsetToString(foundPosition.position)}`);
          console.log('matches');
          console.log(`scanner2 position: ${offsetToString(mostFreqPosition)}\n`);

          let positionGroup = globalUniquePositions.find(x => x.includes(foundPosition.position));
          if (positionGroup) {
            if (!positionGroup.includes(mostFreqPosition)) {
              positionGroup.push(mostFreqPosition);
            }
          }
          else {
            positionGroup = globalUniquePositions.find(x => x.includes(mostFreqPosition));
            if (!positionGroup) {
              globalUniquePositions.push([ foundPosition.position, mostFreqPosition ]);
            }
          }
        }
      }

      console.log(globalUniquePositions.length);

      //console.log(matchingOffsets.length);
    }
  }

  console.log('done');
}

generateTransformMatrices();
runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
