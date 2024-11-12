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

function extractGalaxies(data) {
    const galaxies = [];
    galaxies.height = data.length;
    galaxies.width = data[0].length;
    let index = 0;
    for (let i = 0; i < data.length; i++) {
        const row = data[i].split('');
        for (let j = 0; j < row.length; j++) {
            if (row[j] === '#') {
                galaxies.push({ index, r: i, c: j });
                index++;
            }
        }
    }

    return galaxies;
}

function expandGalaxies(galaxies) {
    // find empty rows
    galaxies.emptyRows = [];
    for (let i = 0; i < galaxies.height; i++) {
        const rowCount = galaxies.reduce((a, g) => g.r === i ? a + 1 : a, 0);
        if (rowCount === 0) {
            galaxies.emptyRows.push(i);
        }
    }

    // galaxies.height += emptyRows.length;

    // find empty columns
    galaxies.emptyColumns = [];
    for (let j = 0; j < galaxies.width; j++) {
        const columnCount = galaxies.reduce((a, g) => g.c === j ? a + 1 : a, 0);
        if (columnCount === 0) {
            galaxies.emptyColumns.push(j);
        }
    }

    // galaxies.width += emptyColumns.length;

    // for (const galaxy of galaxies) {
    //     let rowExpandCount = 0;
    //     for (const row of emptyRows) {
    //         if (galaxy.r > row) {
    //             rowExpandCount++;
    //         }
    //     }
    //     galaxy.r += rowExpandCount;
    //
    //     let columnExpandCount = 0;
    //     for (const column of emptyColumns) {
    //         if (galaxy.c > column) {
    //             columnExpandCount++;
    //         }
    //     }
    //     galaxy.c += columnExpandCount;
    // }
    //
    // return galaxies;
}

function computeDistance(a, b, emptyRows, emptyColumns) {
    const distance = Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    const minRow = Math.min(a.r, b.r);
    const maxRow = Math.max(a.r, b.r);

    let expandedRows = 0;
    for (let i = minRow + 1; i < maxRow; i++) {
        if (emptyRows.includes(i)) {
            expandedRows++;
        }
    }

    const minColumn = Math.min(a.c, b.c);
    const maxColumn = Math.max(a.c, b.c);
    let expandedColumns = 0;
    for (let i = minColumn + 1; i < maxColumn; i++) {
        if (emptyColumns.includes(i)) {
            expandedColumns++;
        }
    }

    const factor = 999999;

    return distance + (expandedRows * factor) + (expandedColumns * factor);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const galaxies = extractGalaxies(data);

    expandGalaxies(galaxies);

    let total = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i + 1; j < galaxies.length; j++) {
            const distance = computeDistance(galaxies[i], galaxies[j], galaxies.emptyRows, galaxies.emptyColumns);
            console.log(`${ i } ${ j } (${ distance })`)
            total += distance;
        }
    }

    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
