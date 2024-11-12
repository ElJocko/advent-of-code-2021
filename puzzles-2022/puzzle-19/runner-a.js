'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './sample.txt';

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
    for (const resourceType of resourceList) {
        state.resources[resourceType] += minedResources[resourceType];
    }
}

function computeResourceLimit(robotType, blueprint, state, resourceType) {
    const costPerRobot = blueprint[robotType];
    let limit = Number.MAX_VALUE;
    if (costPerRobot[resourceType]) {
        limit = Math.floor(state.resources[resourceType] / costPerRobot[resourceType]);
    }
    return limit;
}

function buildRobotsOfType(blueprint, state, type, max) {
    let buildCount = 0;
    if (max === -1) {
        // build unlimited (limited only by resources)
        const oreLimit = computeResourceLimit(type, blueprint, state, 'ore');
        const clayLimit = computeResourceLimit(type, blueprint, state, 'clay');
        const obsidianLimit = computeResourceLimit(type, blueprint, state, 'obsidian');

        buildCount = Math.min(oreLimit, clayLimit, obsidianLimit);
    }
    else {
        const maxToProduce = max - state.robots[type];
        if (maxToProduce > 0) {
            const oreLimit = computeResourceLimit(type, blueprint, state, 'ore');
            const clayLimit = computeResourceLimit(type, blueprint, state, 'clay');
            const obsidianLimit = computeResourceLimit(type, blueprint, state, 'obsidian');

            buildCount = Math.min(oreLimit, clayLimit, obsidianLimit, maxToProduce);
        }
    }

    if (buildCount > 0) {
        state.robots[type] += 1;

        const costPerRobot = blueprint[type];
        if (costPerRobot['ore']) {
            state.resources['ore'] -= costPerRobot['ore'] * 1;
        }
        if (costPerRobot['clay']) {
            state.resources['clay'] -= costPerRobot['clay'] * 1;
        }
        if (costPerRobot['obsidian']) {
            state.resources['obsidian'] -= costPerRobot['obsidian'] * 1;
        }
    }

    return buildCount;
}

function build(blueprint, state, strategy) {
    let buildCount = 0;
    buildCount = buildRobotsOfType(blueprint, state, 'geode', -1);
    if (buildCount === 0) {
        buildCount = buildRobotsOfType(blueprint, state, 'obsidian', strategy['obsidian']);
    }
    if (buildCount === 0) {
        buildCount = buildRobotsOfType(blueprint, state, 'clay', strategy['clay']);
    }
    if (buildCount === 0) {
        buildCount = buildRobotsOfType(blueprint, state, 'ore', strategy['ore']);
    }
}

function harvestGeodesUsingStrategy(blueprint, strategy, maxTime) {
    const state = {
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 }
    }

    for (let t = 0; t < maxTime; t++) {
        // if (strategy['ore'] === 4 && strategy['clay'] === 8 && strategy['obsidian'] === 9) {
        //     console.log(`${ t } START  robots: ${ state.robots['ore']} ${ state.robots['clay']} ${ state.robots['obsidian']} ${ state.robots['geode']}  resources: ${ state.resources['ore']} ${ state.resources['clay']} ${ state.resources['obsidian']} ${ state.resources['geode']}`);
        // }
        const minedResources = mine(state);
        build(blueprint, state, strategy);
        // if (strategy['ore'] === 4 && strategy['clay'] === 8 && strategy['obsidian'] === 9) {
        //     console.log(`   build  robots: ${ state.robots['ore']} ${ state.robots['clay']} ${ state.robots['obsidian']} ${ state.robots['geode']}  resources: ${ state.resources['ore']} ${ state.resources['clay']} ${ state.resources['obsidian']} ${ state.resources['geode']}`);
        // }
        addResources(state, minedResources);
        // if (strategy['ore'] === 4 && strategy['clay'] === 8 && strategy['obsidian'] === 9) {
        //     console.log(`   end    robots: ${ state.robots['ore']} ${ state.robots['clay']} ${ state.robots['obsidian']} ${ state.robots['geode']}  resources: ${ state.resources['ore']} ${ state.resources['clay']} ${ state.resources['obsidian']} ${ state.resources['geode']}`);
        //     console.log();
        // }
    }
    return state.resources.geode;
}

const maxBuild = 10;
function harvestGeodes(maxTime) {
    return function(blueprint) {
        let maxGeodes = 0;
        for (let i = 1; i <= maxBuild; i++) {
            for (let j = 1; j <= maxBuild; j++) {
                for (let k = 1; k <= maxBuild; k++) {
                    const strategy = { ore: i, clay: j, obsidian: k };
                    let geodes = harvestGeodesUsingStrategy(blueprint, strategy, maxTime);
                    if (geodes > maxGeodes) {
                        console.log(geodes, i, j, k);
                    }
                    maxGeodes = Math.max(geodes, maxGeodes);
                }
            }
        }
        return maxGeodes;
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const blueprints = parseData(data);

    const geodes = blueprints.map(harvestGeodes(24));
    let qualitySum = 0;
    for (let i = 0; i < geodes.length; i++) {
        console.log(geodes[i]);
        qualitySum += (i+1) * geodes[i];
    }

    console.timeEnd();

    console.log(qualitySum);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
