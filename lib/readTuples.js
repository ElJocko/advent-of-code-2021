'use strict';

const readline = require('readline');
const fs = require('fs');

exports.readFile = async function(filePath) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath),
    console: false
  });

  const data = [];

  readInterface.on('line', function(line) {
    const tuple = line.split(' ');
    data.push(tuple);
  });

  const promise = new Promise(resolve =>
  {
    readInterface.on('close', function() {
      resolve(data);
    });
  });

  return promise;
}
