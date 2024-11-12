'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function isFrameAMarker(frame, frameSize) {
    if (frame.length < frameSize) {
        return false;
    }
    else {
        const charSet = new Set(frame);
        return charSet.size === frame.length;
    }
}

function getFrameAt(startIndex, input, frameSize) {
    if (startIndex + frameSize > input.length) {
        return null;
    }
    else {
        return input.slice(startIndex, startIndex + frameSize);
    }
}

function isMarkerAtIndex(frameSize) {
    return function(char, index, array) {
        const frame = getFrameAt(index, array, frameSize);
        return frame !== null && isFrameAMarker(frame, frameSize);
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const frameSize = 14;
    const input = data[0].split('');

    const startIndexOfMarker = input.findIndex(isMarkerAtIndex(frameSize));

    console.timeEnd();

    if (startIndexOfMarker !== undefined) {
        console.log(startIndexOfMarker + frameSize);
    }
    else {
        console.log('marker not found');
    }
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
