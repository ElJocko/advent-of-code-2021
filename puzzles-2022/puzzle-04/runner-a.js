'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseAssignment(assignment) {
    const range = assignment.split('-');
    return { start: Number(range[0]), end: Number(range[1])};
}

function hasSubset(rangeList) {
    function check(a1, a2) {
        return a1.start <= a2.start && a1.end >= a2.end;
    }

    return check(rangeList[0], rangeList[1]) || check(rangeList[1], rangeList[0]);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const assignmentPairs = data.map(s => s.split(',')).map(assignments => assignments.map(parseAssignment));
    const fullyContainedPairs = assignmentPairs.filter(hasSubset);

    console.timeEnd();

    console.log(fullyContainedPairs.length);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
