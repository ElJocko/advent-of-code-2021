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

function parseHands(line) {
    const parts = line.split(' ');
    return {
        cards: parts[0].split(''),
        bid: Number.parseInt(parts[1])
    };
}

const types = {
    fiveOfAKind: 6,
    fourOfAKind: 5,
    fullHouse: 4,
    threeOfAKind: 3,
    twoPair: 2,
    onePair: 1,
    highCard: 0
};

const cardOrder = {
    'A': 13,
    'K': 12,
    'Q': 11,
    'T': 9,
    '9': 8,
    '8': 7,
    '7': 6,
    '6': 5,
    '5': 4,
    '4': 3,
    '3': 2,
    '2': 1,
    'J': 0
};

function makeCardMap(cards) {
    const cardMap = new Map();
    for (const card of cards.cards) {
        if (cardMap.has(card)) {
            cardMap.set(card, cardMap.get(card) + 1);
        }
        else {
            cardMap.set(card, 1);
        }
    }
    return cardMap;
}

function getType(cards) {
    const cardMap = makeCardMap(cards);
    const typeCounts = Array.from(cardMap, ([key, value]) => ({ key, value }));

    const jokerCount = cardMap.get('J') ? cardMap.get('J') : 0;

    typeCounts.sort((a, b) => b.value - a.value);

    if (jokerCount === 5 || jokerCount === 4) {
        return types.fiveOfAKind;
    }
    else if (jokerCount === 3) {
        if (typeCounts[1].value === 2) {
            return types.fiveOfAKind;
        }
        else {
            return types.fourOfAKind;
        }
    }

    let threeFound = false;
    let twoFound = false;
    for (const typeCount of typeCounts) {
        if (typeCount.key === 'J') {
            continue;
        }

        if (typeCount.value === 5) {
            return types.fiveOfAKind;
        }
        else if (typeCount.value === 4) {
            if (jokerCount > 0) {
                return types.fiveOfAKind;
            }
            else {
                return types.fourOfAKind;
            }
        }
        else if (typeCount.value === 3) {
            if (jokerCount === 2) {
                return types.fiveOfAKind;
            }
            else if (jokerCount === 1) {
                return types.fourOfAKind;
            }
            else {
                threeFound = true;
            }
        }
        else if (typeCount.value === 2) {
            if (jokerCount === 2) {
                return types.fourOfAKind;
            }
            else if (threeFound) {
                return types.fullHouse;
            }
            else if (twoFound) {
                if (jokerCount === 1) {
                    return types.fullHouse;
                }
                else {
                    return types.twoPair;
                }
            }
            else {
                twoFound = true;
            }
        }
        else {
            if (threeFound) {
                return types.threeOfAKind;
            }
            else if (twoFound) {
                if (jokerCount === 1) {
                    return types.threeOfAKind;
                }
                else {
                    return types.onePair;
                }
            }
            else {
                if (jokerCount === 2) {
                    return types.threeOfAKind;
                }
                else if (jokerCount === 1) {
                    return types.onePair
                }
                else {
                    return types.highCard;
                }
            }
        }
    }
}

function handSort(a, b) {
    a.type = getType(a);
    b.type = getType(b);

    if (a.type !== b.type) {
        return a.type - b.type;
    }
    else {
        for (let i = 0; i < a.cards.length; i++) {
            if (cardOrder[a.cards[i]] !== cardOrder[b.cards[i]]) {
                return cardOrder[a.cards[i]] - cardOrder[b.cards[i]];
            }
        }
        return 0;
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const hands = data.map(parseHands);
    hands.sort(handSort);

    let total = 0;
    for (let i = 0; i < hands.length; i++) {
        total = total + hands[i].bid * (i + 1);
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
