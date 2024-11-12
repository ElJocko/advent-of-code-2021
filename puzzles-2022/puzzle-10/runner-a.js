'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const testCycles = [20, 60, 100, 140, 180, 220];

function checkClock(state, duration) {
    let result;
    testCycles.forEach(cycle => {
        const min = (state.clock - duration) + 1;
        const max = state.clock;
        if (cycle >= min && cycle <= max) {
            result = { cycle, signalStrength: cycle * state.register };
        }
    });

    return result;
}

function executeAddx(param, state) {
    state.register += param;
}

function execute(instruction, state) {
    let result;
    if (instruction[0] === 'noop') {
        state.clock++;
        result = checkClock(state, 1);
    }
    else if (instruction[0] === 'addx') {
        const param = Number(instruction[1]);
        state.clock += 2;
        result = checkClock(state, 2);

        executeAddx(param, state);
    }

    return result;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const instructions = data.map(line => line.split(' '));
    const state = {
        register: 1,
        clock: 0
    };

    const results = instructions.map(instruction => execute(instruction, state));
    const sum = results.reduce((acc, v) => v ? acc + v.signalStrength : acc, 0);

    console.timeEnd();

    console.log(sum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
