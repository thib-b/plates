/**
 * Turing Patterns Plate
 * Reaction-diffusion simulation based on Gray-Scott model
 * Inspired by Alan Turing's theory of morphogenesis
 */

const PLATE_RADIUS = 300;
const GRID_SIZE = 4;

let gridA = [];
let gridB = [];
let nextGridA = [];
let nextGridB = [];
let cols, rows;
let feedRate = 0.055;
let killRate = 0.062;
let diffusionA = 0.16;
let diffusionB = 0.08;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  cols = floor(PLATE_RADIUS * 2 / GRID_SIZE);
  rows = floor(PLATE_RADIUS * 2 / GRID_SIZE);
  
  // Initialize grids
  for (let y = 0; y < rows; y++) {
    gridA[y] = [];
    gridB[y] = [];
    nextGridA[y] = [];
    nextGridB[y] = [];
    for (let x = 0; x < cols; x++) {
      gridA[y][x] = 1;
      gridB[y][x] = 0;
    }
  }
  
  // Add initial perturbation in the center
  for (let y = floor(rows / 2) - 5; y < floor(rows / 2) + 5; y++) {
    for (let x = floor(cols / 2) - 5; x < floor(cols / 2) + 5; x++) {
      if (y >= 0 && y < rows && x >= 0 && x < cols) {
        gridA[y][x] = 0;
        gridB[y][x] = 1;
      }
    }
  }
  
  setupUI();
}

function setupUI() {
  const feedRateSpan = document.getElementById('feed-rate');
  const killRateSpan = document.getElementById('kill-rate');
  const diff1Span = document.getElementById('diff1');
  const diff2Span = document.getElementById('diff2');
  const feedSlider = document.getElementById('feed-slider');
  const killSlider = document.getElementById('kill-slider');
  const diff1Slider = document.getElementById('diff1-slider');
  const diff2Slider = document.getElementById('diff2-slider');
  const restartBtn = document.getElementById('restart');

  if (feedRateSpan) feedRateSpan.textContent = feedRate.toFixed(3);
  if (killRateSpan) killRateSpan.textContent = killRate.toFixed(3);
  if (diff1Span) diff1Span.textContent = diffusionA.toFixed(2);
  if (diff2Span) diff2Span.textContent = diffusionB.toFixed(2);

  if (feedSlider) {
    feedSlider.addEventListener('input', (e) => {
      feedRate = parseFloat(e.target.value);
      if (feedRateSpan) feedRateSpan.textContent = feedRate.toFixed(3);
    });
  }

  if (killSlider) {
    killSlider.addEventListener('input', (e) => {
      killRate = parseFloat(e.target.value);
      if (killRateSpan) killRateSpan.textContent = killRate.toFixed(3);
    });
  }

  if (diff1Slider) {
    diff1Slider.addEventListener('input', (e) => {
      diffusionA = parseFloat(e.target.value);
      if (diff1Span) diff1Span.textContent = diffusionA.toFixed(2);
    });
  }

  if (diff2Slider) {
    diff2Slider.addEventListener('input', (e) => {
      diffusionB = parseFloat(e.target.value);
      if (diff2Span) diff2Span.textContent = diffusionB.toFixed(2);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      // Reinitialize with perturbation
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          gridA[y][x] = 1;
          gridB[y][x] = 0;
        }
      }
      for (let y = floor(rows / 2) - 5; y < floor(rows / 2) + 5; y++) {
        for (let x = floor(cols / 2) - 5; x < floor(cols / 2) + 5; x++) {
          if (y >= 0 && y < rows && x >= 0 && x < cols) {
            gridA[y][x] = 0;
            gridB[y][x] = 1;
          }
        }
      }
    });
  }
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  // Draw plate fill (semi-transparent)
  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  // Update simulation
  updateSimulation();

  // Draw the grid
  const plateX = width / 2 - PLATE_RADIUS;
  const plateY = height / 2 - PLATE_RADIUS;
  const cellW = (PLATE_RADIUS * 2) / cols;
  const cellH = (PLATE_RADIUS * 2) / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = plateX + x * cellW;
      let py = plateY + y * cellH;
      
      // Check if cell center is within circular plate boundary
      let cx = px + cellW / 2;
      let cy = py + cellH / 2;
      let dx = cx - width / 2;
      let dy = cy - height / 2;
      if (dx * dx + dy * dy <= PLATE_RADIUS * PLATE_RADIUS) {
        let value = gridB[y][x];
        // Map B concentration to color
        fill(map(value, 0, 1, 0, 255), 
             map(value, 0, 1, 100, 255), 
             map(value, 0, 1, 200, 255));
        noStroke();
        rect(px, py, cellW, cellH);
      }
    }
  }
}

function updateSimulation() {
  // Apply Gray-Scott reaction-diffusion
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      // Center cell
      let a = gridA[y][x];
      let b = gridB[y][x];
      
      // Laplacian for A (diffusion)
      let laplacianA = 0;
      laplacianA += gridA[y-1][x] + gridA[y+1][x] + gridA[y][x-1] + gridA[y][x+1];
      laplacianA += gridA[y-1][x-1] + gridA[y-1][x+1] + gridA[y+1][x-1] + gridA[y+1][x+1];
      laplacianA = (laplacianA - 8 * a) * 0.25;
      
      // Laplacian for B (diffusion)
      let laplacianB = 0;
      laplacianB += gridB[y-1][x] + gridB[y+1][x] + gridB[y][x-1] + gridB[y][x+1];
      laplacianB += gridB[y-1][x-1] + gridB[y-1][x+1] + gridB[y+1][x-1] + gridB[y+1][x+1];
      laplacianB = (laplacianB - 8 * b) * 0.25;
      
      // Reaction
      let ab2 = a * b * b;
      
      // Update B
      nextGridB[y][x] = constrain(b + diffusionB * laplacianB - ab2 + feedRate * (1 - b), 0, 1);
      
      // Update A
      nextGridA[y][x] = constrain(a + diffusionA * laplacianA + ab2 - (feedRate + killRate) * a, 0, 1);
    }
  }
  
  // Swap grids
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      gridA[y][x] = nextGridA[y][x];
      gridB[y][x] = nextGridB[y][x];
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        gridA[y][x] = 1;
        gridB[y][x] = 0;
      }
    }
    for (let y = floor(rows / 2) - 5; y < floor(rows / 2) + 5; y++) {
      for (let x = floor(cols / 2) - 5; x < floor(cols / 2) + 5; x++) {
        if (y >= 0 && y < rows && x >= 0 && x < cols) {
          gridA[y][x] = 0;
          gridB[y][x] = 1;
        }
      }
    }
  } else if (key === 's' || key === 'S') {
    saveCanvas('turing_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
