'use strict';

const moves = [
  { distance: 3, weight: 1 },
  { distance: 4, weight: 3 },
  { distance: 5, weight: 6 },
  { distance: 6, weight: 7 },
  { distance: 7, weight: 6 },
  { distance: 8, weight: 3 },
  { distance: 9, weight: 1 }
];

function makeNode(nextMove, weight, players) {
  return { nextMove, weight, players };
}

async function runner() {
  const rootNode = makeNode(0, 1, [ { pos: 3, score: 0 }, { pos: 10, score: 0 }]);
  const stack = [ rootNode ];

  const gameCount = [0, 0];
  const targetScore = 21;

  while (stack.length > 0) {
    const node = stack.pop();
    for (const move of moves) {
      const player = node.players[node.nextMove];
      const nextSpace = ((player.pos + move.distance) - 1)%10 + 1;
      if (node.nextMove === 0) {
        const player0 = { pos: nextSpace, score: player.score + nextSpace };
        const player1 = { pos: node.players[1].pos, score: node.players[1].score };

        if (player0.score >= targetScore) {
          gameCount[0] += node.weight * move.weight;
        }
        else {
          const nextNode = makeNode(1, node.weight * move.weight, [player0, player1]);
          stack.push(nextNode);
        }
      }
      else {
        const player0 = { pos: node.players[0].pos, score: node.players[0].score };
        const player1 = { pos: nextSpace, score: player.score + nextSpace };

        if (player1.score >= targetScore) {
          gameCount[1] += node.weight * move.weight;
        }
        else {
          const nextNode = makeNode(0, node.weight * move.weight, [player0, player1]);
          stack.push(nextNode);
        }
      }
    }
  }

  console.log(gameCount[0]);
  console.log(gameCount[1]);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
