/**
 * Chaos Game Plate - Sierpinski triangle and fractal patterns
 */

let points = [];
let vertices = [];
let plateRadius = 300;
let numVertices = 3;
let pointsPerFrame = 5;
let currentPoint;
let centerX, centerY;
const MAX_POINTS = 500000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  centerX = width / 2;
  centerY = height / 2;

  initVertices(numVertices);
  resetSimulation();
  background(0);
  setupUI();
}

function initVertices(n) {
  vertices = [];
  const radius = plateRadius * 0.9;
  for (let i = 0; i < n; i++) {
    const angle = i * (360 / n);
    vertices.push(createVector(
      centerX + cos(angle) * radius,
      centerY + sin(angle) * radius
    ));
  }
}

function resetSimulation() {
  points = [];
  const angle = random(360);
  const distance = random(plateRadius * 0.5);
  currentPoint = createVector(
    centerX + cos(angle) * distance,
    centerY + sin(angle) * distance
  );
}

function iterateChaosGame() {
  const target = random(vertices);
  currentPoint.x = (currentPoint.x + target.x) / 2;
  currentPoint.y = (currentPoint.y + target.y) / 2;
  if (points.length < MAX_POINTS) {
    points.push(currentPoint.copy());
  }
}

function setupUI() {
  const vertexCountSpan = document.getElementById('vertex-count');
  const pointsPerFrameSpan = document.getElementById('points-per-frame');
  const numVerticesSlider = document.getElementById('num-vertices');
  const pointsPerFrameSlider = document.getElementById('points-per-frame-slider');
  const restartBtn = document.getElementById('restart-btn');

  if (vertexCountSpan) vertexCountSpan.textContent = numVertices;
  if (pointsPerFrameSpan) pointsPerFrameSpan.textContent = pointsPerFrame;

  if (numVerticesSlider) {
    numVerticesSlider.addEventListener('input', (e) => {
      numVertices = parseInt(e.target.value);
      if (vertexCountSpan) vertexCountSpan.textContent = numVertices;
      initVertices(numVertices);
      resetSimulation();
    });
  }

  if (pointsPerFrameSlider) {
    pointsPerFrameSlider.addEventListener('input', (e) => {
      pointsPerFrame = parseInt(e.target.value);
      if (pointsPerFrameSpan) pointsPerFrameSpan.textContent = pointsPerFrame;
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      initVertices(numVertices);
      resetSimulation();
    });
  }
}

function draw() {
  background(0);

  // Add new points each frame
  for (let i = 0; i < pointsPerFrame; i++) {
    iterateChaosGame();
  }

  // Draw plate boundary
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(centerX, centerY, plateRadius * 2, plateRadius * 2);

  // Draw vertices
  fill(255, 0, 0);
  noStroke();
  for (const v of vertices) {
    ellipse(v.x, v.y, 8, 8);
  }

  // Draw all points
  fill(255);
  noStroke();
  for (const p of points) {
    // Only draw points within plate boundary
    let d = dist(p.x, p.y, centerX, centerY);
    if (d <= plateRadius) {
      ellipse(p.x, p.y, 2, 2);
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initVertices(numVertices);
    resetSimulation();
  } else if (key === 's' || key === 'S') {
    saveCanvas('chaos_game', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
  initVertices(numVertices);
}
