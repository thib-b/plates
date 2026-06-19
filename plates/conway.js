/**
 * Conway's Game of Life Plate - cellular automaton within a circular plate
 */

let grid;
let nextGrid;
let cols = 50;
let rows = 50;
let cellSize;
let plateRadius = 300;
let isPaused = false;
let generation = 0;
let speed = 30;
let lastUpdate = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  cellSize = (plateRadius * 2 * 0.9) / cols;

  grid = createEmptyGrid();
  nextGrid = createEmptyGrid();

  randomizeGrid();

  background(0);
  setupUI();
}

function createEmptyGrid() {
  let g = [];
  for (let i = 0; i < cols; i++) {
    g[i] = [];
    for (let j = 0; j < rows; j++) {
      g[i][j] = 0;
    }
  }
  return g;
}

function randomizeGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(2));
    }
  }
  generation = 0;
  updateUI();
}

function clearGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }
  generation = 0;
  updateUI();
}

function restart() {
  clearGrid();
  randomizeGrid();
}

function setupUI() {
  let genCount = document.getElementById('gen-count');
  let popCount = document.getElementById('pop-count');
  let speedSlider = document.getElementById('speed-slider');
  let restartBtn = document.getElementById('restart-btn');
  let randomizeBtn = document.getElementById('randomize-btn');
  let clearBtn = document.getElementById('clear-btn');

  if (genCount) genCount.textContent = generation;
  if (popCount) popCount.textContent = countPopulation();

  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      speed = parseInt(speedSlider.value);
    });
  }

  if (restartBtn) restartBtn.addEventListener('click', restart);
  if (randomizeBtn) randomizeBtn.addEventListener('click', randomizeGrid);
  if (clearBtn) clearBtn.addEventListener('click', clearGrid);
}

function updateUI() {
  let genCount = document.getElementById('gen-count');
  let popCount = document.getElementById('pop-count');
  if (genCount) genCount.textContent = generation;
  if (popCount) popCount.textContent = countPopulation();
}

function countPopulation() {
  let count = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      count += grid[i][j];
    }
  }
  return count;
}

function draw() {
  background(0);

  noFill();
  stroke(255);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);

  noStroke();
  fill(255);

  let gridOffsetX = width / 2 - (cols * cellSize) / 2;
  let gridOffsetY = height / 2 - (rows * cellSize) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        let cellCenterX = gridOffsetX + i * cellSize + cellSize / 2;
        let cellCenterY = gridOffsetY + j * cellSize + cellSize / 2;
        if (dist(cellCenterX, cellCenterY, width / 2, height / 2) <= plateRadius) {
          ellipse(
            gridOffsetX + i * cellSize + cellSize / 2,
            gridOffsetY + j * cellSize + cellSize / 2,
            cellSize * 0.8,
            cellSize * 0.8
          );
        }
      }
    }
  }

  if (!isPaused && millis() - lastUpdate > (1000 / speed)) {
    nextGeneration();
    lastUpdate = millis();
  }
}

function nextGeneration() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let neighbors = countNeighbors(i, j);
      if (grid[i][j] === 1) {
        nextGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        nextGrid[i][j] = (neighbors === 3) ? 1 : 0;
      }
    }
  }

  let temp = grid;
  grid = nextGrid;
  nextGrid = temp;

  generation++;
  updateUI();
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let nx = (x + i + cols) % cols;
      let ny = (y + j + rows) % rows;
      count += grid[nx][ny];
    }
  }
  return count;
}

function mousePressed() {
  let gridOffsetX = width / 2 - (cols * cellSize) / 2;
  let gridOffsetY = height / 2 - (rows * cellSize) / 2;
  let col = floor((mouseX - gridOffsetX) / cellSize);
  let row = floor((mouseY - gridOffsetY) / cellSize);

  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    let cellCenterX = gridOffsetX + col * cellSize + cellSize / 2;
    let cellCenterY = gridOffsetY + row * cellSize + cellSize / 2;
    if (dist(cellCenterX, cellCenterY, width / 2, height / 2) <= plateRadius) {
      grid[col][row] = grid[col][row] === 1 ? 0 : 1;
      updateUI();
    }
  }
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') restart();
  else if (key === 'c' || key === 'C') clearGrid();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
