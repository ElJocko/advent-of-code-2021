'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

function addVectors(a, b) {
    return a.map((e, i) => (b.length > i) ? e + b[i] : e);
}

function parseNumber(numberString) {
    const trimmedNumber = numberString.replaceAll(' ', '');
    return Number.parseInt(trimmedNumber);
}

function parseSequences(line) {
    const parts = line.split(' ');
    return parts.map(parseNumber);
}

function getDiffSequence(sequence) {
    const diffSequence = [];
    for (let i = 1; i < sequence.length; i++) {
        diffSequence.push(sequence[i] - sequence[i - 1]);
    }

    return diffSequence;
}

function getNextVal(sequence) {
    const sequenceList = [sequence];

    let currentSequence = sequence;
    let lastSequenceFound = false;
    while (!lastSequenceFound) {
        const diffSequence = getDiffSequence(currentSequence);
        sequenceList.push(diffSequence);

        if (diffSequence.length === 0) {
            console.log('diffSequence is length 0');
            throw new Error('bad diffSequence');
        }

        if (diffSequence.every(v => v === 0)) {
            lastSequenceFound = true;
            diffSequence.push(0);
        }
        else {
            currentSequence = diffSequence;
        }
    }

    for (let i = sequenceList.length - 1; i > 0; i--) {
        const diffSequence = sequenceList[i];
        const targetSequence = sequenceList[i - 1];

        const lastVal = targetSequence[targetSequence.length - 1];
        const diff = diffSequence[diffSequence.length - 1];
        targetSequence.push(lastVal + diff);
    }

    return sequenceList[0][sequenceList[0].length - 1];
}

function getPrevVal(sequence) {
    const sequenceList = [sequence];

    let currentSequence = sequence;
    let lastSequenceFound = false;
    while (!lastSequenceFound) {
        const diffSequence = getDiffSequence(currentSequence);
        sequenceList.push(diffSequence);

        if (diffSequence.length === 0) {
            console.log('diffSequence is length 0');
            throw new Error('bad diffSequence');
        }

        if (diffSequence.every(v => v === 0)) {
            lastSequenceFound = true;
            diffSequence.unshift(0);
        }
        else {
            currentSequence = diffSequence;
        }
    }

    for (let i = sequenceList.length - 1; i > 0; i--) {
        const diffSequence = sequenceList[i];
        const targetSequence = sequenceList[i - 1];

        const firstVal = targetSequence[0];
        const diff = diffSequence[0];
        targetSequence.unshift(firstVal - diff);
    }

    return sequenceList[0][0];
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const sequences = data.map(parseSequences);
    const prevVals = sequences.map(getPrevVal);

    const total = prevVals.reduce(sumElements);
    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
