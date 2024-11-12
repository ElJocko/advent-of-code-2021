'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseLine(line) {
    return line.split('').reverse();
}

function parseData(data) {
    return data.map(parseLine);
}

const snafuTable = {
    '2': 2,
    '1': 1,
    '0': 0,
    '-': -1,
    '=': -2
};

function convertFromSnafu(snafu) {
    let sum = 0;
    for (let i = 0; i < snafu.length; i++) {
        sum += snafuTable[snafu[i]] * Math.pow(5, i);
    }
    return sum;
}

function sumElements(acc, elem) {
    return acc + elem;
}

function convertToSnafu(decimal) {
    // Find first digit
    let i = 0;
    let result = '';
    let value = decimal;
    let residual = 0;
    while (true) {
        const test1 = Math.pow(5, i);
        if (value === test1) {
            result = result + '1';
            return result;
        }

        const test2 = test1 * 2;
        if (value === test2) {
            result = result + '2';
            return result;
        }

        if (test1 < value) {
            if ((value - test1) <= residual) {
                result = result + '1';
                const newValue = value - test1;
            }
        }

    }

}


async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const inputData = parseData(data);

    const decimal = inputData.map(convertFromSnafu);
    const resultDecimal = decimal.reduce(sumElements);
   // const resultSnafu = convertToSnafu(resultDecimal);
    const resultBase5 = resultDecimal.toString(5);

    // for (let i = 0; i < 20; i++) {
    //     console.log(`5^${ i }`);
    //     console.log(`2 = ${ 2 * Math.pow(5, i) }`);
    //     console.log(`1 = ${ Math.pow(5, i) }`);
    //     console.log(`- = ${ -1 * Math.pow(5, i) }`);
    //     console.log(`= = ${ -2 * Math.pow(5, i) }`);
    // }

    console.log(resultDecimal);
    console.log(resultBase5);

    // let work = resultDecimal - (2 * Math.pow(5, 19));
    // let resultSnafu = '2...................';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work + Math.pow(5, 18);
    // resultSnafu = '2-..................';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (2 * Math.pow(5, 17));
    // resultSnafu = '2-2.................';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work + (2 * Math.pow(5, 16));
    // resultSnafu = '2-2=................';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (Math.pow(5, 15));
    // resultSnafu = '2-2=1...............';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (2 * Math.pow(5, 14));
    // resultSnafu = '2-2=12..............';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work + (2 * Math.pow(5, 13));
    // resultSnafu = '2-2=12=.............';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (1 * Math.pow(5, 12));
    // resultSnafu = '2-2=12=1............';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work + (2 * Math.pow(5, 11));
    // resultSnafu = '2-2=12=1=...........';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (2 * Math.pow(5, 10));
    // resultSnafu = '2-2=12=1=2..........';
    // console.log(`work = ${ work } (${ resultSnafu })`);
    //
    // work = work - (2 * Math.pow(5, 9));
    // resultSnafu = '2-2=12=1=22.........';
    // console.log(`work = ${ work } (${ resultSnafu })`);

    console.timeEnd();

    // console.log(resultSnafu);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
