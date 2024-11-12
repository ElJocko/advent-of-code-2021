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

function computePairsOfNodes(nodes) {
    const pairs = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
            pairs.push([ nodes[i], nodes[j]]);
        }
    }
    return pairs;
}

function actorSort(a, b) {
    if (a.currentNode === null) {
        return 1;
    }
    else if (b.currentNode === null) {
        return -1;
    }
    else {
        return a.completesAtTimeRemaining - b.completesAtTimeRemaining;
    }
}

function computeTotalFlow(nodes, initialState) {
    const stateStack = [ initialState ];
    let maxTotalFlow = 0;
    let stateCount = 0;
    while (stateStack.length > 0) {
        stateCount++;
        if (stateCount%10000000 === 0) {
            console.log(`${ stateCount } stack size = ${ stateStack.length } (${ maxTotalFlow })`);
        }

        const state = stateStack.pop();

        if (state.actors[0].event === null && state.actors[1].event === null) {
            // Both actors need events
            if (state.remainingNodes.length === 0) {
                const nextActors = [];

                const event = {
                    type: 'actorDone'
                };
                nextActors.push({currentNode: state.actors[0].currentNode, event: event});
                nextActors.push({currentNode: state.actors[1].currentNode, event: event});
                const nextState = {
                    totalFlow: state.totalFlow,
                    combinedFlowRate: state.combinedFlowRate,
                    timeElapsed: state.timeElapsed,
                    timeRemaining: state.timeRemaining,
                    actors: nextActors,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState);
            }
            else if (state.remainingNodes.length === 1) {
                const nextActors0 = [];

                // actor 0 gets the last node
                const nextNode = state.remainingNodes.pop();
                let pathWeight = findPathWeight(state.actors[0].currentNode, nextNode, nodes);
                if (pathWeight + 1 > state.timeRemaining) {
                    nextActors0.push({ currentNode: state.actors[0].currentNode, event: { type: 'actorDone' }});
                }
                else {
                    const event = {
                        type: 'openValve',
                        nextNode: nextNode,
                        timestamp: state.timeElapsed + pathWeight + 1
                    }
                    nextActors0.push({ currentNode: state.actors[0].currentNode, event: event });
                }

                // actor 1 is done
                const event0 = {
                    type: 'actorDone'
                };
                nextActors0.push({currentNode: state.actors[1].currentNode, event: event0});
                const nextState0 = {
                    totalFlow: state.totalFlow,
                    combinedFlowRate: state.combinedFlowRate,
                    timeRemaining: state.timeRemaining,
                    timeElapsed: state.timeElapsed,
                    actors: nextActors0,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState0);

                // OR
                // actor 1 gets the last node
                const nextActors1 = [];

                pathWeight = findPathWeight(state.actors[1].currentNode, nextNode, nodes);
                if (pathWeight + 1 > state.timeRemaining) {
                    nextActors1.push({ currentNode: state.actors[1].currentNode, event: { type: 'actorDone' }});
                }
                else {
                    const event = {
                        type: 'openValve',
                        nextNode: nextNode,
                        timestamp: state.timeElapsed + pathWeight + 1
                    }
                    nextActors1.push({ currentNode: state.actors[1].currentNode, event: event });
                }

                // actor 0 is done
                const event1 = {
                    type: 'actorDone'
                };
                nextActors1.push({currentNode: state.actors[0].currentNode, event: event1});
                const nextState1 = {
                    totalFlow: state.totalFlow,
                    combinedFlowRate: state.combinedFlowRate,
                    timeElapsed: state.timeElapsed,
                    timeRemaining: state.timeRemaining,
                    actors: nextActors1,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState1);
            }
            else {
                // Both actors get events
                for (const nextNode0 of state.remainingNodes) {
                    let actor0;
                    const pathWeight = findPathWeight(state.actors[0].currentNode, nextNode0, nodes);
                    if (pathWeight + 1 > state.timeRemaining) {
                        actor0 = { currentNode: state.actors[0].currentNode, event: { type: 'actorDone' }};
                    }
                    else {
                        const event = {
                            type: 'openValve',
                            nextNode: nextNode0,
                            timestamp: state.timeElapsed + pathWeight + 1
                        }
                        actor0 = { currentNode: state.actors[0].currentNode, event: event };
                    }
                    const nodesAfterFirstActor = state.remainingNodes.filter(node => node.id !== nextNode0.id);

                    for (const nextNode1 of nodesAfterFirstActor) {
                        const nextActors = [];
                        nextActors.push(actor0);

                        const pathWeight = findPathWeight(state.actors[1].currentNode, nextNode1, nodes);
                        if (pathWeight + 1 > state.timeRemaining) {
                            nextActors.push({ currentNode: state.actors[1].currentNode, event: { type: 'actorDone' }});
                        }
                        else {
                            const event = {
                                type: 'openValve',
                                nextNode: nextNode1,
                                timestamp: state.timeElapsed + pathWeight + 1
                            }
                            nextActors.push({ currentNode: state.actors[1].currentNode, event: event });
                        }
                        const nextState = {
                            totalFlow: state.totalFlow,
                            combinedFlowRate: state.combinedFlowRate,
                            timeElapsed: state.timeElapsed,
                            timeRemaining: state.timeRemaining,
                            actors: nextActors,
                            remainingNodes: nodesAfterFirstActor.filter(node => node.id !== nextNode1.id)
                        }
                        stateStack.push(nextState);
                    }
                }
            }
        }
        else if (state.actors[0].event === null || state.actors[1].event === null) {
            // One actor needs an event
            let actorIndex;
            if (state.actors[0].event === null) {
                actorIndex = 0;
            }
            else {
                actorIndex = 1;
            }

            if (state.remainingNodes.length === 0) {
                const nextActors = [];
                nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
                nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

                nextActors[actorIndex].event = {type: 'actorDone'};
                const nextState = {
                    totalFlow: state.totalFlow,
                    combinedFlowRate: state.combinedFlowRate,
                    timeElapsed: state.timeElapsed,
                    timeRemaining: state.timeRemaining,
                    actors: nextActors,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState);
            }
            else if (state.remainingNodes.length === 1) {
                const nextActors = [];
                nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
                nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

                const nextNode = state.remainingNodes.pop();
                let pathWeight = findPathWeight(nextActors[actorIndex].currentNode, nextNode, nodes);
                if (pathWeight + 1 > state.timeRemaining) {
                    nextActors[actorIndex].event = {type: 'actorDone'};
                }
                else {
                    const event = {
                        type: 'openValve',
                        nextNode: nextNode,
                        timestamp: state.timeElapsed + pathWeight + 1
                    }
                    nextActors[actorIndex].event = event;
                }

                const nextState = {
                    totalFlow: state.totalFlow,
                    combinedFlowRate: state.combinedFlowRate,
                    timeElapsed: state.timeElapsed,
                    timeRemaining: state.timeRemaining,
                    actors: nextActors,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState);
            }
            else {
                for (const nextNode of state.remainingNodes) {
                    const nextActors = [];
                    nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
                    nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

                    const pathWeight = findPathWeight(nextActors[actorIndex].currentNode, nextNode, nodes);
                    if (pathWeight + 1 > state.timeRemaining) {
                        nextActors[actorIndex].event = {type: 'actorDone'};
                    }
                    else {
                        const event = {
                            type: 'openValve',
                            nextNode: nextNode,
                            timestamp: state.timeElapsed + pathWeight + 1
                        }
                        nextActors[actorIndex].event = event;
                    }
                    const nextState = {
                        totalFlow: state.totalFlow,
                        combinedFlowRate: state.combinedFlowRate,
                        timeElapsed: state.timeElapsed,
                        timeRemaining: state.timeRemaining,
                        actors: nextActors,
                        remainingNodes: state.remainingNodes.filter(node => node.id !== nextNode.id)
                    }
                    stateStack.push(nextState);
                }
            }
        }
        else if (state.actors[0].event.type === 'actorDone' && state.actors[1].event.type === 'actorDone') {
            const totalFlow = state.totalFlow + (state.combinedFlowRate * state.timeRemaining);
            maxTotalFlow = Math.max(totalFlow, maxTotalFlow);
        }
        else if (state.actors[0].event.type === 'actorDone' || state.actors[1].event.type === 'actorDone') {
            // One actor needs to perform an event
            let actorIndex;
            if (state.actors[0].event.type === 'actorDone') {
                actorIndex = 1;
            }
            else {
                actorIndex = 0;
            }

            const nextActors = [];
            nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
            nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

            const actionTime = state.actors[actorIndex].event.timestamp - state.timeElapsed;
            const nextNode = state.actors[actorIndex].event.nextNode;
            nextActors[actorIndex].currentNode = nextNode;
            nextActors[actorIndex].event = null;
            const nextState = {
                totalFlow: state.totalFlow + state.combinedFlowRate * actionTime,
                combinedFlowRate: state.combinedFlowRate + nextNode.flowRate,
                timeElapsed: state.timeElapsed + actionTime,
                timeRemaining: state.timeRemaining - actionTime,
                actors: nextActors,
                remainingNodes: state.remainingNodes.slice()
            }
            stateStack.push(nextState);
        }
        else {
            // Both actors have an action to perform
            if (state.actors[0].event.timestamp === state.actors[1].event.timestamp) {
                // Both events finish at the same time
                const nextActors = [];
                nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
                nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

                const actionTime = state.actors[0].event.timestamp - state.timeElapsed;

                const nextNode0 = state.actors[0].event.nextNode;
                nextActors[0].currentNode = nextNode0;
                nextActors[0].event = null;

                const nextNode1 = state.actors[1].event.nextNode;
                nextActors[1].currentNode = nextNode1;
                nextActors[1].event = null;

                const nextState = {
                    totalFlow: state.totalFlow + state.combinedFlowRate * actionTime,
                    combinedFlowRate: state.combinedFlowRate + nextNode0.flowRate + nextNode1.flowRate,
                    timeElapsed: state.timeElapsed + actionTime,
                    timeRemaining: state.timeRemaining - actionTime,
                    actors: nextActors,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState);
            }
            else {
                // Perform the event that happens first
                const actorIndex = state.actors[0].event.timestamp < state.actors[1].event.timestamp ? 0 : 1;

                const nextActors = [];
                nextActors.push({currentNode: state.actors[0].currentNode, event: state.actors[0].event});
                nextActors.push({currentNode: state.actors[1].currentNode, event: state.actors[1].event});

                const actionTime = state.actors[actorIndex].event.timestamp - state.timeElapsed;
                const nextNode = state.actors[actorIndex].event.nextNode;
                nextActors[actorIndex].currentNode = nextNode;
                nextActors[actorIndex].event = null;
                const nextState = {
                    totalFlow: state.totalFlow + state.combinedFlowRate * actionTime,
                    combinedFlowRate: state.combinedFlowRate + nextNode.flowRate,
                    timeElapsed: state.timeElapsed + actionTime,
                    timeRemaining: state.timeRemaining - actionTime,
                    actors: nextActors,
                    remainingNodes: state.remainingNodes.slice()
                }
                stateStack.push(nextState);
            }
        }
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

    const maxTime = 26;
    const initialState = {
        totalFlow: 0,
        combinedFlowRate: 0,
        timeElapsed: 0,
        timeRemaining: maxTime,
        actors: [ { currentNode: startNode, event: null }, { currentNode: startNode, event: null }],
        remainingNodes: workingNodes
    }
    const maxTotalFlow = computeTotalFlow(nodes, initialState);

    console.timeEnd();

    console.log(maxTotalFlow);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
