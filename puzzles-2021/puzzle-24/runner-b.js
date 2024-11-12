'use strict';

const { programs } = require('./programs');

async function runner() {
  let modelNumber = [9, 9, 9, 8, 9, 9, 9, 7, 9, 8, 5, 9, 4, 2];
  let z = 0;

  for (let p = 0; p < programs.length; p++) {
    const i = modelNumber[p];
    const result = programs[p](i, 0, 0, 0, z);
    z = result.z;
  }



  console.log(z);


  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
