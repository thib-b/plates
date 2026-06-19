/**
 * Fractal Garden Plate - Recursive branching growth patterns
 * Uses pure p5.js without external libraries
 */

let plateRadius = 300;
let isPaused = false;
let config = {
  branchLength: 50,
  branchAngle: 25,
  maxDepth: 5,
  branchRatio: 0.6,
  angleVariation: 10,
  lineWidth: 1.5
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 1.0);

  background(0);
  setupUI();
  drawPlate();
  generateAndDrawFractal();
}

function setupUI() {
  document.getElementById('branch-length')?.addEventListener('input', e => {
    config.branchLength = +e.target.value;
    restartFractal();
  });
  document.getElementById('branch-angle')?.addEventListener('input', e => {
    config.branchAngle = +e.target.value;
    restartFractal();
  });
  document.getElementById('max-depth')?.addEventListener('input', e => {
    config.maxDepth = +e.target.value;
    restartFractal();
  });
  document.getElementById('branch-ratio')?.addEventListener('input', e => {
    config.branchRatio = +e.target.value;
    restartFractal();
  });
  document.getElementById('angle-variation')?.addEventListener('input', e => {
    config.angleVariation = +e.target.value;
    restartFractal();
  });

  document.getElementById('restart-fractal')?.addEventListener('click', restartFractal);
  document.getElementById('clear-plate')?.addEventListener('click', clearPlate);
}

function restartFractal() {
  background(0);
  drawPlate();
  generateAndDrawFractal();
}

function clearPlate() {
  background(0);
  drawPlate();
}

function drawPlate() {
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
  noStroke();
  fill(0, 0, 100, 0.05);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);
}

function generateAndDrawFractal() {
  let startX = width / 2;
  let startY = height / 2 + plateRadius * 0.4;
  
  drawFractal(startX, startY, -90, config.branchLength, 0, 120);
}

function drawFractal(x, y, angle, length, depth, hue) {
  if (depth > config.maxDepth || length < 2) return;

  let newX = x + cos(angle) * length;
  let newY = y + sin(angle) * length;
  let distFromCenter = dist(newX, newY, width / 2, height / 2);

  if (distFromCenter > plateRadius) return;

  let sat = map(depth, 0, config.maxDepth, 100, 60);
  let bri = map(depth, 0, config.maxDepth, 100, 70);
  let alpha = map(depth, 0, config.maxDepth, 0.8, 0.3);
  let w = map(depth, 0, config.maxDepth, config.lineWidth, config.lineWidth * 0.2);

  stroke(hue % 360, sat, bri, alpha);
  strokeWeight(w);
  line(x, y, newX, newY);

  let newLength = length * config.branchRatio;
  let leftAngle = angle + config.branchAngle + random(-config.angleVariation, config.angleVariation);
  let rightAngle = angle - config.branchAngle + random(-config.angleVariation, config.angleVariation);

  drawFractal(newX, newY, leftAngle, newLength, depth + 1, hue + 15);
  drawFractal(newX, newY, rightAngle, newLength, depth + 1, hue + 15);
}

function mousePressed() {
  if (dist(mouseX, mouseY, width / 2, height / 2) <= plateRadius) {
    let clickHue = random(360);
    drawFractal(mouseX, mouseY, random(360), config.branchLength * 0.7, 0, clickHue);
  }
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') restartFractal();
  else if (key === 'c' || key === 'C') clearPlate();
  else if (key === 's' || key === 'S') saveCanvas('fractal_plate', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!isPaused) {
    background(0);
    drawPlate();
    generateAndDrawFractal();
  }
}

function draw() {
  if (isPaused) return;
}
