let organisms = [];
let plateRadius = 300;
let centerX, centerY;
let paused = false;
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;

const CLOSE_THRESHOLD = 45;
const COMPETE_THRESHOLD = 150;
const SPAWN_DIST = 8;
const MIN_DIST = 5;
const GROW_PROB = 0.02;
const INITIAL_ORGANISMS = 5;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 1.0);
  centerX = width / 2;
  centerY = height / 2;

  for (let i = 0; i < INITIAL_ORGANISMS; i++) {
    addRandomOrganism();
  }
}

function draw() {
  background(0, 0, 15);

  // Draw petri dish
  noStroke();
  fill(0, 0, 20);
  circle(centerX, centerY, plateRadius * 2);
  fill(0, 0, 0);
  circle(centerX, centerY, plateRadius * 2 - 20);

  // Draw organisms
  for (let org of organisms) {
    fill(org.color);
    noStroke();
    circle(org.x, org.y, 8);
  }

  // Update simulation
  if (!paused) {
    updateOrganisms();
  }

  // Calculate FPS
  frameCount++;
  if (millis() - lastFrameTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = millis();
  }

  // Draw UI
  drawUI();
}

function updateOrganisms() {
  let newOrganisms = [];
  for (let org of organisms) {
    if (random() < GROW_PROB) {
      let angle = random(TWO_PI);
      let nx = org.x + cos(angle) * SPAWN_DIST;
      let ny = org.y + sin(angle) * SPAWN_DIST;

      if (dist(nx, ny, centerX, centerY) > plateRadius - 10) continue;

      let closest = null;
      let minD = MIN_DIST;
      for (let other of organisms) {
        let d = dist(nx, ny, other.x, other.y);
        if (d < minD) {
          minD = d;
          closest = other;
        }
      }

      if (closest === null) {
        newOrganisms.push(new Organism(nx, ny, org.color));
      } else {
        let diff = hueDiff(org.color, closest.color);
        if (diff < CLOSE_THRESHOLD) {
          newOrganisms.push(new Organism(nx, ny, closest.color));
        } else if (diff > COMPETE_THRESHOLD) {
          closest.color = org.color;
        }
      }
    }
  }
  organisms.push(...newOrganisms);
}

function hueDiff(c1, c2) {
  let h1 = hue(c1);
  let h2 = hue(c2);
  let diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

function addRandomOrganism() {
  let angle = random(TWO_PI);
  let d = random(plateRadius * 0.3, plateRadius * 0.8);
  let x = centerX + cos(angle) * d;
  let y = centerY + sin(angle) * d;
  let col = color(random(360), 70, 90);
  organisms.push(new Organism(x, y, col));
}

function addOrganismAt(x, y) {
  if (dist(x, y, centerX, centerY) < plateRadius) {
    let col = color(random(360), 70, 90);
    organisms.push(new Organism(x, y, col));
  }
}

function clearPlate() {
  organisms = [];
}

function drawUI() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Population: ${organisms.length}`, 20, 20);
  text(`FPS: ${fps}`, 20, 45);
  text("Controls:", 20, 70);
  text("SPACE: pause/resume", 20, 95);
  text("C: clear plate", 20, 120);
  text("CLICK: add organism", 20, 145);
}

function mousePressed() {
  addOrganismAt(mouseX, mouseY);
}

function keyPressed() {
  if (key === ' ') {
    paused = !paused;
  } else if (key === 'c' || key === 'C') {
    clearPlate();
  }
}

class Organism {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}
