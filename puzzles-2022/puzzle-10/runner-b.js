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

function updateScreen(state) {
    const x = Math.floor(state.clock % 40);
    const y = Math.floor((state.clock / 40) % 6);

    if (x >= state.register - 1 && x <= state.register + 1) {
        state.screen[y] = state.screen[y].slice(0, x) + '#' + state.screen[y].slice(x+1);
    }
    else {
        state.screen[y] = state.screen[y].slice(0, x) + '.' + state.screen[y].slice(x+1);
    }
}

function execute(instruction, state) {
    let result;
    if (instruction[0] === 'noop') {
        updateScreen(state);
        state.clock++;

        result = checkClock(state, 1);
    }
    else if (instruction[0] === 'addx') {
        updateScreen(state);
        state.clock++;
        updateScreen(state);
        state.clock++;

        result = checkClock(state, 2);

        const param = Number(instruction[1]);
        executeAddx(param, state);
    }

    return result;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const instructions = data.map(line => line.split(' '));

    const screen = [];
    for (let i = 0; i < 6; i++) {
        screen.push('                                        ');
    }
    const state = {
        register: 1,
        clock: 0,
        screen
    };

    const results = instructions.map(instruction => execute(instruction, state));
    const sum = results.reduce((acc, v) => v ? acc + v.signalStrength : acc, 0);

    console.timeEnd();

    for (let i = 0; i < 6; i++) {
        console.log(`${ screen[i].slice(0, 5) }  ${ screen[i].slice(5, 10) }  ${ screen[i].slice(10, 15) }  ${ screen[i].slice(15, 20) }  ${ screen[i].slice(20, 25) }  ${ screen[i].slice(25, 30) }  ${ screen[i].slice(30, 35) }  ${ screen[i].slice(35, 40) }  `);
    }

    console.log(sum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
