/**
 * Fluid Dynamics Plate - velocity field simulation within circular boundary
 */

let particles = [];
let velocityField;
let plateRadius = 300;
let numParticles = 500;
let flowType = 'vortex';
let viscosity = 1.0;
let isPaused = false;
let cols, rows, scale = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  cols = floor(width / scale);
  rows = floor(height / scale);
  velocityField = new VelocityField(cols, rows, scale);

  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    particles.push(new Particle(x, y));
  }

  background(0);
  setupUI();
}

function setupUI() {
  let particleCount = document.getElementById('particle-count');
  let flowTypeEl = document.getElementById('flow-type');
  let restartBtn = document.getElementById('restart-btn');
  let viscositySlider = document.getElementById('viscosity-slider');
  let flowSelect = document.getElementById('flow-select');

  if (particleCount) particleCount.textContent = particles.length;
  if (flowTypeEl) flowTypeEl.textContent = flowType;

  if (restartBtn) {
    restartBtn.addEventListener('click', restartSimulation);
  }

  if (viscositySlider) {
    viscositySlider.addEventListener('input', () => {
      viscosity = parseFloat(viscositySlider.value);
    });
  }

  if (flowSelect) {
    flowSelect.addEventListener('change', () => {
      flowType = flowSelect.value;
      if (flowTypeEl) flowTypeEl.textContent = flowType;
    });
  }
}

function restartSimulation() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    particles.push(new Particle(x, y));
  }
  let particleCount = document.getElementById('particle-count');
  if (particleCount) particleCount.textContent = particles.length;
}

function draw() {
  if (isPaused) return;

  background(0, 15);

  velocityField.update(flowType);
  velocityField.display();

  for (let p of particles) {
    p.update(velocityField);
    p.display();
    p.constrainToPlate();
  }

  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= plateRadius) {
    for (let i = 0; i < 50; i++) {
      let angle = random(360);
      let distance = random(20);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      if (dist(x, y, width/2, height/2) <= plateRadius) {
        particles.push(new Particle(x, y));
      }
    }
    let particleCount = document.getElementById('particle-count');
    if (particleCount) particleCount.textContent = particles.length;
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    restartSimulation();
  } else if (key === 's' || key === 'S') {
    saveCanvas('fluid_dynamics_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / scale);
  rows = floor(height / scale);
  velocityField.resize(cols, rows, scale);
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = random(2, 5);
    this.maxSpeed = random(1, 3);
    this.color = color(255, 255, 255, 200);
  }

  update(velocityField) {
    let fieldVel = velocityField.getVelocity(this.pos.x, this.pos.y);

    this.vel.mult(1 - (1 - 1/viscosity) * 0.05);
    this.vel.add(fieldVel.copy().mult(0.5));
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.vel.add(createVector(random(-0.1, 0.1), random(-0.1, 0.1)));
  }

  constrainToPlate() {
    let distFromCenter = dist(this.pos.x, this.pos.y, width / 2, height / 2);
    if (distFromCenter > plateRadius - this.size) {
      let angleToCenter = atan2(height / 2 - this.pos.y, width / 2 - this.pos.x);
      this.pos.x = width / 2 + cos(angleToCenter) * (plateRadius - this.size * 2);
      this.pos.y = height / 2 + sin(angleToCenter) * (plateRadius - this.size * 2);
      let normal = createVector(cos(angleToCenter), sin(angleToCenter));
      this.vel.reflect(normal).mult(0.8);
    }
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size * 2);
  }
}

class VelocityField {
  constructor(cols, rows, scale) {
    this.cols = cols;
    this.rows = rows;
    this.scale = scale;
    this.grid = [];
    this.time = 0;

    for (let i = 0; i < cols; i++) {
      this.grid[i] = [];
      for (let j = 0; j < rows; j++) {
        this.grid[i][j] = createVector(0, 0);
      }
    }
  }

  resize(cols, rows, scale) {
    this.cols = cols;
    this.rows = rows;
    this.scale = scale;
    this.grid = [];
    for (let i = 0; i < cols; i++) {
      this.grid[i] = [];
      for (let j = 0; j < rows; j++) {
        this.grid[i][j] = createVector(0, 0);
      }
    }
  }

  update(type) {
    this.time += 0.5;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let x = i * this.scale + this.scale / 2;
        let y = j * this.scale + this.scale / 2;

        let distFromCenter = dist(x, y, centerX, centerY);
        if (distFromCenter > plateRadius) {
          this.grid[i][j] = createVector(0, 0);
          continue;
        }

        let vx = 0, vy = 0;

        switch (type) {
          case 'vortex':
            let angle = atan2(y - centerY, x - centerX);
            let strength = map(distFromCenter, 0, plateRadius, 2, 0.5);
            vx = cos(angle + 90) * strength;
            vy = sin(angle + 90) * strength;
            break;

          case 'radial':
            let radialStrength = map(distFromCenter, 0, plateRadius, 0.5, 2);
            let radialAngle = atan2(y - centerY, x - centerX);
            vx = cos(radialAngle) * radialStrength;
            vy = sin(radialAngle) * radialStrength;
            break;

          case 'turbulent':
            let n = noise(x * 0.01, y * 0.01, this.time * 0.01);
            vx = (n - 0.5) * 2;
            vy = (noise(x * 0.01 + 1000, y * 0.01 + 1000, this.time * 0.01) - 0.5) * 2;
            break;
        }

        this.grid[i][j] = createVector(vx, vy);
      }
    }
  }

  getVelocity(x, y) {
    let i = floor(x / this.scale);
    let j = floor(y / this.scale);

    if (i < 0 || i >= this.cols || j < 0 || j >= this.rows) {
      return createVector(0, 0);
    }

    return this.grid[i][j].copy();
  }

  display() {
    const centerX = width / 2;
    const centerY = height / 2;

    stroke(50, 100, 200, 80);
    strokeWeight(1);

    for (let i = 0; i < this.cols; i += 3) {
      for (let j = 0; j < this.rows; j += 3) {
        let x = i * this.scale + this.scale / 2;
        let y = j * this.scale + this.scale / 2;

        let distFromCenter = dist(x, y, centerX, centerY);
        if (distFromCenter > plateRadius) continue;

        let v = this.grid[i][j];
        if (v.mag() > 0) {
          let arrowLen = min(v.mag() * 2, 15);
          let arrowX = x + v.x * arrowLen;
          let arrowY = y + v.y * arrowLen;

          line(x, y, arrowX, arrowY);

          let angle = atan2(v.y, v.x);
          let headSize = 3;
          push();
          translate(arrowX, arrowY);
          rotate(angle);
          line(0, 0, -headSize, headSize / 2);
          line(0, 0, -headSize, -headSize / 2);
          pop();
        }
      }
    }
  }
}
