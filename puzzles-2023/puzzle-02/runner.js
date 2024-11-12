'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function sumElements(acc, elem) {
    return acc + elem;
}

function sumElementIds(acc, elem) {
    return acc + elem.id;
}

function parseGame(line, index) {
    const parsedGame = [];
    parsedGame.id = index + 1;
    const start = line.indexOf(':');
    const draws = line.slice(start + 2).split(';');
    for (const draw of draws) {
        const colorPairs = draw.split(',');
        const parsedDraw = [];
        for (const colorPair of colorPairs) {
            const colorPairItems = colorPair.trimStart().split(' ');
            const parsedColorPair = {
                count: Number.parseInt(colorPairItems[0]),
                color: colorPairItems[1]
            };
            parsedDraw.push(parsedColorPair);
        }
        parsedGame.push(parsedDraw);
    }

    return parsedGame;
}

const maxCubes = {
    red: 12,
    green: 13,
    blue: 14
};

function possible(game) {
    for (const draw of game) {
        for (const colorPair of draw) {
            if (colorPair.count > maxCubes[colorPair.color]) {
                return false;
            }
        }
    }

    return true;
}

function getPower(game) {
    const minCubes = {
        red: 0,
        green:0,
        blue: 0
    };

    for (const draw of game) {
        for (const colorPair of draw) {
            if (colorPair.count > minCubes[colorPair.color]) {
                minCubes[colorPair.color] = colorPair.count;
            }
        }
    }

    return minCubes.red * minCubes.green * minCubes.blue;
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const games = data.map(parseGame);
    const possibleGames = games.filter(possible);
    const total = possibleGames.reduce(sumElementIds, 0);

    // const gamePowers = games.map(getPower);
    // const total = gamePowers.reduce(sumElements);

    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
