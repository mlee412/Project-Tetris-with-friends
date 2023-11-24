document.addEventListener("DOMContentLoaded", () => {
  // Setup the canvas and context for drawing
  const canvas = document.getElementById("tetrisCanvas");
  const context = canvas.getContext("2d");
  context.scale(20, 20); // Scaling to make each block larger

  // Function to create the playfield matrix
  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  // Function to create different types of Tetriminos
  function createPiece(type) {
    if (type === "T") {
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    }
    // ... Add other pieces (I, J, L, O, S, Z)
  }

  // Function to draw the matrix and pieces
  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = "red"; // Change color for different pieces
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  // Function to draw everything on the canvas
  function draw() {
    context.fillStyle = "#000"; // Clear the canvas
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
  }

  // Function to merge the Tetriminos into the arena when they settle
  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  // Function to rotate the Tetriminos
  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  // Function to handle Tetrimino drop
  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      if (player.pos.y === 0) {
        alert("Game Over!"); // Game over condition
        clearInterval(interval);
      }
    }
    dropCounter = 0;
  }

  // Function to move the Tetrimino
  function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
      player.pos.x -= offset;
    }
  }

  // Function to rotate the Tetrimino
  function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }

  // Function to check collision
  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (
          m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Function to reset the player and spawn a new Tetrimino
  function playerReset() {
    const pieces = "ILJOTSZ";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x =
      ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  }

  // Create the playfield
  const arena = createMatrix(12, 20);

  // Player setup
  const player = {
    pos: { x: 5, y: 0 },
    matrix: createPiece("T"),
  };

  let dropCounter = 0;
  let dropInterval = 1000; // Speed of Tetrimino drop
  let lastTime = 0;

  // Update function to animate the game
  function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }

    draw();
    requestAnimationFrame(update);
  }

  // Event listener for player controls
  document.addEventListener("keydown", (event) => {
    if (event.keyCode === 37) {
      // Move left
      playerMove(-1);
    } else if (event.keyCode === 39) {
      // Move right
      playerMove(1);
    } else if (event.keyCode === 40) {
      // Rotate clockwise
      playerRotate(1);
    } else if (event.keyCode === 38) {
      // Rotate counter-clockwise
      playerRotate(-1);
    } else if (event.keyCode === 32) {
      // Drop piece
      while (!collide(arena, player)) {
        player.pos.y++;
      }
      player.pos.y--;
      playerDrop();
    }
  });

  // Create and setup the Play button
  const playButton = document.createElement("button");
  playButton.innerText = "Play";
  document.body.appendChild(playButton);
  playButton.addEventListener("click", () => {
    playerReset();
    update();
    playButton.style.display = "none"; // Hide the button after starting the game
  });
});
