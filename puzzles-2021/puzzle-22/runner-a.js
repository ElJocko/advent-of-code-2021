'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';
//const dataFilePath = './test.txt';

function parseData(data) {
  const cuboids = [];
  for (const line of data) {
    let cuboid;
    let sides;
    if (line.slice(0, 2) === 'on') {
      sides = line.slice(3).split(',');
      cuboid = { on: true, dim: [] };
    } else {
      sides = line.slice(4).split(',');
      cuboid = { on: false, dim: [] };
    }

    for (const side of sides) {
      const range = side.slice(2).split('..');
      cuboid.dim.push({
        min: parseInt(range[0]),
        max: parseInt(range[1])
      });
    }
//    if (cuboid.dim[0].min >= -50 && cuboid.dim[0].max <= 50) {
    cuboids.push(cuboid);
//    }
  }

  return cuboids;
}

function copyOfCuboid(cuboid) {
  const copy = {
    dim: []
  };

  for (const dim of cuboid.dim) {
    copy.dim.push({ min: dim.min, max: dim.max });
  }

  return copy;
}

function cuboidsOverlap(cuboid1, cuboid2) {
  const overlap = [];
  for (let i = 0; i < cuboid1.dim.length; i++) {
    const dim1 = cuboid1.dim[i];
    const dim2 = cuboid2.dim[i];
    if (dim1.min > dim2.max || dim1.max < dim2.min) {
      return null;
    }
    else {
      overlap.push({ min: Math.max(dim1.min, dim2.min), max: Math.min(dim1.max, dim2.max) });
    }
  }

  return overlap;
}

function subtractSectionFromCuboid(section, cuboid) {
  const replacementCuboids = [];

  const modifiedCuboid = copyOfCuboid(cuboid);

  for (let i = 0; i < section.length; i++) {
    const face = section[i];
    if (modifiedCuboid.dim[i].min < face.min) {
      const replacementCuboid = copyOfCuboid(modifiedCuboid);

      // And chop off the extra
      replacementCuboid.dim[i].max = face.min - 1;

      // Then remove the replacement from the original
      modifiedCuboid.dim[i].min = face.min;

      replacementCuboids.push(replacementCuboid);
    }

    if (modifiedCuboid.dim[i].max > face.max) {
      const replacementCuboid = copyOfCuboid(modifiedCuboid);

      // And chop off the extra
      replacementCuboid.dim[i].min = face.max + 1;

      // Then remove the replacement from the original
      modifiedCuboid.dim[i].max = face.max;

      replacementCuboids.push(replacementCuboid);
    }
  }

  // let sectionSize = 1;
  // for (const face of section) {
  //   sectionSize = sectionSize * ((face.max - face.min) + 1);
  // }
  // const replacementSize = replacementCuboids.reduce((count, c) => {
  //   const size = sizeOfCuboid(c);
  //   return count + size;
  // }, 0);

  return replacementCuboids;
}

function addCuboid(cuboid, cuboids) {
  const allReplacementCuboids = [];
  for (const testCuboid of cuboids) {
    if (!testCuboid.deleted) {
      const overlap = cuboidsOverlap(cuboid, testCuboid);
      if (overlap) {
        const replacementCuboids = subtractSectionFromCuboid(overlap, testCuboid);
        testCuboid.deleted = true;
        allReplacementCuboids.push(...replacementCuboids);
      }
    }
  }

  cuboids.push(...allReplacementCuboids);
  cuboids.push(cuboid);
}

function subtractCuboid(cuboid, cuboids) {
  const allReplacementCuboids = [];
  for (const testCuboid of cuboids) {
    if (!testCuboid.deleted) {
      const overlap = cuboidsOverlap(cuboid, testCuboid);
      if (overlap) {
        const replacementCuboids = subtractSectionFromCuboid(overlap, testCuboid);
        testCuboid.deleted = true;
        allReplacementCuboids.push(...replacementCuboids);
      }
    }
  }

  cuboids.push(...allReplacementCuboids);
}

function sizeOfCuboid(cuboid) {
  if (cuboid.deleted) {
    return 0;
  }

  let size = 1;
  for (const dim of cuboid.dim) {
    size = size * ((dim.max - dim.min) + 1);
  }

  return size;
}

function cleanCuboids(cuboids) {
  const cleanedCuboids = [];
  for (const cuboid of cuboids) {
    if (!cuboid.deleted) {
      cleanedCuboids.push(cuboid);
    }
  }

  console.log(`before cleaning: ${ cuboids.length }, after cleaning: ${ cleanedCuboids.length }`);

  return cleanedCuboids;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const rebootSteps = parseData(data);

  let reactor = [];
  for (const cuboid of rebootSteps) {
    if (cuboid.on) {
      addCuboid(cuboid, reactor);
    }
    else {
      subtractCuboid(cuboid, reactor);
    }
  }

  const count = reactor.reduce((count, c) => count + sizeOfCuboid(c), 0);

  console.log(count);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
