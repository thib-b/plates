/**
 * Particle Life Plate - Force-based particle system with attraction/repulsion
 */

const PLATE_RADIUS = 300;
const PARTICLE_RADIUS = 4;

// Particle types with colors
const PARTICLE_TYPES = [
  { color: [255, 80, 80],   name: 'A' },  // Red
  { color: [80, 255, 80],   name: 'B' },  // Green
  { color: [80, 80, 255],   name: 'C' }   // Blue
];

// Force rules: attraction/repulsion between particle types
// Positive = repulsion, Negative = attraction
const FORCE_RULES = [
  [-0.2,  0.1,  0.3],  // Type A forces toward A, B, C
  [ 0.1, -0.3, -0.1],  // Type B forces toward A, B, C
  [ 0.3, -0.1, -0.4]   // Type C forces toward A, B, C
];

let particles = [];
let isPaused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  initParticles();
  background(0);
  setupUI();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    let angle = random(360);
    let distance = random(PLATE_RADIUS * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    let type = floor(random(PARTICLE_TYPES.length));
    particles.push(new Particle(x, y, type));
  }
}

function setupUI() {
  updateCounts();

  let restartBtn = document.getElementById('restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      initParticles();
      updateCounts();
    });
  }
}

function updateCounts() {
  let popCount = document.getElementById('pop-count');
  let countA = document.getElementById('count-a');
  let countB = document.getElementById('count-b');
  let countC = document.getElementById('count-c');

  if (popCount) popCount.textContent = particles.length;

  let counts = [0, 0, 0];
  for (let p of particles) {
    counts[p.type]++;
  }

  if (countA) countA.textContent = counts[0];
  if (countB) countB.textContent = counts[1];
  if (countC) countC.textContent = counts[2];
}

function draw() {
  if (isPaused) return;

  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  // Draw plate fill (semi-transparent white circle)
  noStroke();
  fill(240);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  // Update and display particles
  updateParticles();

  for (let p of particles) {
    p.display();
  }

  updateCounts();
}

function updateParticles() {
  // Apply forces between all particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let fx = 0;
    let fy = 0;

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let other = particles[j];
      let dx = other.x - p.x;
      let dy = other.y - p.y;
      let distSq = dx * dx + dy * dy;
      let dist = sqrt(distSq);

      // Force falls off with distance, but capped at NEIGHBOR_DIST
      if (dist > 0 && dist < 80) {
        let force = FORCE_RULES[p.type][other.type] * (1 - dist / 80);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
    }

    // Apply force and update position
    p.vx = p.vx * 0.95 + fx * 0.5;
    p.vy = p.vy * 0.95 + fy * 0.5;
    p.x += p.vx;
    p.y += p.vy;

    // Constrain to plate
    let distFromCenter = dist(p.x, p.y, width / 2, height / 2);
    if (distFromCenter > PLATE_RADIUS - PARTICLE_RADIUS) {
      let angleToCenter = degrees(atan2(height / 2 - p.y, width / 2 - p.x));
      p.x = width / 2 + cos(angleToCenter) * (PLATE_RADIUS - PARTICLE_RADIUS - 1);
      p.y = height / 2 + sin(angleToCenter) * (PLATE_RADIUS - PARTICLE_RADIUS - 1);
      p.vx *= -0.3;
      p.vy *= -0.3;
    }
  }
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= PLATE_RADIUS) {
    let addTypeSelect = document.getElementById('add-type');
    let type = addTypeSelect ? parseInt(addTypeSelect.value) : 0;

    for (let i = 0; i < 5; i++) {
      let angle = random(360);
      let distance = random(10);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;

      if (dist(x, y, width / 2, height / 2) <= PLATE_RADIUS - PARTICLE_RADIUS) {
        particles.push(new Particle(x, y, type));
      }
    }
    updateCounts();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
    if (!isPaused) background(0);
  } else if (key === 'r' || key === 'R') {
    initParticles();
    updateCounts();
  } else if (key === 'c' || key === 'C') {
    particles = [];
    updateCounts();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = PARTICLE_RADIUS;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
  }

  display() {
    noStroke();
    let color = PARTICLE_TYPES[this.type].color;
    fill(color[0], color[1], color[2], 200);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}
