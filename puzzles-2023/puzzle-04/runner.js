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

function parseCard(line, index) {
    const start = line.indexOf(':');
    const numbers = line.slice(start + 1).split('|');
    const winNumbers = numbers[0].trim().split(' ');
    const matchNumbers = numbers[1].trim().split(' ');
    return {
        index,
        winNumbers: winNumbers.map(parseNumber).filter(x => x),
        matchNumbers: matchNumbers.map(parseNumber).filter(x => x)
    };
}

function scoreCard(card) {
    let matches = 0;
    for (const possibleMatch of card.matchNumbers) {
        for (const winNumber of card.winNumbers) {
            if (possibleMatch === winNumber) {
                matches++;
                break;
            }
        }
    }
    return matches;
    // return matches ? Math.pow(2, matches - 1) : 0;
}

function compute(points, cards, acc) {
    if (points.length === 0) {
        return acc;
    }

    acc.push(cards[0]);

    const addCards = new Array(points[0]).fill(cards[0]);
    const updatedCards = addVectors(cards.slice(1), addCards);

    return compute(points.slice(1), updatedCards, acc);
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const cards = data.map(parseCard);
    const points = cards.map(scoreCard);
    const initialCards = new Array(points.length).fill(1);

    const totalCards = compute(points, initialCards, []);

    const total = totalCards.reduce(sumElements);

    console.timeEnd();

    console.log(total);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
