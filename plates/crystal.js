/**
 * Crystal Growth Plate - polygonal crystals growing from seed points
 */

let crystals = [];
let seeds = [];
let plateRadius = 300;
let isPaused = false;
let growthRate = 1;
let spawnRate = 5;
let spawnTimer = 0;
let crystalCount = 0;

const CRYSTAL_TYPES = [
  { name: 'hexagon', sides: 6, color: [255, 100, 150] },
  { name: 'triangle', sides: 3, color: [100, 200, 255] },
  { name: 'square', sides: 4, color: [150, 255, 100] },
  { name: 'pentagon', sides: 5, color: [255, 255, 100] },
  { name: 'octagon', sides: 8, color: [200, 100, 255] }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  background(0);
  setupUI();
}

function setupUI() {
  const crystalCountEl = document.getElementById('crystal-count');
  const growthRateEl = document.getElementById('growth-rate');
  const spawnRateEl = document.getElementById('spawn-rate');
  const restartBtn = document.getElementById('restart-btn');

  if (crystalCountEl) crystalCountEl.textContent = crystals.length;

  if (growthRateEl) {
    growthRateEl.value = growthRate;
    growthRateEl.addEventListener('input', () => {
      growthRate = parseFloat(growthRateEl.value);
    });
  }

  if (spawnRateEl) {
    spawnRateEl.value = spawnRate;
    spawnRateEl.addEventListener('input', () => {
      spawnRate = parseInt(spawnRateEl.value);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', restartSimulation);
  }
}

function restartSimulation() {
  crystals = [];
  seeds = [];
  crystalCount = 0;
  spawnTimer = 0;
  updateCrystalCount();
  background(0);
}

function updateCrystalCount() {
  const crystalCountEl = document.getElementById('crystal-count');
  if (crystalCountEl) crystalCountEl.textContent = crystals.length;
}

function spawnSeed() {
  if (seeds.length >= 50) return;

  const angle = random(360);
  const distance = random(plateRadius * 0.7);
  const x = width / 2 + cos(angle) * distance;
  const y = height / 2 + sin(angle) * distance;

  const crystalType = random(CRYSTAL_TYPES);
  const size = random(5, 15);

  seeds.push({
    x: x,
    y: y,
    type: crystalType,
    size: size,
    maxSize: random(40, 80),
    growthSpeed: random(0.1, 0.3),
    rotation: random(360),
    rotationSpeed: random(-0.5, 0.5)
  });
}

function draw() {
  if (isPaused) return;

  // Fade background slightly
  background(0, 10);

  // Spawn new seeds periodically
  spawnTimer += deltaTime / 1000;
  if (spawnTimer >= 1) {
    for (let i = 0; i < spawnRate * growthRate; i++) {
      spawnSeed();
    }
    spawnTimer = 0;
  }

  // Process seeds - convert to crystals
  for (let i = seeds.length - 1; i >= 0; i--) {
    const seed = seeds[i];
    const distFromCenter = dist(seed.x, seed.y, width / 2, height / 2);

    if (distFromCenter > plateRadius) {
      seeds.splice(i, 1);
      continue;
    }

    seed.size += seed.growthSpeed * growthRate;
    seed.rotation += seed.rotationSpeed * growthRate;

    if (seed.size >= seed.maxSize) {
      crystals.push(new Crystal(seed.x, seed.y, seed.type, seed.size, seed.rotation));
      seeds.splice(i, 1);
      crystalCount++;
      updateCrystalCount();
    } else {
      // Draw growing seed
      drawPolygon(seed.x, seed.y, seed.size, seed.type.sides, seed.rotation, seed.type.color, 150);
    }
  }

  // Update and display crystals
  for (let i = 0; i < crystals.length; i++) {
    crystals[i].update();
    crystals[i].display();
  }

  // Draw plate boundary
  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(2);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  // Draw plate fill (white circle)
  noStroke();
  fill(255, 255, 255, 30);
  ellipse(width / 2, height / 2, plateRadius * 2 - 10, plateRadius * 2 - 10);
}

function drawPolygon(x, y, radius, sides, rotation, color, alpha = 255) {
  push();
  translate(x, y);
  rotate(rotation);

  noStroke();
  fill(color[0], color[1], color[2], alpha);
  beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = map(i, 0, sides, 0, 360);
    const px = cos(angle) * radius;
    const py = sin(angle) * radius;
    vertex(px, py);
  }
  endShape(CLOSE);

  pop();
}

function mousePressed() {
  if (dist(mouseX, mouseY, width / 2, height / 2) <= plateRadius) {
    const crystalType = random(CRYSTAL_TYPES);
    crystals.push(new Crystal(mouseX, mouseY, crystalType, random(10, 20), random(360)));
    crystalCount++;
    updateCrystalCount();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    restartSimulation();
  } else if (key === 'c' || key === 'C') {
    crystals = [];
    seeds = [];
    crystalCount = 0;
    updateCrystalCount();
  } else if (key === 's' || key === 'S') {
    saveCanvas('crystal_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Crystal {
  constructor(x, y, type, size, rotation) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
    this.targetSize = size;
    this.maxSize = random(50, 100);
    this.rotation = rotation;
    this.rotationSpeed = random(-0.2, 0.2);
    this.growthSpeed = random(0.05, 0.2);
    this.color = type.color;
    this.sides = type.sides;
    this.glow = random(50, 150);
    this.glowDir = 1;
    this.glowSpeed = random(0.5, 2);
    this.edges = [];
    this.generateEdges();
  }

  generateEdges() {
    this.edges = [];
    for (let i = 0; i < this.sides; i++) {
      const angle = map(i, 0, this.sides, 0, 360) + this.rotation;
      const edgeAngle = angle + 30;
      const edgeDist = this.size * 1.5;
      this.edges.push({
        x: this.x + cos(edgeAngle) * edgeDist,
        y: this.y + sin(edgeAngle) * edgeDist
      });
    }
  }

  update() {
    if (this.size < this.maxSize) {
      this.size += this.growthSpeed * growthRate;
      this.targetSize = this.size;
    }

    this.rotation += this.rotationSpeed * growthRate;

    // Glow effect
    this.glow += this.glowDir * this.glowSpeed;
    if (this.glow > 150 || this.glow < 50) {
      this.glowDir *= -1;
    }

    this.generateEdges();
  }

  display() {
    // Check if within plate
    const distFromCenter = dist(this.x, this.y, width / 2, height / 2);
    if (distFromCenter > plateRadius) {
      return;
    }

    // Draw glow effect
    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    // Outer glow
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], this.glow * 0.3);
    beginShape();
    for (let i = 0; i < this.sides; i++) {
      const angle = map(i, 0, this.sides, 0, 360);
      const px = cos(angle) * this.size * 1.3;
      const py = sin(angle) * this.size * 1.3;
      vertex(px, py);
    }
    endShape(CLOSE);

    // Main polygon
    fill(this.color[0], this.color[1], this.color[2], 200);
    beginShape();
    for (let i = 0; i < this.sides; i++) {
      const angle = map(i, 0, this.sides, 0, 360);
      const px = cos(angle) * this.size;
      const py = sin(angle) * this.size;
      vertex(px, py);
    }
    endShape(CLOSE);

    // Inner highlight
    fill(255, 255, 255, 100);
    beginShape();
    for (let i = 0; i < this.sides; i++) {
      const angle = map(i, 0, this.sides, 0, 360);
      const px = cos(angle) * this.size * 0.6;
      const py = sin(angle) * this.size * 0.6;
      vertex(px, py);
    }
    endShape(CLOSE);

    // Edges
    stroke(this.color[0], this.color[1], this.color[2], 150);
    strokeWeight(1);
    noFill();
    beginShape();
    for (let i = 0; i < this.edges.length; i++) {
      vertex(this.edges[i].x - this.x, this.edges[i].y - this.y);
    }
    endShape();

    pop();
  }
}
