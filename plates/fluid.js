/**
 * Fluid Flow Plate - Wave-based particle movement within a circular plate boundary
 */

let particles = [];
let plateRadius = 300;
let waveFreq = 0.1;
let waveAmp = 20;
let particleSpeed = 2;
let numParticles = 500;
let isPaused = false;
let wavePhase = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Create particles within plate
  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    particles[i] = new FluidParticle(x, y);
  }

  background(0);
  setupUI();
}

function setupUI() {
  let particleCount = document.getElementById('particle-count');
  let restartBtn = document.getElementById('restart');
  let freqSlider = document.getElementById('wave-freq');
  let ampSlider = document.getElementById('wave-amp');
  let speedSlider = document.getElementById('particle-speed');

  if (particleCount) particleCount.textContent = particles.length;

  if (freqSlider) {
    freqSlider.addEventListener('input', () => {
      waveFreq = parseFloat(freqSlider.value);
    });
  }

  if (ampSlider) {
    ampSlider.addEventListener('input', () => {
      waveAmp = parseInt(ampSlider.value);
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      particleSpeed = parseFloat(speedSlider.value);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        let angle = random(360);
        let distance = random(plateRadius * 0.8);
        let x = width / 2 + cos(angle) * distance;
        let y = height / 2 + sin(angle) * distance;
        particles[i] = new FluidParticle(x, y);
      }
      if (particleCount) particleCount.textContent = particles.length;
      background(0);
    });
  }
}

function draw() {
  if (isPaused) return;

  // Fade background for trail effect
  background(0, 10);

  // Update wave phase
  wavePhase += 0.5;

  // Update and display particles
  for (let p of particles) {
    p.update();
    p.display();
  }

  // Draw plate boundary on top
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= plateRadius) {
    for (let i = 0; i < 50; i++) {
      let angle = random(360);
      let distance = random(30);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      if (dist(x, y, width/2, height/2) <= plateRadius) {
        particles.push(new FluidParticle(x, y));
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
    particles = [];
    for (let i = 0; i < numParticles; i++) {
      let angle = random(360);
      let distance = random(plateRadius * 0.8);
      let x = width / 2 + cos(angle) * distance;
      let y = height / 2 + sin(angle) * distance;
      particles[i] = new FluidParticle(x, y);
    }
    let particleCount = document.getElementById('particle-count');
    if (particleCount) particleCount.textContent = particles.length;
    background(0);
  } else if (key === 'c' || key === 'C') {
    particles = [];
    let particleCount = document.getElementById('particle-count');
    if (particleCount) particleCount.textContent = particles.length;
    background(0);
  } else if (key === 's' || key === 'S') {
    saveCanvas('fluid_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function waveDisplacement(x, y) {
  let totalDx = 0;
  let totalDy = 0;
  let waveCount = 3;

  for (let i = 0; i < waveCount; i++) {
    let waveAngle = i * (360 / waveCount) + wavePhase * 0.3 * (i + 1);
    let freq = waveFreq * (i + 0.5);

    let waveOriginX = width / 2 + cos(wavePhase * 0.1 * i) * 100;
    let waveOriginY = height / 2 + sin(wavePhase * 0.1 * i) * 100;

    let distFromWaveOrigin = dist(x, y, waveOriginX, waveOriginY);
    let wavePhaseOffset = wavePhase * freq + distFromWaveOrigin * 0.02;

    let displacement = sin(wavePhaseOffset) * waveAmp * 0.1;

    let angleToOrigin = atan2(waveOriginY - y, waveOriginX - x);

    totalDx += cos(angleToOrigin) * displacement;
    totalDy += sin(angleToOrigin) * displacement;

    totalDx += cos(angleToOrigin + 90) * displacement * 2;
    totalDy += sin(angleToOrigin + 90) * displacement * 2;
  }

  return createVector(totalDx, totalDy);
}

class FluidParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.size = random(2, 5);
    this.maxSpeed = 3;
    this.color = color(200, 200, 255, 150);
  }

  update() {
    let waveDisp = waveDisplacement(this.pos.x, this.pos.y);
    let waveDispNext = waveDisplacement(this.pos.x + this.vel.x, this.pos.y + this.vel.y);

    this.acc.add(waveDispNext);
    this.acc.limit(0.5);

    this.vel.add(this.acc);
    this.vel.mult(0.9);
    this.vel.limit(this.maxSpeed * particleSpeed);

    this.pos.add(this.vel);

    this.acc.mult(0);

    this.constrainToPlate();
  }

  constrainToPlate() {
    let distFromCenter = dist(this.pos.x, this.pos.y, width / 2, height / 2);
    if (distFromCenter > plateRadius - this.size) {
      let angleToCenter = atan2(height / 2 - this.pos.y, width / 2 - this.pos.x);
      this.pos.x = width / 2 + cos(angleToCenter) * (plateRadius - this.size - 1);
      this.pos.y = height / 2 + sin(angleToCenter) * (plateRadius - this.size - 1);

      let normalAngle = angleToCenter + 180;
      let reflectionAngle = 2 * normalAngle - this.vel.heading();
      this.vel.setMag(this.vel.mag() * 0.5);
      this.vel.setHeading(reflectionAngle);
    }
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}
