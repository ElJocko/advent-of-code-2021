'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

const mult = '*';
const div = '/';
const add = '+';
const sub = '-';
const equ = '=';

function parseOp(text) {
    const tokens = text.trim().split(' ');
    return {
        operand1: tokens[0],
        operand2: tokens[2],
        operator: tokens[1]
    };
}

function parseLine(line) {
    const tokens = line.split(':');
    const node = {
        name: tokens[0]
    };

    const value = Number(tokens[1]);
    if (isNaN(value)) {
        node.op = parseOp(tokens[1]);
    }
    else {
        node.value = value;
    }

    return node;
}

function parseData(data) {
    return data.map(parseLine);
}

function addChildNodes(node, nodeMap) {
    if (node.op) {
        node.childNodes = [];
        const operand1 = nodeMap.get(node.op.operand1);
        const operand2 = nodeMap.get(node.op.operand2);
        node.childNodes.push(operand1, operand2);
        addChildNodes(operand1, nodeMap);
        addChildNodes(operand2, nodeMap);
    }
}

function buildTree(data) {
    const nodeMap = new Map(data.map(e => [ e.name, e ]));
    const rootNode = nodeMap.get('root');
    addChildNodes(rootNode, nodeMap);

    return rootNode;
}

const humanPath = [
    'root', 'lrnp', 'gdgf', 'zlwm', 'pjcb', 'mfvj',
    'hgfj', 'bznh', 'nbwm', 'htfg', 'hjrg', 'rqrd',
    'rpgq', 'cbcn', 'lfbg', 'zrpq', 'tzjr', 'phcs',
    'hmfn', 'hsqv', 'wwmt', 'mfwb', 'stfq', 'grtg',
    'vcpp', 'nrjw', 'jtsc', 'vjhh', 'pfdc', 'smrs',
    'hmnl', 'hzmt', 'zpmp', 'mzgv', 'dszs', 'gbhg',
    'pmlf', 'jndw', 'nwvc', 'vqnp', 'jqnt', 'pbvp',
    'vpwt', 'hfcq', 'rfcl', 'drnf', 'mdhm', 'htwl',
    'lghq', 'nljp', 'jdqg', 'wrvc', 'jlmg', 'ljgq',
    'hpqn', 'vqng', 'ldvh', 'djmd', 'tdbj', 'gtzc',
    'cgcq', 'vfmb', 'ntpt', 'hddp', 'hzsg', 'qdlz',
    'dztn', 'humn'
];

// const humanPath = [ 'root', 'pppw', 'cczh', 'lgvd', 'ptdq', 'humn' ]

const targetResult = 23622695042414;
function computeTargetResult(node, targetResult) {
    if (node.name === 'humn') {
        console.log(`targetResult = ${ targetResult }`);
        return targetResult;
    }
    else if (node.op) {
        if (humanPath.includes(node.childNodes[0].name)) {
            const fixedResult = computeResult(node.childNodes[1]);

            let nextTargetResult;
            if (node.op.operator === equ) {
                nextTargetResult = fixedResult;
            }
            else if (node.op.operator === mult) {
                nextTargetResult = targetResult / fixedResult;
            }
            else if (node.op.operator === div) {
                nextTargetResult = targetResult * fixedResult;
            }
            else if (node.op.operator === add) {
                nextTargetResult = targetResult - fixedResult;
            }
            else if (node.op.operator === sub) {
                nextTargetResult = targetResult + fixedResult;
            }

            console.log(`node ${ node.name }:${ node.childNodes[0].name } must return ${ nextTargetResult }`);
            computeTargetResult(node.childNodes[0], nextTargetResult);
        }
        else if (humanPath.includes(node.childNodes[1].name)) {
            const fixedResult = computeResult(node.childNodes[0]);

            let nextTargetResult;
            if (node.op.operator === equ) {
                nextTargetResult = fixedResult;
            }
            else if (node.op.operator === mult) {
                nextTargetResult = targetResult / fixedResult;
            }
            else if (node.op.operator === div) {
                nextTargetResult = fixedResult / targetResult;
            }
            else if (node.op.operator === add) {
                nextTargetResult = targetResult - fixedResult;
            }
            else if (node.op.operator === sub) {
                nextTargetResult = fixedResult - targetResult;
            }

            console.log(`node ${ node.name }:${ node.childNodes[1].name } must return ${ nextTargetResult }`);
            return computeTargetResult(node.childNodes[1], nextTargetResult);
        }
        else {
            return computeResult(node);
        }
    }
    else {
        return node.value;
    }
}

function computeResult(node) {
    if (node.op) {
        const value1 = computeResult(node.childNodes[0]);
        const value2 = computeResult(node.childNodes[1]);

        if (node.op.operator === mult) {
            return value1 * value2;
        }
        else if (node.op.operator === div) {
            return value1 / value2;
        }
        else if (node.op.operator === add) {
            return value1 + value2;
        }
        else if (node.op.operator === sub) {
            return value1 - value2;
        }
        else {
            throw new Error(`Unknown operator ${ node.operator }`);
        }
    }
    else {
        return node.value;
    }
}

async function runner() {
    console.time();

    const data = await reader.readFile(dataFilePath);
    const inputData = parseData(data);
    const rootNode = buildTree(inputData);

    rootNode.op.operator = equ;
    const result = computeTargetResult(rootNode, targetResult);

    console.timeEnd();

    console.log(result);
}

runner()
    .then(() => process.exit())
    .catch(err => {
        console.error('runner() - Error: ', err);
        process.exit(1);
    });
