'use strict';

const reader = require('../../lib/readTuples');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

const shapes = {
    rock: 1,
    paper: 2,
    scissors: 3
};

const decode1 = {
    A: shapes.rock,
    B: shapes.paper,
    C: shapes.scissors
};

const decode2 = {
    X: shapes.rock,
    Y: shapes.paper,
    Z: shapes.scissors
};

const score = {
    win: 6,
    draw: 3,
    lose: 0
};

function scoreKey(opponentShape, playerShape) {
    return opponentShape + (playerShape * 4);
}

const scoreTable = new Map([
    [scoreKey(shapes.rock, shapes.rock), score.draw],
    [scoreKey(shapes.rock, shapes.paper), score.win],
    [scoreKey(shapes.rock, shapes.scissors), score.lose],
    [scoreKey(shapes.paper, shapes.rock), score.lose],
    [scoreKey(shapes.paper, shapes.paper), score.draw],
    [scoreKey(shapes.paper, shapes.scissors), score.win],
    [scoreKey(shapes.scissors, shapes.rock), score.win],
    [scoreKey(shapes.scissors, shapes.paper), score.lose],
    [scoreKey(shapes.scissors, shapes.scissors), score.draw]
]);

function outcomeScore(opponentShape, playerShape) {
    return scoreTable.get(scoreKey(opponentShape, playerShape));
}

function scoreGame(gameCodes) {
    const opponentShape = decode1[gameCodes[0]];
    const playerShape = decode2[gameCodes[1]];

    return playerShape + outcomeScore(opponentShape, playerShape);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const totalScore = data.map(scoreGame).reduce(sumElements);

    console.timeEnd();

    console.log(totalScore);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
