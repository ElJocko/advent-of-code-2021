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
    const trimmedNumber = numberString.trim()
    return Number.parseInt(trimmedNumber);
}

function getSeeds(line) {
    const values = line.slice(7).split(' ').map(x => Number.parseInt(x));
    const seeds = [];
    for (let i = 0; i < values.length; i += 2) {
        seeds.push({ start: values[i], range: values[i + 1 ]});
    }
    return seeds;
}

function getConversion(line) {
    const values = line.split(' ').map(x => Number.parseInt(x));
    return {
        fromBase: values[1],
        toBase: values[0],
        range: values[2]
    };
}

function getMaps(lines, acc) {
    const index = lines.findIndex(l => l.includes('map'));
    if (index === -1) {
        const mapLines = lines.slice(0).filter(l => l.length > 0);
        const conversions = mapLines.map(getConversion).sort((a, b) => a.fromBase - b.fromBase);
        acc.push(conversions);

        return acc;

    }
    else {
        const mapLines = lines.slice(0, index).filter(l => l.length > 0);
        const conversions = mapLines.map(getConversion).sort((a, b) => a.fromBase - b.fromBase);
        acc.push(conversions);

        return getMaps(lines.slice(index + 1), acc);
    }
}

function lookupValue(value, conversions) {
    for (const conversion of conversions) {
        if (value >= conversion.fromBase && value < conversion.fromBase + conversion.range) {
            const offset = conversion.toBase - conversion.fromBase;
            return value + offset;
        }
    }

    return value;
}

function convertValue(value, maps) {
    let nextValue = value;
    for (const map of maps) {
        nextValue = lookupValue(nextValue, map);
    }

    return nextValue;

    // const nextValue = lookupValue(value, maps[0]);
    //
    // return convertValue(nextValue, maps.slice(1));
}

function makeConvertSeed(maps) {
    return function(seed) {
        return convertValue(seed, maps);
    }
}

function convertSeedRange(seed, range) {

}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const seeds = getSeeds(data[0]);
    const maps = getMaps(data.slice(3), []);

    // const seedBlanks = new Array(seedPairs[1]).fill(0);
    // const seeds = seedBlanks.map((e, i) => seedPairs[0] + i);

    const convertSeed = makeConvertSeed(maps);

    // let minLocation = Number.MAX_SAFE_INTEGER;
    // for (const seed of seeds) {
    //     const location = convertSeed(seed);
    //     minLocation = Math.min(minLocation, location);
    // }

    let minLocation = Number.MAX_SAFE_INTEGER;
    const locations = [];

    for (const seedRange of seeds) {
        const start = seedRange.start;
        const end = seedRange.start + seedRange.range;
        console.log(`start = ${ start } end = ${ end }`);
        for (let seed = start; seed < end; seed++) {
            // for (const seed of seeds) {
            const location = convertValue(seed, maps);

            if (location < minLocation) {
                console.log(`${ seed } => ${ location }`);
                minLocation = location;
            }
            // locations.push(location);
            // const filteredLocations = locations.filter(l => seeds.includes(l));
            // const minLocation = Math.min(...filteredLocations);
        }
    }
    // const minLocation = Math.min(...locations);

    console.timeEnd();

    console.log(minLocation);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
