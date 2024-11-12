'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const rock1 = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 }
];

const rock2 = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 }
];

const rock3 = [
    { x: 0, y:0 },
    { x: 1, y:0 },
    { x: 2, y:0 },
    { x: 2, y:1 },
    { x: 2, y:2 }
];

const rock4 = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 }
];

const rock5 = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
];

const rocks = [ rock1, rock2, rock3, rock4, rock5 ];

function blockSort(a, b) {
    return a.y - b.y;
}

// function topBlock(blocks) {
//     return blocks[blocks.length - 1];
// }

function translateRock(rock, rockOrigin) {
    const rockBlocks = [];
    for (const originBlock of rock) {
        const block = {
            x: originBlock.x + rockOrigin.x,
            y: originBlock.y + rockOrigin.y
        };
        rockBlocks.push(block);
    }
    return rockBlocks;
}

function getNextJet(jets) {
    const jet = jets[jets.jetIndex]
    jets.jetIndex++;
    if (jets.jetIndex >= jets.length) {
        // console.log('resetting jets.jetIndex to 0');
        jets.jetIndex = 0;
    }
    return jet;
}

function rightmostBlock(blocks) {
    let result = 0;
    for (const block of blocks) {
        result = Math.max(result, block.x);
    }
    return result;
}

function leftmostBlock(blocks) {
    let result = 1000;
    for (const block of blocks) {
        result = Math.min(result, block.x);
    }
    return result;
}

function topmostBlock(blocks) {
    let result = 0;
    for (const block of blocks) {
        result = Math.max(result, block.y);
    }
    return result;
}

function moveBlocksRight(blocks) {
    for (const block of blocks) {
        block.x++;
    }
}

function moveBlocksLeft(blocks) {
    for (const block of blocks) {
        block.x--;
    }
}

function moveBlocksDown(blocks) {
    for (const block of blocks) {
        block.y--;
    }

    return blocks;
}

const right = '>';
const left = '<';
function applyJetToRock(jet, rockBlocks, blocks) {
    if (jet === right) {
        const rightPos = rightmostBlock(rockBlocks);
        if (rightPos < 7 && rockCanMoveRight(rockBlocks, blocks)) {
            // console.log('move right')
            moveBlocksRight(rockBlocks);
        }
        else {
            // console.log('cannot move right')
        }
    }
    else {
        const leftPos = leftmostBlock(rockBlocks);
        if (leftPos > 1 && rockCanMoveLeft(rockBlocks, blocks)) {
            // console.log('move left')
            moveBlocksLeft(rockBlocks);
        }
        else {
            // console.log('cannot move left')
        }
    }
}

function collision(blocks1, blocks2) {
    for (const block of blocks1) {
        if (blocks2.findLast(b => b.x === block.x && b.y === block.y)) {
            return true;
        }
    }

    return false;
}
function rockCanMoveRight(rockBlocks, blocks) {
    const movedRockBlocks = [];
    for (const block of rockBlocks) {
        movedRockBlocks.push({ x: block.x + 1, y: block.y });
    }

    return !collision(movedRockBlocks, blocks);
}

function rockCanMoveLeft(rockBlocks, blocks) {
    const movedRockBlocks = [];
    for (const block of rockBlocks) {
        movedRockBlocks.push({ x: block.x - 1, y: block.y });
    }

    return !collision(movedRockBlocks, blocks);
}

function rockCanFall(rockBlocks, blocks) {
    const movedRockBlocks = [];
    for (const block of rockBlocks) {
        movedRockBlocks.push({ x: block.x, y: block.y - 1 });
    }

    return !collision(movedRockBlocks, blocks);
}

function addBlocks(fromBlocks, toBlocks) {
    for (const block of fromBlocks) {
        toBlocks.push(block);
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const jets = data[0].split('');
    console.log(`${ jets.length } jets`);

    jets.jetIndex = 0;

    const blocks = [];

    const blockDeltas = [];
    let prevHeight = 0;
    let indexOrig = 0;
    let indexCopy = 0;
    let maxCopy = 0;
    // let searchBase = 15;

    // Add the floor
    blocks.push({ x: 0, y: 0 });
    blocks.push({ x: 1, y: 0 });
    blocks.push({ x: 2, y: 0 });
    blocks.push({ x: 3, y: 0 });
    blocks.push({ x: 4, y: 0 });
    blocks.push({ x: 5, y: 0 });
    blocks.push({ x: 6, y: 0 });

    const maxRocks = 6000;
    for (let i = 0; i < maxRocks; i++) {
        // console.log(`${ i }, top height = ${ topmostBlock(blocks) }`);

        const rockIndex = i%5;
        const rock = rocks[rockIndex];

        // blocks.sort(blockSort);

        // Rock appears
        const rockOrigin = {x: 3, y: topmostBlock(blocks) + 4 };
        const rockBlocks = translateRock(rock, rockOrigin);

        let rockDone = false;
        while (!rockDone) {
            // Jet of gas pushes rock
            const jet = getNextJet(jets);
            applyJetToRock(jet, rockBlocks, blocks);

            if (jets.jetIndex === 0) {
                console.log(`reset jetIndex (${ i })`);
            }

            // Rock falls
            if (rockCanFall(rockBlocks, blocks)) {
                // console.log('moving down')
                moveBlocksDown(rockBlocks);
            }
            else {
                // console.log('cannot move down')
                addBlocks(rockBlocks, blocks);
                rockDone = true;
            }
        }

        const currentHeight = topmostBlock(blocks);
        blockDeltas.push(currentHeight - prevHeight);
        prevHeight = currentHeight;

        // if (i > searchBase) {
        //     if (indexCopy === 0) {
        //         indexCopy = i;
        //         indexOrig = searchBase;
        //     }
        //     else {
        //         indexOrig++;
        //     }
        //
        //     if (blockDeltas[indexOrig] === blockDeltas[(indexOrig - searchBase) + indexCopy]) {
        //         if ((indexOrig - searchBase) > maxCopy) {
        //             maxCopy = indexOrig - searchBase;
        //             // console.log(`Found ${ maxCopy + 1 } duplicate height deltas (start = ${ indexCopy })`);
        //         }
        //     }
        //     else {
        //         indexCopy = 0;
        //     }
        // }


        // if (i > 100) {
        //     let initialSum = blockDeltas.slice(0,15).reduce((acc, value) => acc + value);
        //     let repeatingSum1 = blockDeltas.slice(15, 50).reduce((acc, value) => acc + value);
        //     let repeatingSum2 = blockDeltas.slice(50, 85).reduce((acc, value) => acc + value);
        //
        //     console.log(initialSum, repeatingSum1, repeatingSum2);
        //
        //     for (let j = 1; j <= 35; j++) {
        //         console.log(`${ j } sum = ${ blockDeltas.slice(15, 15 + j).reduce((acc, value) => acc + value) }`);
        //     }
        //
        //     console.log((2022 - 15)/35);
        //     console.log((2022 - 15)%35);
        //
        //     console.log();
        // }
    }

    // for (let searchBase = 0; searchBase < 3000; searchBase++) {
    //     for (let searchOffset = 1; searchOffset < 2000; searchOffset++) {
    //         for (let k = 0; k < 300; k++) {
    //             const indexOrig = searchBase + k;
    //             const indexCopy = searchBase + searchOffset + k;
    //             if (blockDeltas[indexOrig] === blockDeltas[indexCopy]) {
    //                 if (k > maxCopy) {
    //                     maxCopy = k;
    //                     console.log(`Found ${ maxCopy + 1 } duplicate height deltas (searchBase = ${ searchBase } start = ${ searchBase + searchOffset })`);
    //                 }
    //             }
    //             else {
    //                 break;
    //             }
    //         }
    //
    //     }
    // }

    let initialSum = blockDeltas.slice(0,317).reduce((acc, value) => acc + value);
    let repeatingSum1 = blockDeltas.slice(317, 2042).reduce((acc, value) => acc + value);
    let repeatingSum2 = blockDeltas.slice(2042, 3767).reduce((acc, value) => acc + value);

    console.log(initialSum, repeatingSum1, repeatingSum2);

        // for (let j = 1; j <= 35; j++) {
        //     console.log(`${ j } sum = ${ blockDeltas.slice(15, 15 + j).reduce((acc, value) => acc + value) }`);
        // }

    const repeats = Math.floor((1000000000000 - 317)/1725);
    const remainder = (1000000000000 - 317)%1725;
    console.log(repeats);
    console.log(remainder);

    const remainderSum = blockDeltas.slice(317, 317 + remainder).reduce((acc, value) => acc + value)

    console.log(remainderSum);

    console.log(`total height = ${ initialSum + (repeats * repeatingSum1) + remainderSum }`);

    const height = topmostBlock(blocks);

    console.timeEnd();

    console.log(`jets.jetIndex = ${ jets.jetIndex }`);

    console.log(`height = ${ height }`);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
