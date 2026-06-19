/**
 * Perlin Noise Terrain Plate
 * Procedural terrain generation using p5.js noise() with multiple octaves
 */

let plateRadius = 300;
let terrain = [];
let gridSize = 40;
let cols, rows;
let noiseScale = 0.1;
let octaves = 4;
let persistence = 0.5;
let noiseOffsetX = random(1000);
let noiseOffsetY = random(1000);
let noiseSpeed = 0.01;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  setupUI();
  generateTerrain();
}

function setupUI() {
  let scaleSlider = document.getElementById('scale');
  let octavesSlider = document.getElementById('octaves');
  let persistenceSlider = document.getElementById('persistence');
  let restartBtn = document.getElementById('restart');

  let scaleValue = document.getElementById('scale-value');
  let octavesValue = document.getElementById('octaves-value');
  let persistenceValue = document.getElementById('persistence-value');

  if (scaleSlider) {
    scaleSlider.addEventListener('input', () => {
      noiseScale = parseFloat(scaleSlider.value);
      scaleValue.textContent = noiseScale.toFixed(2);
      generateTerrain();
    });
  }

  if (octavesSlider) {
    octavesSlider.addEventListener('input', () => {
      octaves = parseInt(octavesSlider.value);
      octavesValue.textContent = octaves;
      generateTerrain();
    });
  }

  if (persistenceSlider) {
    persistenceSlider.addEventListener('input', () => {
      persistence = parseFloat(persistenceSlider.value);
      persistenceValue.textContent = persistence.toFixed(1);
      generateTerrain();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', regenerateTerrain);
  }

  if (scaleValue) scaleValue.textContent = noiseScale.toFixed(2);
  if (octavesValue) octavesValue.textContent = octaves;
  if (persistenceValue) persistenceValue.textContent = persistence.toFixed(1);
}

function generateTerrain() {
  cols = floor(plateRadius * 2 / gridSize);
  rows = floor(plateRadius * 2 / gridSize);

  // Ensure at least 2 columns and rows to avoid division by zero
  cols = max(cols, 2);
  rows = max(rows, 2);

  terrain = [];
  for (let y = 0; y < rows; y++) {
    terrain[y] = [];
    for (let x = 0; x < cols; x++) {
      let nx = x / (cols - 1);
      let ny = y / (rows - 1);

      // Fractional Brownian motion (fBm) for multiple octaves
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;

      for (let o = 0; o < octaves; o++) {
        let sampleX = nx * frequency * noiseScale + noiseOffsetX;
        let sampleY = ny * frequency * noiseScale + noiseOffsetY;
        let value = noise(sampleX, sampleY) * 2 - 1;
        total += value * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }

      terrain[y][x] = (total / maxValue + 1) / 2;
    }
  }
}

function regenerateTerrain() {
  noiseOffsetX = random(1000);
  noiseOffsetY = random(1000);
  generateTerrain();
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  // Animate noise
  noiseOffsetX += noiseSpeed;
  noiseOffsetY += noiseSpeed * 0.7;

  // Calculate the actual drawing area within the plate
  let plateX = width / 2 - plateRadius;
  let plateY = height / 2 - plateRadius;
  let cellW = (plateRadius * 2) / cols;
  let cellH = (plateRadius * 2) / rows;

  // Draw terrain
  noStroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = plateX + x * cellW;
      let py = plateY + y * cellH;

      // Check if cell center is within circular plate boundary
      let cx = px + cellW / 2;
      let cy = py + cellH / 2;
      let dx = cx - width / 2;
      let dy = cy - height / 2;
      if (dx * dx + dy * dy <= plateRadius * plateRadius) {
        let heightVal = terrain[y][x];
        let colorVal = getHeightColor(heightVal);
        fill(colorVal);
        rect(px, py, cellW, cellH);
      }
    }
  }

  // Regenerate terrain for smooth animation
  if (frameCount % 15 === 0) {
    generateTerrain();
  }
}

function getHeightColor(height) {
  // Bright visible colors
  if (height < 0.2) {
    let t = map(height, 0, 0.2, 0, 1);
    return lerpColor(color(100, 100, 180), color(0, 200, 255), t);
  } else if (height < 0.4) {
    let t = map(height, 0.2, 0.4, 0, 1);
    return lerpColor(color(0, 200, 255), color(100, 220, 255), t);
  } else if (height < 0.55) {
    let t = map(height, 0.4, 0.55, 0, 1);
    return lerpColor(color(100, 220, 255), color(240, 240, 180), t);
  } else if (height < 0.75) {
    let t = map(height, 0.55, 0.75, 0, 1);
    return lerpColor(color(240, 240, 180), color(100, 255, 100), t);
  } else if (height < 0.9) {
    let t = map(height, 0.75, 0.9, 0, 1);
    return lerpColor(color(100, 255, 100), color(200, 150, 100), t);
  } else {
    let t = map(height, 0.9, 1, 0, 1);
    return lerpColor(color(200, 150, 100), color(255, 255, 255), t);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    regenerateTerrain();
  } else if (key === 's' || key === 'S') {
    saveCanvas('terrain_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
