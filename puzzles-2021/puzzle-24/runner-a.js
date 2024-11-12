'use strict';

const { programs } = require('./programs');

async function runner() {
//  let zValues = new Map([ [0, ['']] ]);
  let zValues = new Map([ [0, true] ]);

  for (let p = 0; p < programs.length; p++) {
    const results = new Map();
    for (const entry of zValues.entries()) {
      for (let i = 1; i <= 9; i++) {
        if (p === 0 && i > 8) {
          continue;
        }
        if (p === 1 && i > 4) {
          continue;
        }
        if (p === 2 && i > 1) {
          continue;
        }
        if (p === 3 && i > 9) {
          continue;
        }
        if (p === 4 && i > 1) {
          continue;
        }
        if (p === 5 && i > 5) {
          continue;
        }
        if (p === 6 && i > 2) {
          continue;
        }
        if (p === 7 && i > 1) {
          continue;
        }
        if (p === 8 && i > 3) {
          continue;
        }
        if (p === 9 && i > 1) {
          continue;
        }
        if (p === 10 && i > 1) {
          continue;
        }
        if (p === 11 && i > 6) {
          continue;
        }
        if (p === 12 && i > 1) {
          continue;
        }
        if (p === 13 && i > 1) {
          continue;
        }

        const result = programs[p](i, 0, 0, 0, entry[0]);

        // const modelNumbers = [];
        // for (const prevModelNumber of entry[1]) {
        //   modelNumbers.push(prevModelNumber + i);
        // }

//        console.log(modelNumbers);

        results.set(result.z, true);
        // const r = results.get(result.z);
        // if (r) {
        //   r.push(...modelNumbers);
        //   results.set(result.z, r);
        // }
        // else {
        //   results.set(result.z, modelNumbers.slice());
        // }
      }
//      console.log(`z: ${ entry[0] }, ${ results.size }`);
    }
    console.log(results.size);
    zValues = results;
  }

  const keys = Array.from(zValues).map(([name, value]) => ({name, value}));
  keys.sort((a,b) => a.name - b.name);



  console.log(keys[0].name);
  console.log(keys[1].name);
  console.log(keys[2].name);
  console.log(keys[3].name);
  console.log(keys[4].name);

  for (const entry of zValues.entries()) {
    if (entry[0] === 0) {
      for (const modelNumber of entry[1]) {
        console.log(`valid model number: ${ modelNumber }`);
      }
    }
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
