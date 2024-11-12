'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data2.txt';

function parseIngredients(item) {
    const tokens = item.split(' ');
    return { type: tokens[1], quantity: Number(tokens[0]) };
}

function parseRecipe(acc, r) {
    const robotType = r[0];
    const ingredientsList = r[1].split(',').map(i => parseIngredients(i));

    acc[robotType] = {};
    for (const ingredient of ingredientsList) {
        acc[robotType][ingredient.type] = ingredient.quantity;
    }
    return acc;
}

function parseLine(line) {
    const unparsedRecipes = line.split('/').map(r => r.split(':'));
    return unparsedRecipes.reduce(parseRecipe, {});
}

function parseData(data) {
    return data.map(parseLine);
}

const resourceList = [ 'ore', 'clay', 'obsidian', 'geode' ];
function mine(state) {
    return {
        ore: state.robots.ore,
        clay: state.robots.clay,
        obsidian: state.robots.obsidian,
        geode: state.robots.geode
    };
}

function addResources(state, minedResources) {
    state.resources.ore += minedResources.ore;
    state.resources.clay += minedResources.clay;
    state.resources.obsidian += minedResources.obsidian;
    state.resources.geode += minedResources.geode;
}

const inputResources = [ 'ore', 'clay', 'obsidian' ];
function ableToBuild(robotType, blueprint, state) {
    const costPerRobot = blueprint[robotType];
    return !(
        costPerRobot.ore > state.resources.ore ||
        costPerRobot.clay > state.resources.clay ||
        costPerRobot.obsidian > state.resources.obsidian
    );

    // for (const resourceType of inputResources) {
    //     if (costPerRobot[resourceType]) {
    //         if (costPerRobot[resourceType] > state.resources[resourceType]) {
    //             return false;
    //         }
    //     }
    // }
}

function buildRobotOfType(robotType, blueprint, state) {
    if (ableToBuild(robotType, blueprint, state)) {
        state.robots[robotType]++;

        const costPerRobot = blueprint[robotType];
        for (const resourceType of inputResources) {
            if (costPerRobot[resourceType]) {
                state.resources[resourceType] -= costPerRobot[resourceType];
            }
        }

        return true;
    }
    else {
        return false;
    }
}

function harvestGeodesUsingStrategy(blueprint, strategy) {
    const minedResources = mine(strategy.state);
    const builtRobot = buildRobotOfType(strategy.build, blueprint, strategy.state);
    addResources(strategy.state, minedResources);
    strategy.state.timeCompleted++;

    return builtRobot;
}

function isStrategyViable(strategy) {
    if (strategy.build === 'ore' || strategy.build === 'clay') {
        return true;
    }
    else if (strategy.build === 'obsidian') {
        return strategy.state.robots.clay > 0;
    }
    else if (strategy.build === 'geode') {
        return strategy.state.robots.obsidian > 0;
    }
    else {
        throw new Error ('unknown robot type to build');
    }
}


function getInitialState() {
    return {
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
        timeCompleted: 0
    };
}

function getCopyOfState(state) {
    return {
        robots: { ore: state.robots.ore, clay: state.robots.clay, obsidian: state.robots.obsidian, geode: state.robots.geode },
        resources: { ore: state.resources.ore, clay: state.resources.clay, obsidian: state.resources.obsidian, geode: state.resources.geode },
        timeCompleted: state.timeCompleted
    };
}

function buildListToString(buildList) {
    let str = '';
    for (const item of buildList) {
        if (item === 'ore') {
            str += 'R';
        }
        else if (item === 'clay') {
            str += 'C';
        }
        else if (item === 'obsidian') {
            str += 'B';
        }
        else if (item === 'geode') {
            str += 'G';
        }
    }
    return str;
}
function harvestGeodes(maxTime) {
    return function(blueprint) {
        let maxGeodes = 0;
        const stack = [];
        stack.push({ state: getInitialState(), build: 'clay', buildList: [] });
        stack.push({ state: getInitialState(), build: 'ore', buildList: [] });
        let strategyCount = 2;
        while (stack.length > 0) {
            const strategy = stack.pop();
            if (!isStrategyViable(strategy)) {
                continue;
            }

            const builtRobot = harvestGeodesUsingStrategy(blueprint, strategy);

            if (strategy.state.timeCompleted < maxTime) {
                if (builtRobot) {
                    strategy.buildList.push(strategy.build);

                    if (strategy.buildList.length < 11) {
                        const newStrategy1 = { state: getCopyOfState(strategy.state), build: 'ore', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy1);
                        strategyCount++;

                        const newStrategy2 = { state: getCopyOfState(strategy.state), build: 'clay', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy2);
                        strategyCount++;

                        const newStrategy3 = { state: getCopyOfState(strategy.state), build: 'obsidian', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy3);
                        strategyCount++;

                        const newStrategy4 = { state: getCopyOfState(strategy.state), build: 'geode', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy4);
                        strategyCount++;
                    }
                    else if (strategy.buildList.length < 13) {
                        const newStrategy2 = { state: getCopyOfState(strategy.state), build: 'clay', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy2);
                        strategyCount++;

                        const newStrategy3 = { state: getCopyOfState(strategy.state), build: 'obsidian', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy3);
                        strategyCount++;

                        const newStrategy4 = { state: getCopyOfState(strategy.state), build: 'geode', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy4);
                        strategyCount++;
                    }
                    else {
                        const newStrategy3 = { state: getCopyOfState(strategy.state), build: 'obsidian', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy3);
                        strategyCount++;

                        const newStrategy4 = { state: getCopyOfState(strategy.state), build: 'geode', buildList: strategy.buildList.slice() };
                        stack.push(newStrategy4);
                        strategyCount++;
                    }

                }
                else {
                    // Try again
                    stack.push(strategy);
                }
            }

            const geodes = strategy.state.resources.geode;
            if (geodes > maxGeodes) {
                console.log(`strategyCount = ${ strategyCount },  geodes opened = ${ geodes } (${ buildListToString(strategy.buildList)}),  stack size = ${ stack.length }`);
            }
            maxGeodes = Math.max(geodes, maxGeodes);
        }
        console.log(`maxGeodes = ${ maxGeodes },  strategyCount = ${ strategyCount }`);
        console.log();
        console.timeLog();
        return maxGeodes;
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const blueprints = parseData(data);

    const geodes = blueprints.map(harvestGeodes(32));
    // let qualitySum = 0;
    // for (let i = 0; i < geodes.length; i++) {
    //     console.log(geodes[i]);
    //     qualitySum += (i+1) * geodes[i];
    // }

    const product = geodes[0] * geodes[1] * geodes[2];

    console.timeEnd();

    console.log(product);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
