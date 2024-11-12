'use strict';

// acc is object in form { previous, count }
// where previous is the previous value in the array and count is the count of times the test is passed
module.exports = function(acc, current) {
  if (current > acc.previous) {
    acc.count++;
  }
  acc.previous = current;

  return acc;
}
