'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseLine(line) {
    const tokens = line.split(',');
    return {
        id: tokens[0],
        flowRate: Number(tokens[1]),
        paths: tokens.slice(2).map(toNode => { return { toNode, weight: 1 }})
    };
}

function findEmptyNode(node) {
    return node.id !== 'AA' && node.flowRate === 0 && node.paths.length === 2;
}

function simplifyNodes(nodes) {
    let emptyNodes = nodes.filter(findEmptyNode);
    for (const emptyNode of emptyNodes) {
        const node1 = nodes.find(node => node.id === emptyNode.paths[0].toNode);
        const node2 = nodes.find(node => node.id === emptyNode.paths[1].toNode);

        const path1 = node1.paths.find(path => path.toNode === emptyNode.id);
        const path2 = node2.paths.find(path => path.toNode === emptyNode.id);

        path1.toNode = node2.id;
        path1.weight += emptyNode.paths[1].weight;

        path2.toNode = node1.id;
        path2.weight += emptyNode.paths[0].weight;

        emptyNode.paths = [];
    }

    return nodes.filter(node => node.paths.length);
}

function parseData(data) {
    return data.map(parseLine);
}

function* allValveCombinations(valves, limit) {
    if (limit === 0) {
        yield[];
    }
    else if (valves.length === 0) {
        yield [];
    }
    else if (valves.length === 1) {
        yield [ valves[0] ];
    }
    else {
        for (let i = 0; i < valves.length; i++) {
            const firstValue = valves[i];
            const remainder = [...valves.slice(0, i), ...valves.slice(i + 1)];
            for (const nextValues of allValveCombinations(remainder, limit - 1)) {
                yield [firstValue, ...nextValues];
            }
        }
    }
}

const pathWeightCache = new Map();
function findPathWeight(fromNode, toNode, nodes) {
    const key = `${ fromNode.id }//${ toNode.id }`;
    const weight = pathWeightCache.get(key);
    if (weight) {
        return weight;
    }

    const nodesToVisit = [];
    for (const path of fromNode.paths) {
        const nextNode = nodes.find(node => node.id === path.toNode);
        nodesToVisit.push({ nextNode, weightToNode: path.weight });
    }

    nodesToVisit.sort((a, b) => a.weightToNode - b.weightToNode);

    while(nodesToVisit.length > 0) {
        const path = nodesToVisit.shift();
        if (path.nextNode.id === toNode.id) {
            pathWeightCache.set(key, path.weightToNode);
            return path.weightToNode;
        }
        else {
            for (const nextPath of path.nextNode.paths) {
                const nextNode = nodes.find(node => node.id === nextPath.toNode);
                nodesToVisit.push({ nextNode, weightToNode: path.weightToNode + nextPath.weight });
                nodesToVisit.sort((a, b) => a.weightToNode - b.weightToNode);
            }
        }
    }
}

function computeTotalFlow(nodes, startNode, remainingNodes, state) {
    if (remainingNodes.length === 0) {
        return state.totalFlow + (state.combinedFlowRate * state.timeRemaining);
    }

    let maxTotalFlow = state.totalFlow;
    for (const nextNode of remainingNodes) {
        let totalFlow;
        const pathWeight = findPathWeight(startNode, nextNode, nodes);
        if (pathWeight + 1 > state.timeRemaining) {
            totalFlow = state.totalFlow + (state.combinedFlowRate * state.timeRemaining);
        }
        else {
            const nextState = {
                totalFlow: state.totalFlow + state.combinedFlowRate * (pathWeight + 1),
                combinedFlowRate: state.combinedFlowRate + nextNode.flowRate,
                timeRemaining: state.timeRemaining - (pathWeight + 1)
            }
            const nextRemainingNodes = remainingNodes.filter(node => node.id !== nextNode.id);

            totalFlow = computeTotalFlow(nodes, nextNode, nextRemainingNodes, nextState);
        }

        maxTotalFlow = Math.max(totalFlow, maxTotalFlow);
    }

    return maxTotalFlow;
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const baseNodes = parseData(data);
    const nodes = simplifyNodes(baseNodes);

    const startNode = nodes.find(node => node.id === 'AA');
    const workingNodes = nodes.filter(node => node.flowRate > 0).sort((a, b) => b.flowRate - a.flowRate);

    const maxTime = 30;
    const initialState = {
        totalFlow: 0,
        combinedFlowRate: 0,
        timeRemaining: maxTime
    }
    const maxTotalFlow = computeTotalFlow(nodes, startNode, workingNodes, initialState);

    console.timeEnd();

    console.log(maxTotalFlow);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
