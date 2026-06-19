/**
 * Magnetic Field Plate - particles influenced by magnetic poles within a circular plate
 */

let particles = [];
let poles = [];
let plateRadius = 300;
let isPaused = false;
let showFieldLines = true;
let particleSpeed = 2;
let fieldStrength = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Initial poles: north and south
  poles.push(new Pole(width / 2 - 80, height / 2, 1, 20));
  poles.push(new Pole(width / 2 + 80, height / 2, -1, 20));

  // Initial particles
  for (let i = 0; i < 200; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.7);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    particles.push(new Particle(x, y));
  }

  background(0);
  setupUI();
}

function setupUI() {
  let particleCount = document.getElementById('particle-count');
  let restartBtn = document.getElementById('restart-btn');
  let toggleFieldlines = document.getElementById('toggle-fieldlines');
  let speedSlider = document.getElementById('particle-speed');
  let strengthSlider = document.getElementById('field-strength');
  let addNorthBtn = document.getElementById('add-pole-n');
  let addSouthBtn = document.getElementById('add-pole-s');

  if (particleCount) particleCount.textContent = particles.length;

  if (toggleFieldlines) {
    toggleFieldlines.addEventListener('change', (e) => {
      showFieldLines = e.target.checked;
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      particleSpeed = parseFloat(e.target.value);
    });
  }

  if (strengthSlider) {
    strengthSlider.addEventListener('input', (e) => {
      fieldStrength = parseInt(e.target.value);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', restartSimulation);
  }

  if (addNorthBtn) {
    addNorthBtn.addEventListener('click', () => {
      let angle = random(360);
      let distance = random(plateRadius * 0.6);
      let x = width / 2 + cos(angle) * distance;
      let y = height / 2 + sin(angle) * distance;
      poles.push(new Pole(x, y, 1, 20));
    });
  }

  if (addSouthBtn) {
    addSouthBtn.addEventListener('click', () => {
      let angle = random(360);
      let distance = random(plateRadius * 0.6);
      let x = width / 2 + cos(angle) * distance;
      let y = height / 2 + sin(angle) * distance;
      poles.push(new Pole(x, y, -1, 20));
    });
  }
}

function restartSimulation() {
  particles = [];
  poles = [];

  // Reset poles
  poles.push(new Pole(width / 2 - 80, height / 2, 1, 20));
  poles.push(new Pole(width / 2 + 80, height / 2, -1, 20));

  // Reset particles
  for (let i = 0; i < 200; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.7);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    particles.push(new Particle(x, y));
  }

  let particleCount = document.getElementById('particle-count');
  if (particleCount) particleCount.textContent = particles.length;
}

function updateParticleCount() {
  let particleCount = document.getElementById('particle-count');
  if (particleCount) particleCount.textContent = particles.length;
}

function draw() {
  if (isPaused) return;

  background(0, 15);

  // Draw field lines
  if (showFieldLines) {
    drawFieldLines();
  }

  // Draw poles
  for (let pole of poles) {
    pole.display();
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();

    // Remove particles that escape the plate
    if (particles[i].isOutside) {
      particles.splice(i, 1);
    }
  }

  // Draw plate boundary on top
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);

  updateParticleCount();
}

function drawFieldLines() {
  noFill();
  stroke(50, 100, 200, 60);
  strokeWeight(1);

  const step = 20;
  const fieldLineLength = 15;
  const iterations = 20;

  // Draw field lines from each pole
  for (let pole of poles) {
    for (let a = 0; a < 360; a += step) {
      let x = pole.x;
      let y = pole.y;
      let prevX = x;
      let prevY = y;

      for (let i = 0; i < iterations; i++) {
        // Calculate net field vector at this point
        let fx = 0;
        let fy = 0;

        for (let otherPole of poles) {
          let dx = otherPole.x - x;
          let dy = otherPole.y - y;
          let dist = max(sqrt(dx * dx + dy * dy), 1);
          let strength = (otherPole.strength * fieldStrength) / (dist * dist);

          // Field direction: north poles repel (away), south poles attract (toward)
          if (otherPole.type === 1) {
            fx -= dx / dist * strength;
            fy -= dy / dist * strength;
          } else {
            fx += dx / dist * strength;
            fy += dy / dist * strength;
          }
        }

        // Normalize and scale
        let len = sqrt(fx * fx + fy * fy);
        if (len > 0) {
          fx = (fx / len) * fieldLineLength / 2;
          fy = (fy / len) * fieldLineLength / 2;
        }

        // Draw line segment
        line(prevX, prevY, x + fx, y + fy);

        prevX = x + fx;
        prevY = y + fy;
        x = prevX;
        y = prevY;

        // Stop if outside plate
        if (dist(x, y, width / 2, height / 2) > plateRadius * 1.1) break;
      }
    }
  }
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= plateRadius) {
    // Add particles at click position
    for (let i = 0; i < 20; i++) {
      let angle = random(360);
      let distance = random(10);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      if (dist(x, y, width / 2, height / 2) <= plateRadius) {
        particles.push(new Particle(x, y));
      }
    }
    updateParticleCount();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    restartSimulation();
  } else if (key === 'c' || key === 'C') {
    particles = [];
    updateParticleCount();
  } else if (key === 's' || key === 'S') {
    saveCanvas('magnetic_plate', 'png');
  } else if (key === 'f' || key === 'F') {
    showFieldLines = !showFieldLines;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Magnetic Pole class
class Pole {
  constructor(x, y, type, strength) {
    this.x = x;
    this.y = y;
    this.type = type; // 1 = north (repel), -1 = south (attract)
    this.strength = strength;
    this.radius = 12;
  }

  display() {
    noStroke();
    if (this.type === 1) {
      // North pole - red
      fill(220, 60, 60);
    } else {
      // South pole - blue
      fill(60, 100, 220);
    }
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);

    // Draw N/S label
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.type === 1 ? 'N' : 'S', this.x, this.y);

    // Draw glow effect
    noFill();
    if (this.type === 1) {
      stroke(255, 100, 100, 100);
    } else {
      stroke(100, 150, 255, 100);
    }
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2.5, this.radius * 2.5);
    ellipse(this.x, this.y, this.radius * 3.5, this.radius * 3.5);
  }
}

// Particle class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = random(2, 4);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.color = color(200, 200, 255, 200);
    this.isOutside = false;
    this.maxSpeed = 3;
  }

  update() {
    // Calculate net magnetic force
    let fx = 0;
    let fy = 0;

    for (let pole of poles) {
      let dx = pole.x - this.x;
      let dy = pole.y - this.y;
      let dist = max(sqrt(dx * dx + dy * dy), 1);

      // Inverse square law
      let strength = (pole.strength * fieldStrength * this.radius) / (dist * dist);

      // North poles (type 1) repel particles
      // South poles (type -1) attract particles
      if (pole.type === 1) {
        // Repel - force away from pole
        fx -= dx / dist * strength;
        fy -= dy / dist * strength;
      } else {
        // Attract - force toward pole
        fx += dx / dist * strength;
        fy += dy / dist * strength;
      }
    }

    // Apply force to velocity
    this.vx += fx * 0.01 * particleSpeed;
    this.vy += fy * 0.01 * particleSpeed;

    // Limit speed
    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed * particleSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed * particleSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed * particleSpeed;
    }

    // Add small random movement
    this.vx += random(-0.1, 0.1);
    this.vy += random(-0.1, 0.1);

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Constrain to plate with bounce
    let distFromCenter = dist(this.x, this.y, width / 2, height / 2);
    if (distFromCenter > plateRadius - this.radius) {
      // Bounce off boundary
      let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
      let normalAngle = angleToCenter + 180;

      // Reflect velocity
      let velAngle = atan2(this.vy, this.vx);
      let reflectionAngle = 2 * normalAngle - velAngle - 180;

      let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = cos(reflectionAngle) * speed * 0.8;
      this.vy = sin(reflectionAngle) * speed * 0.8;

      // Move back inside
      this.x = width / 2 + cos(angleToCenter) * (plateRadius - this.radius - 1);
      this.y = height / 2 + sin(angleToCenter) * (plateRadius - this.radius - 1);

      // Mark as outside if too far (shouldn't happen with bounce)
      if (distFromCenter > plateRadius * 1.5) {
        this.isOutside = true;
      }
    }

    // Small damping
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);

    // Small highlight
    fill(255, 255, 255, 100);
    ellipse(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.8, this.radius * 0.8);
  }
}
