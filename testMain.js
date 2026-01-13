const prompt = require('prompt-sync')({ sigint: true });
const term = require('terminal-kit').terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

// ----------------------------------------------------
// FIELD CLASS
// ----------------------------------------------------
class Field {
  constructor(field) {
    this.field = field;
    this.playerX = 0;
    this.playerY = 0;
  }

  print() {
    term.clear();
    for (const row of this.field) {
      for (const char of row) {
        if (char === hat) term.green.bold(char);
        else if (char === hole) term.red.bold(char);
        else if (char === pathCharacter) term.blue.bold(char);
        else term.white(char);
      }
      term('\n');
    }
  }

  move(direction) {
    let newX = this.playerX;
    let newY = this.playerY;

    if (direction === 'w') newY--;
    if (direction === 's') newY++;
    if (direction === 'a') newX--;
    if (direction === 'd') newX++;

    // bounds check
    if (newY < 0 || newY >= this.field.length || newX < 0 || newX >= this.field[0].length) {
      return "out";
    }

    this.playerX = newX;
    this.playerY = newY;

    if (this.field[newY][newX] === fieldCharacter) {
      this.field[newY][newX] = pathCharacter;
    }

    if (this.field[newY][newX] === hole) return "hole";
    if (this.field[newY][newX] === hat) return "hat";

    return "ok";
  }

  static generateField(height, width, percentage) {
    const field = [];

    for (let y = 0; y < height; y++) {
      field.push(new Array(width).fill(fieldCharacter));
    }

    // random hat pos
    let hatY = Math.floor(Math.random() * height);
    let hatX = Math.floor(Math.random() * width);

    // random start pos
    let startY = Math.floor(Math.random() * height);
    let startX = Math.floor(Math.random() * width);

    while (hatX === startX && hatY === startY) {
      hatY = Math.floor(Math.random() * height);
      hatX = Math.floor(Math.random() * width);
    }

    field[hatY][hatX] = hat;
    field[startY][startX] = pathCharacter;

    // random holes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x === startX && y === startY) || (x === hatX && y === hatY)) continue;
        if (Math.random() < percentage) field[y][x] = hole;
      }
    }

    return { field, startX, startY };
  }
}

// ----------------------------------------------------
// BFS SOLVABILITY CHECK
// ----------------------------------------------------
function isSolvable(fieldObj) {
  const field = fieldObj.field;
  const height = field.length;
  const width = field[0].length;

  const startX = fieldObj.playerX;
  const startY = fieldObj.playerY;

  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  const queue = [[startX, startY]];
  visited[startY][startX] = true;

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    if (field[y][x] === hat) return true;

    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 && nx < width &&
        ny >= 0 && ny < height &&
        !visited[ny][nx] &&
        field[ny][nx] !== hole
      ) {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }

  return false;
}

// ----------------------------------------------------
// SMART HOLE PLACEMENT (FAIR MODE)
// ----------------------------------------------------
function placeHoleSmart(myField) {
  const MAX_ATTEMPTS = 50;
  const height = myField.field.length;
  const width = myField.field[0].length;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    // skip invalid placements
    if (
      (x === myField.playerX && y === myField.playerY) ||
      myField.field[y][x] === hat ||
      myField.field[y][x] === pathCharacter ||
      myField.field[y][x] === hole
    ) {
      continue;
    }

    // temporarily add hole
    const old = myField.field[y][x];
    myField.field[y][x] = hole;

    // check solvability
    if (isSolvable(myField)) {
      return; // hole accepted
    }

    // undo hole if it trapped player
    myField.field[y][x] = old;
  }

  // if no valid placement found → skip
  // ensures fairness
}

// ----------------------------------------------------
// START GAME
// ----------------------------------------------------
const data = Field.generateField(8, 8, 0.35);
const myField = new Field(data.field);
myField.playerX = data.startX;
myField.playerY = data.startY;

// validate starting field
if (!isSolvable(myField)) {
  term.red.bold("Generated field is unsolvable. Regenerate.\n");
  process.exit();
}

term.clear();
term.bold.yellow("Which way? (W, A, S, D). CTRL+C quits.\n\n");
myField.print();

// ----------------------------------------------------
// REAL-TIME INPUT LOOP
// ----------------------------------------------------
term.grabInput();
term.hideCursor();

term.on('key', (name) => {
  if (name === "CTRL_C") {
    term.red("\nExiting...\n");
    process.exit();
  }

  if (!["w", "a", "s", "d"].includes(name)) return;

  const result = myField.move(name);

  if (result === "out") {
    term.red.bold("\nYou moved outside the field! Game over.\n");
    process.exit();
  }

  if (result === "hole") {
    term.red.bold("\nYou fell in a hole! Game over.\n");
    process.exit();
  }

  if (result === "hat") {
    term.green.bold("\nYou found the hat! YOU WIN!\n");
    process.exit();
  }

  // intelligent hole placement
  placeHoleSmart(myField);
  placeHoleSmart(myField);

  // re-render
  myField.print();
  term.bold.yellow("\nWhich way? (W/A/S/D)\n");
});
