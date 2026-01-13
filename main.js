const prompt = require('prompt-sync')({sigint: true});
const term = require('terminal-kit').terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    this.playerX = 0;
    this.playerY = 0;
  }

  print() {
    // --- ORIGINAL CODE ---
    //this.field.forEach(row => console.log(row.join('')));

    this.field.forEach(row => {
       row.forEach(char => {
          if (char === hat) term.green.bold(char);
          else if (char === hole) term.red.bold(char);
          else if (char === pathCharacter) term.blue.bold(char);
          else if (char === fieldCharacter) term.white(char);
        });
        term('\n'); // move to next row
    });
  }

  move(direction) {
    let newX = this.playerX;
    let newY = this.playerY;

    if (direction === 'w') newY--;
    else if (direction === 's') newY++;
    else if (direction === 'a') newX--;
    else if (direction === 'd') newX++;
    else {
      console.log('Invalid input, use w, s, a, d');
      return;
    };

    // Check out-of-bounds
    if (newY < 0 || newY >= this.field.length || newX < 0 || newX >= this.field[0].length) {
      console.log("You can't move outside the field!");
      return;
    }

    // Update player position
    this.playerX = newX;
    this.playerY = newY;

    // Mark the path only if it’s empty space
    if (this.field[this.playerY][this.playerX] === fieldCharacter) {
      this.field[this.playerY][this.playerX] = pathCharacter;
    }
  }

  isOutOfBounds() {
    return (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    );
  }

  isHole() {
    return this.field[this.playerY][this.playerX] === hole;
  }

  isHat() {
    return this.field[this.playerY][this.playerX] === hat;
  }

  static generateField(height, width, percentage) {
    const field = [];

    // Fill field with fieldCharacter
    for (let y = 0; y < height; y++) {
      const row = new Array(width).fill(fieldCharacter);
      field.push(row);
    }

  // Place hat randomly, avoiding starting position (0,0)
    let hatY = Math.floor(Math.random() * height);
    let hatX = Math.floor(Math.random() * width);

  //Random starting position (cannot be hat)
    let startY = Math.floor(Math.random() * height);
    let startX = Math.floor(Math.random() * width);

    //Condition checking if the hat is not placed at the starting position: 0,0
    /*while (hatY === 0 && hatX === 0) {
      hatY = Math.floor(Math.random() * height);
      hatX = Math.floor(Math.random() * width);
    }*/

  // Random Startin positioning: ensure hat and start are not the same
    while (hatY === startY && hatX === startX) {
      hatY = Math.floor(Math.random() * height);
      hatX = Math.floor(Math.random() * width);
  }

    field[hatY][hatX] = hat;

    // Fixed startin position: 0,0
    //Place holes randomly according to percentage
    /*
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (field[y][x] !== hat && !(y === 0 && x === 0)) {
          if (Math.random() < percentage) {
            field[y][x] = hole;
          }
        }
      }
    } 
  
    return field; */

    //Random Starting position placing random holes:
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((y === hatY && x === hatX) || (y === startY && x === startX)) {
          continue; // skip hat & start position
      }

      if (Math.random() < percentage) {
        field[y][x] = hole;
      }
    }
  }

  // Random starting position 
  //Mark starting position with player symbol (*)
  field[startY][startX] = pathCharacter;

  // Random starting position
    return {
      field: field,
      startX: startX,
      startY: startY
    };
  }
}

// --- Game Setup for starting fixed position (0,0) ---
/*const myFieldArray = Field.generateField(5, 5, 0.2); // height, width, 20% holes
const myField = new Field(myFieldArray);
myField.field[0][0] = pathCharacter; // mark starting position

console.log("Generated field:");
myField.print(); */

// Game setup for random starting position
const data = Field.generateField(7, 7, 0.1);

const myField = new Field(data.field);
myField.playerX = data.startX;
myField.playerY = data.startY;

term.red.bold("Use W - S - A - D to move. Press CTRL+C to quit.\nGenerated field:\n");
myField.print();

// --- Game Loop, easy mode  ---
/*let playing = true;
while (playing) {
  const direction = prompt('Which way? (u/d/l/r) ');
  myField.move(direction);
  
  myField.print();

  if (myField.isOutOfBounds()) {
    console.log("You moved out of bounds! Game over.");
    playing = false;
  } else if (myField.isHole()) {
    console.log("You fell in a hole! Game over.");
    playing = false;
  } else if (myField.isHat()) {
    console.log("You found the hat! You win!");
    playing = false;
  }
}*/


// --- HelperFunction for placing new holes. Used in hard mode below ---
 function placeHole (myField) {
    let x;
    let y;
    const height = myField.field.length;
    const width = myField.field[0].length;

    do {
        x = Math.floor(Math.random() * width );
        y = Math.floor(Math.random() * height );
    } while (
        (x === myField.playerX && y === myField.playerY) || 
        myField.field[y][x] === hat || 
        myField.field[y][x] === pathCharacter
    );

    myField.field[y][x] = hole; // place new hole
  }

// Helper function to print the message 'Which way W S A D? '


// --- Game Loop Hard mode ---
/* let playing = true;
let turns = 0;
while (playing) {
  const direction = prompt('Which way? (w/s/a/d) ');
  myField.move(direction);

  turns++;
  if (turns % 1 === 0) {  // place a hole every move
    placeHole(myField);
    placeHole(myField);
}
  myField.print();
  
  if (myField.isOutOfBounds()) {
    term.red.bold("You moved out of bounds! Game over.");
    playing = false;
  } else if (myField.isHole()) {
    term.red.bold("You fell in a hole! Game over.");
    playing = false;
  } else if (myField.isHat()) {
    term.green.bold("You found the hat! You win!");
    playing = false;
  }
} */

// Game with WSAD Keys
const startHatGame = () => {
  let turns = 0;

  function showPrompt () {
    term.bold.yellow(`Which way? Press (W/S/A/D) or CTRL + C to quit.\n`)
  }
  showPrompt()

  term.grabInput();     // enables key events
  term.hideCursor();

  //It turns the keys on the QWERTY in istant commands.
  term.on('key', (name) => {
    if (name === 'CTRL_C') {
      term.red("\nExiting...\n");
      process.exit();
    }

    //The condition below checks if we are pressing the right keys.
    //Anything rather that W,S,D,A will return the object without any modifications.
    if (!["w", "a", "s", "d"].includes(name)) return;

    myField.move(name);
    turns++;

    placeHole(myField);
    placeHole(myField);

    myField.print();
    showPrompt();

    if (myField.isHole()) {
      term.red.bold("\nYou fell in a hole! Game over!\n");
      process.exit();
    }

    if (myField.isHat()) {
      term.green.bold("\nYou found the hat! You win!\n");
      process.exit();
    }

    if (myField.isOutOfBounds()) {
      term.red.bold("You moved out of bounds! Game over.");
      process.exit();
    }
  });
}
startHatGame();
module.exports = {startHatGame};