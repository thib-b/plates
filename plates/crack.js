/**
 * Crack Formation Simulation
 * Grid-based crack propagation where stress accumulates and cracks
 * grow from seed points, branching when stress exceeds threshold.
 */

const GRID_CELL_SIZE = 4;
let cols, rows;
let grid = [];
let cracks = [];
let crackSeeds = [];
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;
let plateRadius = 300;

let propagationSpeed = 0.1;
let branchingProbability = 0.3;
let stressThreshold = 50;
let substrateColor = '#4a3c30';

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  initGrid();
  setupUI();
}

function initGrid() {
  cols = Math.ceil(width / GRID_CELL_SIZE) + 1;
  rows = Math.ceil(height / GRID_CELL_SIZE) + 1;
  grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = { stress: 0, cracked: false, x: i * GRID_CELL_SIZE, y: j * GRID_CELL_SIZE };
    }
  }
}

function setupUI() {
  document.getElementById('add-crack')?.addEventListener('click', () => {
    const angle = random(360);
    const distance = random(plateRadius * 0.7);
    addCrackSeed(width / 2 + cos(angle) * distance, height / 2 + sin(angle) * distance);
  });
  document.getElementById('clear-plate')?.addEventListener('click', () => resetSimulation());
  document.getElementById('random-seeds')?.addEventListener('click', () => {
    resetSimulation();
    for (let i = 0; i < 5; i++) {
      const angle = random(360);
      const distance = random(plateRadius * 0.7);
      addCrackSeed(width / 2 + cos(angle) * distance, height / 2 + sin(angle) * distance);
    }
  });
}

function resetSimulation() {
  cracks = [];
  crackSeeds = [];
  initGrid();
  updateCrackCount();
}

function updateCrackCount() {
  document.getElementById('crack-count')?.setAttribute('textContent', cracks.length + crackSeeds.length);
}

function draw() {
  if (frameCount % 10 === 0) {
    const currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps')?.setAttribute('textContent', Math.round(fps));
  }
  if (isPaused) return;

  const substr = substrateColor.replace('#', '');
  const r = parseInt(substr.substring(0, 2), 16);
  const g = parseInt(substr.substring(2, 4), 16);
  const b = parseInt(substr.substring(4, 6), 16);

  background(26, 26, 46);
  drawPlate(r, g, b);
  propagateCracks();
  drawCracks();
}

function drawPlate(r, g, b) {
  const cx = width / 2;
  const cy = height / 2;
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(8);
  ellipse(cx, cy, plateRadius * 2 + 20, plateRadius * 2 + 20);
  stroke(100, 120, 140, 150);
  strokeWeight(4);
  ellipse(cx, cy, plateRadius * 2 + 10, plateRadius * 2 + 10);
  fill(r, g, b);
  noStroke();
  ellipse(cx, cy, plateRadius * 2, plateRadius * 2);
}

function drawCracks() {
  noStroke();
  fill(0);
  for (const seed of crackSeeds) {
    ellipse(seed.x, seed.y, 4, 4);
  }
  stroke(10);
  strokeWeight(1);
  noFill();
  for (const crack of cracks) {
    beginShape();
    for (const pt of crack.points) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }
}

function propagateCracks() {
  for (const seed of crackSeeds) {
    const gx = Math.floor(seed.x / GRID_CELL_SIZE);
    const gy = Math.floor(seed.y / GRID_CELL_SIZE);
    if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
      grid[gx][gy].stress += 1.5 * propagationSpeed;
    }
  }

  for (let i = cracks.length - 1; i >= 0; i--) {
    const crack = cracks[i];
    if (!crack.active) continue;
    if (crack.points.length > 200) { crack.active = false; continue; }

    const tip = crack.points[crack.points.length - 1];
    const gx = Math.floor(tip.x / GRID_CELL_SIZE);
    const gy = Math.floor(tip.y / GRID_CELL_SIZE);

    if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) { crack.active = false; continue; }

    const cell = grid[gx][gy];
    if (dist(tip.x, tip.y, width/2, height/2) > plateRadius) { crack.active = false; continue; }

    cell.stress += 0.5 * propagationSpeed;

    if (cell.stress >= stressThreshold && !cell.cracked) {
      cell.cracked = true;
      cell.stress = 0;
      if (random() < branchingProbability) {
        const branchAngle = crack.direction + random(-45, 45);
        createCrack(tip.x, tip.y, branchAngle);
      }
      crack.direction += random(-5, 5);
    }

    const step = GRID_CELL_SIZE * 0.8;
    crack.points.push(createVector(
      tip.x + cos(crack.direction) * step,
      tip.y + sin(crack.direction) * step
    ));
  }
}

function addCrackSeed(x, y) {
  if (dist(x, y, width/2, height/2) > plateRadius) return;
  crackSeeds.push(createVector(x, y));
  createCrack(x, y, random(360));
  updateCrackCount();
}

function createCrack(x, y, direction) {
  cracks.push({ points: [createVector(x, y)], direction, active: true });
  updateCrackCount();
}

function mousePressed() {
  if (dist(mouseX, mouseY, width/2, height/2) <= plateRadius) {
    addCrackSeed(mouseX, mouseY);
  }
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') resetSimulation();
  else if (key === 'c' || key === 'C') resetSimulation();
  else if (key === 's' || key === 'S') saveCanvas('crack_' + year() + nf(month(),2) + nf(day(),2) + '_' + nf(hour(),2) + nf(minute(),2), 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
