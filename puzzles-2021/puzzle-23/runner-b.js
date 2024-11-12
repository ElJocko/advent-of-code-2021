'use strict';

const Denque = require('denque');

const hallwayStop = 0;
const hallwayNoStop = 1;
const tunnel = 2;

const spaces = [
  { index: 0,  type: 0, owner: null, move: [ 1 ] },
  { index: 1,  type: 0, owner: null, move: [ 0, 2 ] },
  { index: 2,  type: 1, owner: null, move: [ 1, 3, 11 ] },
  { index: 3,  type: 0, owner: null, move: [ 2, 4 ] },
  { index: 4,  type: 1, owner: null, move: [ 3, 5, 15 ] },
  { index: 5,  type: 0, owner: null, move: [ 4, 6 ] },
  { index: 6,  type: 1, owner: null, move: [ 5, 7, 19 ] },
  { index: 7,  type: 0, owner: null, move: [ 6, 8 ] },
  { index: 8,  type: 1, owner: null, move: [ 7, 9, 23 ] },
  { index: 9,  type: 0, owner: null, move: [ 8, 10 ] },
  { index: 10, type: 0, owner: null, move: [ 9 ] },
  { index: 11, type: 2, owner: 'a', move: [ 2, 12 ] },
  { index: 12, type: 2, owner: 'a', move: [ 11, 13 ] },
  { index: 13, type: 2, owner: 'a', move: [ 12, 14 ] },
  { index: 14, type: 2, owner: 'a', move: [ 13 ] },
  { index: 15, type: 2, owner: 'b', move: [ 4, 16 ] },
  { index: 16, type: 2, owner: 'b', move: [ 15, 17 ] },
  { index: 17, type: 2, owner: 'b', move: [ 16, 18 ] },
  { index: 18, type: 2, owner: 'b', move: [ 17 ] },
  { index: 19, type: 2, owner: 'c', move: [ 6, 20 ] },
  { index: 20, type: 2, owner: 'c', move: [ 19, 21 ] },
  { index: 21, type: 2, owner: 'c', move: [ 20, 22 ] },
  { index: 22, type: 2, owner: 'c', move: [ 21 ] },
  { index: 23, type: 2, owner: 'd', move: [ 8, 24 ] },
  { index: 24, type: 2, owner: 'd', move: [ 23, 25 ] },
  { index: 25, type: 2, owner: 'd', move: [ 24, 26 ] },
  { index: 26, type: 2, owner: 'd', move: [ 25 ] }
];

const hallwayTargets = [ 0, 1, 3, 5, 7, 9, 10 ];

const homeTunnelTargets = {
  a: [ 14, 13, 12, 11 ],
  b: [ 18, 17, 16, 15 ],
  c: [ 22, 21, 20, 19 ],
  d: [ 26, 25, 24, 23 ]
};

const moveCost = {
  a: 1,
  b: 10,
  c: 100,
  d: 1000
};

const amphipods = [
  { index: 0, type: 'a' },
  { index: 1, type: 'a' },
  { index: 2, type: 'a' },
  { index: 3, type: 'a' },
  { index: 4, type: 'b' },
  { index: 5, type: 'b' },
  { index: 6, type: 'b' },
  { index: 7, type: 'b' },
  { index: 8, type: 'c' },
  { index: 9, type: 'c' },
  { index: 10, type: 'c' },
  { index: 11, type: 'c' },
  { index: 12, type: 'd' },
  { index: 13, type: 'd' },
  { index: 14, type: 'd' },
  { index: 15, type: 'd' }
];

function buildPath(start, end, spaces, visited) {
  visited[start] = true;

  if (start === end) {
    return [ start ];
  }

  for (const next of spaces[start].move) {
    if (!visited[next]) {
      const path = buildPath(next, end, spaces, visited.slice());
      if (path) {
        return [ start, ...path ];
      }
    }
  }

  return null;
}

function buildAllPaths(spaces) {
  const paths = Array(spaces.length);

  for (let from = 0; from < spaces.length; from++) {
    if (spaces[from].type === hallwayNoStop) {
      // Can't end up on this space, so no reason to move from this space
      paths[from] = Array(spaces.length).fill(null);
    }
    else {
      const pathsTo = Array(spaces.length);
      for (let to = 0; to < spaces.length; to++) {
        if (from === to) {
          pathsTo[to] = null;
        }
        else if (spaces[to].type === hallwayNoStop) {
          // Don't save a path to a space we can't stop on
          pathsTo[to] = null;
        }
        else {
          const visited = Array(spaces.length).fill(false);
          const path = buildPath(from, to, spaces, visited);
          if (path) {
            path.shift(); // We don't need the start space
            pathsTo[to] = path;
          }
          else {
            console.log(`no path from ${ from } to ${ to } ?????`);
          }
        }
      }
      paths[from] = pathsTo;
    }
  }

  return paths;
}

const allPaths = buildAllPaths(spaces);

function setAmphipodLocations(pos) {
  pos.amphipodLocs = Array(amphipods.length).fill(0);
  for (let i = 0; i < pos.spaces.length; i++) {
    const amphipodIndex = pos.spaces[i];
    if (amphipodIndex !== -1) {
      pos.amphipodLocs[amphipodIndex] = i;
    }
  }
}

// Is the amphipod finished?
function amphipodFinished(amphipod, pos) {
  const targets = homeTunnelTargets[amphipod.type];
  for (const target of targets) {
    const amphipodIndex = pos.spaces[target];
    if (amphipodIndex === -1) {
      return false;
    }
    else if (amphipodIndex === amphipod.index) {
      // self
      return true;
    }
    else {
      const otherAmphipod = amphipods[amphipodIndex];
      if (otherAmphipod.type === amphipod.type) {
        // same kind, continue to next space in tunnel
      }
      else {
        // Different kind found
        return false;
      }
    }
  }

  // Reached end of tunnel
  return false;
}

// Is the amphipod currently in a tunnel?
function amphipodInTunnel(amphipod, pos) {
  const space = pos.amphipodLocs[amphipod.index];
  return spaces[space].type === tunnel;
}

// Is the amphipod's home tunnel available?
// Open space and no other types in tunnel
function lastHomeSpaceAvailable(amphipod, pos) {
  // Is there an amphipod of a different type in the tunnel?
  const targets = homeTunnelTargets[amphipod.type];
  for (const target of targets) {
    const amphipodIndex = pos.spaces[target];
    if (amphipodIndex === -1) {
      // No amphipod in that space
    }
    else if (amphipods[amphipodIndex].type !== amphipod.type) {
      // Different type
      return null;
    }
  }

  for (const target of targets) {
    const amphipodIndex = pos.spaces[target];
    if (amphipodIndex === -1) {
      // Empty spot
      return target;
    }
    else if (amphipodIndex === amphipod.index) {
      // self
      console.log('Error 1234');
      return null;
    }
    else {
      const otherAmphipod = amphipods[amphipodIndex];
      if (otherAmphipod.type === amphipod.type) {
        // same kind, continue to next space in tunnel
      }
      else {
        // Different kind found
        console.log('Error 2345');
        return null;
      }
    }
  }

  // Reached end of tunnel
  return null;
}

function pathIsBlocked(path, pos) {
  for (const space of path) {
    if (pos.spaces[space] !== -1) {
      return true;
    }
  }

  return false;
}

function isFinished(pos) {
  for (const amphipod of amphipods) {
    if (!amphipodFinished(amphipod, pos)) {
      return false;
    }
  }

  return true;
}

function moveAmphipod(amphipod, startPos, fromSpace, toSpace, path) {
  const nextPos = {
    lastMove: amphipod.index,
    spaces: startPos.spaces.slice(),
    cost: startPos.cost + (moveCost[amphipod.type] * path.length)
  }
  nextPos.spaces[fromSpace] = -1;
  nextPos.spaces[toSpace] = amphipod.index;
  setAmphipodLocations(nextPos);

  return nextPos;
}

function spaceToChar(space, pos) {
  const index = pos.spaces[space]
  if (index === -1) {
    return '.';
  }
  else {
    return amphipods[index].type;
  }
}

function displayPos(pos) {
  const line1 = spaceToChar(0, pos) + ' ' + spaceToChar(1, pos) + ' ' + spaceToChar(2, pos) + ' ' + spaceToChar(3, pos) + ' ' + spaceToChar(4, pos) + ' ' + spaceToChar(5, pos) + ' ' + spaceToChar(6, pos) + ' ' + spaceToChar(7, pos) + ' ' + spaceToChar(8, pos) + ' ' + spaceToChar(9, pos) + ' ' + spaceToChar(10, pos);
  const line2 = '    ' + spaceToChar(11, pos) + '   ' + spaceToChar(13, pos) + '   ' + spaceToChar(15, pos) + '   ' + spaceToChar(17, pos);
  const line3 = '    ' + spaceToChar(12, pos) + '   ' + spaceToChar(14, pos) + '   ' + spaceToChar(16, pos) + '   ' + spaceToChar(18, pos);
  console.log(line1);
  console.log(line2);
  console.log(line3);
}


async function runner() {
  const startPosTest = {
    lastMove: null,
    spaces: [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 12, 13, 0, 8, 9, 5, 14, 6, 7, 1, 10, 15, 2, 11, 3 ],
    cost: 0
  }
  setAmphipodLocations(startPosTest);

  const startPosData = {
    lastMove: null,
    spaces: [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 12, 13, 14, 0, 8, 5, 1, 6, 7, 2, 15, 9, 3, 10, 11 ],
    cost: 0
  }
  setAmphipodLocations(startPosData);

  const startPos = startPosData;
  let stack = new Denque(null, { capacity: 1000000 });
  stack.push(startPos);

//  const stack = [ startPos ]; // Holds positions to be evaluated
  let minCost = Number.MAX_SAFE_INTEGER;

  while (stack.length > 0) {
    // i++;
    // if (i%100000 === 0) {
    //   console.log(`${ i } stack: ${ stack.length }`);
    //   const stackArray = stack.toArray();
    //   stackArray.sort((a, b) => a.cost - b.cost);
    //   stack = new Denque(stackArray);
    //   console.log('sorted');
    // }

    const pos = stack.shift();
//    displayPos(pos);
    for (const amphipod of amphipods) {
//      console.log(`amphipod: ${ amphipod.type }`);
      if (!amphipodFinished(amphipod, pos)) {
        const targets = [];
        if (amphipodInTunnel(amphipod, pos)) {
          // Tunnel to hallway or home tunnel
          targets.push(...hallwayTargets);
        }

        const lastHomeSpace = lastHomeSpaceAvailable(amphipod, pos);
        if (lastHomeSpace) {
          targets.push(lastHomeSpace);
        }

        for (const target of targets) {
          const from = pos.amphipodLocs[amphipod.index];
          const path = allPaths[from][target];
          let cost = 0;
          if (!pathIsBlocked(path, pos)) {
//            console.log(`Move ${ amphipod.type } from space ${ from } to ${ target } (stacksize = ${ stack.length })`);
            const nextPos = moveAmphipod(amphipod, pos, from, target, path);

            if (isFinished(nextPos)) {
//              console.log(`Found solution, cost: ${ nextPos.cost }`);
              const temp = minCost;
              minCost = Math.min(minCost, nextPos.cost);
              if (minCost < temp) {
                console.log(`best solution so far: ${ minCost }`);
              }
            }
            stack.push(nextPos);
          }
        }
      }
    }
  }

  if (minCost === Number.MAX_SAFE_INTEGER) {
    console.log('No sequence found');
  }
  else {
    console.log(`Min cost: ${ minCost }`);
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
