'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseLine(line) {
    const coords = line.split(',');
    const cube = {
        x: Number(coords[0]),
        y: Number(coords[1]),
        z: Number(coords[2])
    };

    return cube;
}

function parseData(data) {
    const paths = data.map(parseLine);
    return paths.flat();
}

function findOpenSides(cubes) {
    return function(cube) {
        let openSides = 6;
        for (const otherCube of cubes) {
            if (cube !== otherCube) {
                if (cube.x === otherCube.x && cube.y === otherCube.y) {
                    if (Math.abs(cube.z - otherCube.z) === 1) {
                        openSides--;
                    }
                }
                else if (cube.x === otherCube.x && cube.z === otherCube.z) {
                    if (Math.abs(cube.y - otherCube.y) === 1) {
                        openSides--;
                    }
                }
                else if (cube.y === otherCube.y && cube.z === otherCube.z) {
                    if (Math.abs(cube.x - otherCube.x) === 1) {
                        openSides--;
                    }
                }
            }
        }
        return openSides;
    }
}

function makeKey(space) {
    return `${ space.x }//${ space.y }//${ space.z }`;
}

function computeEmptySpaces(cubes, upperLeft, lowerRight) {
    const emptySpaces = new Map();
    for (let x = upperLeft.x - 1; x <= lowerRight.x + 1; x++) {
        for (let y = upperLeft.y - 1; y <= lowerRight.y + 1; y++) {
            for (let z = upperLeft.z - 1; z <= lowerRight.z + 1; z++) {
                if (!cubes.find(c => c.x === x && c.y === y && c.z === z)) {
                    const space = { x, y, z };
                    emptySpaces.set(makeKey(space), space);
                }
            }
        }
    }
    return emptySpaces;
}

function doGraphsConnect(graph1, graph2) {
    const graph2Map = new Map(graph2.map(c => [makeKey(c), c]));
    for (const space of graph1) {
        for (const adjacentSpace of adjacentSpaces(space)) {
            if (graph2Map.has(makeKey(adjacentSpace))) {
                const space2 = graph2Map.get(makeKey(adjacentSpace));
                console.log('graphs connect!');
                return true;
            }
        }
    }
    return false;
}

function isGraphEnclosed(graph, cubeMap) {
    const graphMap = new Map(graph.map(c => [makeKey(c), c]));
    let selfCount = 0;
    let cubeCount = 0;
    for (const space of graph) {
        for (const adjacentSpace of adjacentSpaces(space)) {
            if (graphMap.has(makeKey(adjacentSpace))) {
                selfCount++;
            }
            else if (cubeMap.has(makeKey(adjacentSpace))) {
                cubeCount++;
            }
            else {
                console.log('graph not enclosed!');
                console.log(`${ space.x } ${ space.y } ${ space.z } not enclosed at ${ adjacentSpace.x } ${ adjacentSpace.y } ${ adjacentSpace.z }`);
            }
        }
    }
    console.log(`selfCount = ${ selfCount }  cubeCount = ${ cubeCount }`);
}

function* adjacentSpaces(space) {
    yield { x: space.x + 1, y: space.y, z: space.z };
    yield { x: space.x - 1, y: space.y, z: space.z };
    yield { x: space.x, y: space.y + 1, z: space.z };
    yield { x: space.x, y: space.y - 1, z: space.z };
    yield { x: space.x, y: space.y, z: space.z + 1 };
    yield { x: space.x, y: space.y, z: space.z - 1 };
}

function findGraphs(spaces) {
    const spacesCopy = new Map(spaces);
    const graphs = [];
    while (spacesCopy.size > 0) {
        const stack = [];
        const graph = [];
        const start = spacesCopy.values().next().value;
        spacesCopy.delete(makeKey(start));
        stack.push(start);
        graph.push(start);
        while (stack.length > 0) {
            const space = stack.pop();
            for (const adjacentSpace of adjacentSpaces(space)) {
                if (spacesCopy.has(makeKey(adjacentSpace))) {
                    spacesCopy.delete(makeKey(adjacentSpace));
                    stack.push(adjacentSpace);
                    graph.push(adjacentSpace);
                }
            }
        }
        graphs.push(graph);
    }

    return graphs;
}

function isInteriorGraph(upperLeft, lowerRight) {
    return function(graph) {
        for (let i = 0; i < graph.length; i++) {
            const space = graph[i];
            if (space.x === upperLeft.x - 1 || space.y === upperLeft.y - 1 || space.z === upperLeft.z - 1) {
                return false;
            }
            else if (space.x === lowerRight.x + 1 || space.y === lowerRight.y + 1 || space.z === lowerRight.z + 1) {
                return false;
            }
        }
        return true;
    }
}

async function runner() {
    const data = await reader.readFile(dataFilePath);

    console.time();

    const cubes = parseData(data);

    const openSides = cubes.map(findOpenSides(cubes));
    const sum = openSides.reduce((acc, value) => acc + value);

    const minX = cubes.reduce((acc, value) => Math.min(acc, value.x), Number.MAX_VALUE);
    const minY = cubes.reduce((acc, value) => Math.min(acc, value.y), Number.MAX_VALUE);
    const minZ = cubes.reduce((acc, value) => Math.min(acc, value.z), Number.MAX_VALUE);

    const maxX = cubes.reduce((acc, value) => Math.max(acc, value.x), 0);
    const maxY = cubes.reduce((acc, value) => Math.max(acc, value.y), 0);
    const maxZ = cubes.reduce((acc, value) => Math.max(acc, value.z), 0);

    const upperLeft = { x: minX, y: minY, z: minZ };
    const lowerRight = { x: maxX, y: maxY, z: maxZ };

    const emptySpaces = computeEmptySpaces(cubes, upperLeft, lowerRight);
    const graphs = findGraphs(emptySpaces);

    const cubeMap = new Map(cubes.map(c => [makeKey(c), c]));
    const cubeGraphs = findGraphs(cubeMap);
    const interiorGraphs = graphs.filter(isInteriorGraph(upperLeft, lowerRight));

    const minX3 = interiorGraphs[3].reduce((acc, value) => Math.min(acc, value.x), Number.MAX_VALUE);
    const minY3 = interiorGraphs[3].reduce((acc, value) => Math.min(acc, value.y), Number.MAX_VALUE);
    const minZ3 = interiorGraphs[3].reduce((acc, value) => Math.min(acc, value.z), Number.MAX_VALUE);

    const maxX3 = interiorGraphs[3].reduce((acc, value) => Math.max(acc, value.x), 0);
    const maxY3 = interiorGraphs[3].reduce((acc, value) => Math.max(acc, value.y), 0);
    const maxZ3 = interiorGraphs[3].reduce((acc, value) => Math.max(acc, value.z), 0);

    // for (let i = graphs.length - 1; i >= 0; i--) {
    //     for (let j = i - 1; j >= 0; j--) {
    //         const result = doGraphsConnect(graphs[i], graphs[j]);
    //         // console.log(`graph ${ i } ${ j } ${ result }`);
    //     }
    // }

    isGraphEnclosed(interiorGraphs[3], cubeMap);


    let graphTotalSum = 0;
    for (let i = 0; i < interiorGraphs.length; i++) {
        const graph = interiorGraphs[i];
        const graphOpenSides = graph.map(findOpenSides(graph));
        const graphSum = graphOpenSides.reduce((acc, value) => acc + value);
        graphTotalSum += graphSum;
    }
    console.timeEnd();

    console.log(sum);
    console.log(sum - graphTotalSum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
