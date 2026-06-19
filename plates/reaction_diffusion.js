/**
 * Reaction-Diffusion Plate - Gray-Scott Model
 * Two chemicals (U and V) react and diffuse, creating organic patterns.
 * Equations: dU/dt = Du*∇²U - U*V² + F*(1-U), dV/dt = Dv*∇²V + U*V² - (F+K)*V
 */

let gridSize = 256;
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;
let simulationRunning = false;
let drawingMode = false;
let pencilSize = 5;

let config = {
  feedRate: 0.055, killRate: 0.062,
  diffusionU: 0.16, diffusionV: 0.08,
  colorScheme: 'viridis'
};

let gridU = [];
let gridV = [];
let nextGridU = [];
let nextGridV = [];
let colorScale;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  initializeGrids();
  updateColorScale();
  setupUI();
  seedSimulation();
  simulationRunning = true;
}

function initializeGrids() {
  gridU = []; gridV = []; nextGridU = []; nextGridV = [];
  for (let i = 0; i < gridSize; i++) {
    gridU[i] = []; gridV[i] = []; nextGridU[i] = []; nextGridV[i] = [];
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = 1.0; gridV[i][j] = 0.0;
      nextGridU[i][j] = 0.0; nextGridV[i][j] = 0.0;
    }
  }
}

function seedSimulation() {
  const seedSize = gridSize / 8;
  const start = (gridSize - seedSize) / 2;
  for (let i = start; i < start + seedSize; i++) {
    for (let j = start; j < start + seedSize; j++) {
      gridV[i][j] = 1.0; gridU[i][j] = 0.5;
    }
  }
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (random() < 0.01) {
        gridV[i][j] = random(0.5, 1.0);
        gridU[i][j] = random(0.5, 1.0);
      }
    }
  }
}

function updateColorScale() {
  const schemes = {
    'viridis': ['#440154','#482878','#3e4989','#31688e','#26828e','#1f9e89','#35b779','#6bd151','#b4de2b','#fde725'],
    'plasma': ['#0d0887','#46039f','#7201a8','#9c179e','#bd3786','#d8576b','#ed7953','#fb9f3a','#fdbf6f','#fde725'],
    'inferno': ['#000004','#420a68','#87157e','#c32487','#e34568','#f07154','#f99e45','#fcc337','#f7e825','#f7fcf0'],
    'magma': ['#000004','#2b0949','#520559','#78145a','#9d2c66','#c44d68','#e37868','#f6a473','#fec382','#f7f7f7'],
    'cividis': ['#001427','#003c50','#006278','#008791','#36aa98','#74c289','#b4d56f','#f1e759','#fdb535','#fc861f'],
    'turbo': ['#30123b','#481e71','#582897','#6335b0','#6644c0','#6456c8','#5f6cc0','#5681b6','#4995a6','#3aa792','#29ab77','#23ac59','#2caf3c','#46b12f','#71ae2f','#a0a93e','#ceaa54','#f5b267','#fbdf90','#f8f8c8'],
    'rainbow': ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#9400d3'],
    'cool': ['#00ffff','#0080ff','#0000ff','#8000ff','#ff00ff'],
    'hot': ['#000000','#ff0000','#ffff00','#ffffff']
  };
  colorScale = chroma.scale(schemes[config.colorScheme] || schemes['viridis']).mode('lch').correctLightness(true);
}

function setupUI() {
  document.getElementById('feed-rate').addEventListener('input', (e) => {
    config.feedRate = parseFloat(e.target.value);
    document.getElementById('feed-value').textContent = config.feedRate.toFixed(3);
  });
  document.getElementById('kill-rate').addEventListener('input', (e) => {
    config.killRate = parseFloat(e.target.value);
    document.getElementById('kill-value').textContent = config.killRate.toFixed(3);
  });
  document.getElementById('diffusion-u').addEventListener('input', (e) => {
    config.diffusionU = parseFloat(e.target.value);
    document.getElementById('du-value').textContent = config.diffusionU.toFixed(2);
  });
  document.getElementById('diffusion-v').addEventListener('input', (e) => {
    config.diffusionV = parseFloat(e.target.value);
    document.getElementById('dv-value').textContent = config.diffusionV.toFixed(2);
  });
  document.getElementById('color-scheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
    updateColorScale();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    initializeGrids(); seedSimulation();
  });
  document.getElementById('randomize-btn').addEventListener('click', () => {
    config.feedRate = random(0.01, 0.1);
    config.killRate = random(0.01, 0.1);
    config.diffusionU = random(0.05, 0.3);
    config.diffusionV = random(0.01, 0.2);
    document.getElementById('feed-rate').value = config.feedRate;
    document.getElementById('kill-rate').value = config.killRate;
    document.getElementById('diffusion-u').value = config.diffusionU;
    document.getElementById('diffusion-v').value = config.diffusionV;
    document.getElementById('feed-value').textContent = config.feedRate.toFixed(3);
    document.getElementById('kill-value').textContent = config.killRate.toFixed(3);
    document.getElementById('du-value').textContent = config.diffusionU.toFixed(2);
    document.getElementById('dv-value').textContent = config.diffusionV.toFixed(2);
    initializeGrids(); seedSimulation();
  });
  updatePatternName();
}

function updatePatternName() {
  if (Math.abs(config.feedRate - 0.055) < 0.002 && Math.abs(config.killRate - 0.062) < 0.002) {
    document.getElementById('pattern-name').textContent = 'Spots';
  } else if (Math.abs(config.feedRate - 0.039) < 0.002 && Math.abs(config.killRate - 0.061) < 0.002) {
    document.getElementById('pattern-name').textContent = 'Stripes';
  } else if (Math.abs(config.feedRate - 0.054) < 0.002 && Math.abs(config.killRate - 0.063) < 0.002) {
    document.getElementById('pattern-name').textContent = 'Worms';
  } else {
    document.getElementById('pattern-name').textContent = 'Custom';
  }
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps').textContent = Math.round(fps);
  }
  if (isPaused || !simulationRunning) { drawPlate(); return; }
  simulationStep();
  drawPlate();
}

function simulationStep() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const laplacianU = computeLaplacian(gridU, i, j);
      const laplacianV = computeLaplacian(gridV, i, j);
      const uv2 = gridU[i][j] * gridV[i][j] * gridV[i][j];
      nextGridU[i][j] = gridU[i][j] + config.diffusionU * laplacianU - uv2 + config.feedRate * (1 - gridU[i][j]);
      nextGridV[i][j] = gridV[i][j] + config.diffusionV * laplacianV + uv2 - (config.feedRate + config.killRate) * gridV[i][j];
    }
  }
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      gridU[i][j] = Math.max(0, Math.min(1, nextGridU[i][j]));
      gridV[i][j] = Math.max(0, Math.min(1, nextGridV[i][j]));
    }
  }
}

function computeLaplacian(grid, i, j) {
  const left = grid[(i - 1 + gridSize) % gridSize][j];
  const right = grid[(i + 1) % gridSize][j];
  const top = grid[i][(j - 1 + gridSize) % gridSize];
  const bottom = grid[i][(j + 1) % gridSize];
  return (left + right + top + bottom - 4 * grid[i][j]);
}

function drawPlate() {
  background(0);
  noFill(); stroke(80, 80, 100, 150); strokeWeight(2);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  const cellSize = (plateRadius * 2) / gridSize;
  const offsetX = width / 2 - plateRadius;
  const offsetY = height / 2 - plateRadius;
  noStroke();

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cellCenterX = offsetX + i * cellSize + cellSize / 2;
      const cellCenterY = offsetY + j * cellSize + cellSize / 2;
      const d = dist(cellCenterX, cellCenterY, width / 2, height / 2);
      if (d > plateRadius) continue;
      const intensity = gridU[i][j] * (1 - gridV[i][j]) + gridV[i][j];
      const col = colorScale(intensity).rgb();
      fill(col[0], col[1], col[2], 255);
      rect(offsetX + i * cellSize, offsetY + j * cellSize, cellSize, cellSize);
    }
  }
}

function keyPressed() {
  if (key === ' ') { isPaused = !isPaused; }
  else if (key === 'r' || key === 'R') { initializeGrids(); seedSimulation(); }
  else if (key === 's' || key === 'S') {
    saveCanvas('reaction_diffusion_' + year() + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2), 'png');
  }
  else if (key === 'd' || key === 'D') { drawingMode = !drawingMode; }
}

function mousePressed() {
  if (mouseButton === LEFT && drawingMode) {
    addChemicalAtMouse();
  }
}

function mouseDragged() {
  if (mouseButton === LEFT && drawingMode) {
    addChemicalAtMouse();
  }
}

function addChemicalAtMouse() {
  let mx = mouseX;
  let my = mouseY;
  let dx = mx - width / 2;
  let dy = my - height / 2;
  
  if (dx * dx + dy * dy <= plateRadius * plateRadius) {
    const cellSize = (plateRadius * 2) / gridSize;
    const offsetX = width / 2 - plateRadius;
    const offsetY = height / 2 - plateRadius;
    
    let gridX = floor((mx - offsetX) / cellSize);
    let gridY = floor((my - offsetY) / cellSize);
    
    for (let i = -pencilSize; i <= pencilSize; i++) {
      for (let j = -pencilSize; j <= pencilSize; j++) {
        let x = gridX + i;
        let y = gridY + j;
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          gridV[y][x] = 1.0;
          gridU[y][x] = 0.0;
        }
      }
    }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
