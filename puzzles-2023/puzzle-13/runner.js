'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './sample.txt';

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

function parseSpringRow(line) {
    const tokens = line.split(' ');
    const springs = tokens[0].split('');
    const damageRecord = tokens[1].split(',').map(parseNumber);

    const expandedSprings = [...springs, unknown, ...springs, unknown, ...springs, unknown, ...springs, unknown, ...springs];
    const expandedDamageRecord = [...damageRecord, ...damageRecord, ...damageRecord, ...damageRecord, ...damageRecord];

    // return { springs, damageRecord };
    return { springs: expandedSprings, damageRecord: expandedDamageRecord };
}

const damaged = '#';
const okay = '.';
const unknown = '?';

function enumerateArrangements(springs) {
    // console.log(`enumerateArrangements(${ springs })`);
    let arrangements;
    const currentSpring = springs[0];

    if (currentSpring === damaged || currentSpring === okay) {
        if (springs.length === 1) {
            arrangements = [[currentSpring]];
        }
        else {
            const tailArrangements = enumerateArrangements(springs.slice(1));
            // console.log(`  rcvd ${ tailArrangements.length } arrangements (?)`);
            for (const tailArrangement of tailArrangements) {
                tailArrangement.unshift(currentSpring);
            }
            arrangements = tailArrangements;
        }
    }
    else {
        if (springs.length === 1) {
            arrangements = [ [damaged], [okay] ];
        }
        else {
            const tailArrangements1 = enumerateArrangements(springs.slice(1));
            // console.log(`  rcvd ${ tailArrangements1.length } arrangements (#)`);
            for (const tailArrangement of tailArrangements1) {
                tailArrangement.unshift(damaged);
            }

            const tailArrangements2 = enumerateArrangements(springs.slice(1));
            // console.log(`  rcvd ${ tailArrangements2.length } arrangements (.)`);
            for (const tailArrangement of tailArrangements2) {
                tailArrangement.unshift(okay);
            }

            arrangements = [...tailArrangements1, ...tailArrangements2];
        }
    }

    // console.log('input:');
    // console.log(`  ${ springs }`);
    // console.log('output:');
    // for (const arrangement of arrangements) {
    //     console.log(`  ${ arrangement }`);
    // }

    return arrangements;
}

function damageRecordsValid(partialDamageRecord, completeDamageRecord) {
    if (partialDamageRecord.length > completeDamageRecord.length) {
        return false;
    }
    else {
        for (let i = 0; i < partialDamageRecord.length; i++) {
            if (partialDamageRecord[i] !== completeDamageRecord[i]) {
                return false;
            }
        }
        return true;
    }
}

function validPartialArrangement(arrangement, damageRecord) {
    const newDamageRecord = [];

    let prevSpring = arrangement[0];
    let damageCount = 0;
    if (prevSpring === damaged) {
        damageCount++;
    }

    for (const spring of arrangement.slice(1)) {
        if (spring === unknown) {
            return damageRecordsValid(newDamageRecord, damageRecord);
        }

        if (prevSpring === damaged) {
            if (spring === damaged) {
                damageCount++;
            }
            else {
                newDamageRecord.push(damageCount);
                if (!damageRecordsValid(newDamageRecord, damageRecord)) {
                    return false;
                }

                damageCount = 0;
            }
        }
        else {
            if (spring === damaged) {
                damageCount++;
            }
        }
        prevSpring = spring;
    }

    if (damageCount > 0) {
        newDamageRecord.push(damageCount);
    }

    return damageRecordsValid(newDamageRecord, damageRecord);
}

function validArrangement(arrangement, damageRecord) {
    const newDamageRecord = [];

    let prevSpring = arrangement[0];
    let damageCount = 0;
    if (prevSpring === damaged) {
        damageCount++;
    }

    for (const spring of arrangement.slice(1)) {
        if (prevSpring === damaged) {
            if (spring === damaged) {
                damageCount++;
            }
            else {
                newDamageRecord.push(damageCount);
                damageCount = 0;
            }
        }
        else {
            if (spring === damaged) {
                damageCount++;
            }
        }
        prevSpring = spring;
    }

    if (damageCount > 0) {
        newDamageRecord.push(damageCount);
    }

    if (damageRecord.length !== newDamageRecord.length) {
        return false;
    }
    else {
        for (let i = 0; i < damageRecord.length; i++) {
            if (damageRecord[i] !== newDamageRecord[i]) {
                return false;
            }
        }
        return true;
    }
}

function countArrangements(row, index) {
    let validCount = 0;
    const stack = [row.springs];

    while (stack.length > 0) {
        const sequence = stack.pop();
        let unknownFound = false;
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i] === unknown) {
                const okaySequence = [...sequence.slice(0, i), okay, ...sequence.slice(i + 1)];
                if (validPartialArrangement(okaySequence, row.damageRecord)) {
                    stack.push(okaySequence);
                }

                const damagedSequence = [...sequence.slice(0, i), damaged, ...sequence.slice(i + 1)];
                if (validPartialArrangement(damagedSequence, row.damageRecord)) {
                    stack.push(damagedSequence);
                }

                unknownFound = true;
                break;
            }
        }
        if (!unknownFound && validArrangement(sequence, row.damageRecord)) {
            validCount++;
        }
    }

    console.log(`${ index + 1 }: ${ validCount }`);
    return validCount;
}

function getPatterns(data) {
    const patterns = [];
    let pattern = [];
    for (const row of data) {
        if (row.length === 0) {
            patterns.push(pattern);
            pattern = [];
        }
        else {
            pattern.push(row);
        }
    }

    return patterns;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const patterns = getPatterns(data);

    const springData = data.map(parseSpringRow);

    const arrangements = springData.map(countArrangements);
    const total = arrangements.reduce(sumElements);

    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
