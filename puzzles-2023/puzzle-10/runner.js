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

const decoder = {
    '|': 'ns',
    '-': 'ew',
    'L': 'ne',
    'J': 'nw',
    '7': 'sw',
    'F': 'se',
    '.': 'no',
    'S': 'start'
};

const cellTypes = {
    ns: { n: true, s: true, e: false, w: false },
    ew: { n: false, s: false, e: true, w: true },
    ne: { n: true, s: false, e: true, w: false },
    nw: { n: true, s: false, e: false, w: true },
    sw: { n: false, s: true, e: false, w: true },
    se: { n: false, s: true, e: true, w: false },
    no: { n: false, s: false, e: false, w: false },
    start: { start: true }
};

function parseGrid(line) {
    const tokens = line.split('');
    return tokens.map(t => { return { type: cellTypes[decoder[t]] }});
}

function findStart(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j].type.start) {
                return { startRow: i, startColumn: j };
            }
        }
    }

    console.log('START NOT FOUND');
}

function getStartType(row, column, grid) {
    let n = false;
    let s = false;
    let e = false;
    let w = false;

    if (row !== 0 && grid[row - 1][column].type.s) {
        n = true;
    }

    if (row !== (grid.length - 1) && grid[row + 1][column].type.n) {
        s = true;
    }

    if (column !== 0 && grid[row][column - 1].type.e) {
        w = true;
    }

    if (column !== (grid[0].length - 1) && grid[row][column + 1].type.w) {
        e = true;
    }

    return { n, s, e, w };
}

function getStartDirection(startType) {
    if (startType.n) {
        return 'n';
    }
    else if (startType.e) {
        return 'e';
    }
    else if (startType.s) {
        return 's';
    }
    else {
        console.log('BAD START DIRECTION');
    }
}

function getExitDirection(directionIn, cellType) {
    if (directionIn === 'n') {
        if (cellType.e) {
            return 'e';
        }
        else if (cellType.w) {
            return 'w';
        }
        else if (cellType.n) {
            return 'n';
        }
        else {
            console.log('EXIT DIRECTION ERROR (n)');
        }
    }
    else if (directionIn === 's') {
        if (cellType.e) {
            return 'e';
        }
        else if (cellType.w) {
            return 'w';
        }
        else if (cellType.s) {
            return 's';
        }
        else {
            console.log('EXIT DIRECTION ERROR (s)');
        }
    }
    else if (directionIn === 'e') {
        if (cellType.n) {
            return 'n';
        }
        else if (cellType.e) {
            return 'e';
        }
        else if (cellType.s) {
            return 's';
        }
        else {
            console.log('EXIT DIRECTION ERROR (e)');
        }
    }
    else if (directionIn === 'w') {
        if (cellType.w) {
            return 'w';
        }
        else if (cellType.n) {
            return 'n';
        }
        else if (cellType.s) {
            return 's';
        }
        else {
            console.log('EXIT DIRECTION ERROR (w)');
        }
    }
    console.log('EXIST DIRECTION ERROR (---)');
}

function getNextPosition(position, grid) {
    let nextRow = position.row;
    let nextColumn = position.column;
    if (position.direction === 'n') {
        nextRow--;
    }
    else if (position.direction === 'e') {
        nextColumn++;
    }
    else if (position.direction === 's') {
        nextRow++;
    }
    else if (position.direction === 'w') {
        nextColumn--;
    }
    else {
        console.log('BAD DIRECTION');
    }

    const exitDirection = getExitDirection(position.direction, grid[nextRow][nextColumn].type);

    return {
        row: nextRow,
        column: nextColumn,
        direction: exitDirection
    };
}

function makeExpandedGrid(grid) {
    const expandedGrid = new Array((grid.length * 2) - 1);
    for (let i = 0; i < expandedGrid.length; i++) {
        expandedGrid[i] = (new Array((grid[0].length * 2) - 1));
        for (let j = 0; j < expandedGrid[i].length; j++) {
            expandedGrid[i][j] = {};
        }
    }

    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[0].length; column++) {
            if (grid[row][column].loop) {
                // console.log(`  ==> ${ row * 2 } ${ column * 2 }`);
                expandedGrid[row * 2][column * 2].loop = true;
                if (column < grid[0].length - 1) {
                    if (grid[row][column].type.e) {
                        // console.log(`  -=> ${ row * 2 } ${ column * 2 + 1 }`);
                        expandedGrid[row * 2][(column * 2) + 1].loop = true;
                    }
                }

                if (row < grid.length - 1) {
                    if (grid[row][column].type.s) {
                        // console.log(`  |=> ${ (row * 2) + 1} ${ column * 2 }`);
                        expandedGrid[(row * 2) + 1][column * 2].loop = true;
                    }
                }
            }
        }
    }

    return expandedGrid;
}

function tracePaths(startRow, startColumn, expandedGrid) {
    const nextPositions = [
        { r: startRow - 1, c: startColumn },
        { r: startRow + 1, c: startColumn },
        { r: startRow, c: startColumn - 1},
        { r: startRow, c: startColumn + 1 }
    ];

    while (nextPositions.length > 0) {
        const nextPosition = nextPositions.pop();
        if (nextPosition.r < 0 || nextPosition.r >= expandedGrid.length) {
            // console.log(`${startRow} ${startColumn} (${nextPosition.r} ${nextPosition.c}) skipping row`);
            continue;
        }
        if (nextPosition.c < 0 || nextPosition.c >= expandedGrid[0].length) {
            // console.log(`${startRow} ${startColumn} (${nextPosition.r} ${nextPosition.c}) skipping column`);
            continue;
        }
        if (expandedGrid[nextPosition.r][nextPosition.c].loop) {
            // console.log(`${startRow} ${startColumn} (${nextPosition.r} ${nextPosition.c}) hit loop`);
            continue;
        }

        if (expandedGrid[nextPosition.r][nextPosition.c].reached) {
            // console.log(`${startRow} ${startColumn} (${nextPosition.r} ${nextPosition.c}) already reached`);
            continue;
        }

        console.log(`${startRow} ${startColumn} (${nextPosition.r} ${nextPosition.c}) reached new position`);

        expandedGrid[nextPosition.r][nextPosition.c].reached = true;
        nextPositions.push({ r: nextPosition.r - 1, c: nextPosition.c });
        nextPositions.push({ r: nextPosition.r + 1, c: nextPosition.c });
        nextPositions.push({ r: nextPosition.r, c: nextPosition.c + 1 });
        nextPositions.push({ r: nextPosition.r, c: nextPosition.c - 1 });
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const grid = data.map(parseGrid);
    const { startRow, startColumn } = findStart(grid);
    const startType = getStartType(startRow, startColumn, grid);
    const startDirection = getStartDirection(startType);

    // replace start placeholder with actual cell type
    grid[startRow][startColumn].type = startType;

    let currentPosition = {
        direction: startDirection,
        row: startRow,
        column: startColumn
    };
    let steps = 0;
    while (true) {
        steps++;
        currentPosition = getNextPosition(currentPosition, grid);
        // console.log(`row = ${ currentPosition.row } column = ${ currentPosition.column }`);
        grid[currentPosition.row][currentPosition.column].loop = true;
        if (currentPosition.row === startRow && currentPosition.column === startColumn) {
            break;
        }
    }

    const expandedGrid = makeExpandedGrid(grid);
    for (let column = 0; column < expandedGrid[0].length; column++) {
        tracePaths(-1, column, expandedGrid);
        tracePaths(expandedGrid.length, column, expandedGrid);
    }
    for (let row = 0; row < expandedGrid.length; row++) {
        tracePaths(row, -1, expandedGrid);
        tracePaths(row, expandedGrid[0].length, expandedGrid);
    }

    let total = 0;
    for (let i = 0; i < expandedGrid.length; i +=2) {
        for (let j = 0; j < expandedGrid[0].length; j += 2) {
            if (!expandedGrid[i][j].loop && !expandedGrid[i][j].reached) {
                console.log(`${ i/2 }, ${ j/2 }`);
                total++;
            }
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
