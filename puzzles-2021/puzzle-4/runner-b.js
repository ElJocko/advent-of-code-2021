'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseBoard(data) {
  const board = [];
  for (const row of data) {
    const rowStrings = row.trim().split(/[\s]+/);
    const rowInts = rowStrings.map(x => parseInt(x));
    board.push(rowInts)
  }
  return board;
}

function parseData(data) {
  // Get the numbers
  const numbersStrings = data[0].split(',');
  const numbers = numbersStrings.map(x => parseInt(x));

  // Get the boards
  // Each set of six lines contains a board
  // The first line of the six is empty
  const boards = [];
  const boardCount = (data.length - 1) / 6;
  for (let i = 1; i < data.length; i += 6) {
    const boardLines = data.slice(i + 1, i + 6);
    const board = parseBoard(boardLines);
    boards.push(board);
  }
  return { numbers, boards };
}

function applyNumber(draw, boards) {
  for (const board of boards) {
    for (const row of board) {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === draw) {
          row[i] = -1;
        }
      }
    }
  }
}

function isWinner(board) {
  for (const row of board) {
    let rowTotal = 0;
    for (let columnNumber = 0; columnNumber < row.length; columnNumber++) {
      rowTotal += row[columnNumber];
    }
    if (rowTotal === -1 * row.length) {
      return true;
    }
  }

  for (let columnNumber = 0; columnNumber < board[0].length; columnNumber++) {
    // Check the column
    let columnTotal = 0;
    for (let rowNumber = 0; rowNumber < board.length; rowNumber++) {
      columnTotal += board[rowNumber][columnNumber];
    }
    if (columnTotal === -1 * board.length) {
      return true;
    }
  }

  return false;
}

function findLastWinner(boards) {
  const notWinners = boards.filter(board => !board.winner);

  for (const board of boards) {
    if (!board.winner) {
      if (isWinner(board)) {
        board.winner = true;

        if (notWinners.length === 1) {
          // There was only one board that hadn't won yet
          // This board is now a winner and is the last winner
          return board;
        }
      }
    }
  }

  return null;
}

function calculateScore(draw, board) {
  let score = 0;
  for (const row of board) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== -1) {
        score += row[i];
      }
    }
  }
  score = score * draw;
  return score;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  const { numbers, boards } = parseData(data);

  for (const draw of numbers) {
    applyNumber(draw, boards);
    const lastWinner = findLastWinner(boards);
    if (lastWinner) {
      const score = calculateScore(draw, lastWinner);
      console.log(`Last winning score is: ${ score }`);
      break;
    }
  }

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
