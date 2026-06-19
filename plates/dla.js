/**
 * Diffusion-Limited Aggregation Plate
 * Particles walk randomly and stick to existing clusters to form fractal patterns
 */

const PLATE_RADIUS = 300;

let particles = [];
let aggregates = [];
let numParticles = 50;
let particleSize = 2;
let maxParticles = 200;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  // Initialize with a seed aggregate at the center
  let center = createVector(width / 2, height / 2);
  aggregates.push(center.copy());
  
  // Create initial particles
  for (let i = 0; i < numParticles; i++) {
    spawnParticle();
  }
  
  setupUI();
}

function setupUI() {
  const particleCountSpan = document.getElementById('particle-count');
  const particleSizeSpan = document.getElementById('particle-size');
  const particleCountSlider = document.getElementById('particle-count-slider');
  const particleSizeSlider = document.getElementById('particle-size-slider');
  const restartBtn = document.getElementById('restart');
  const clearBtn = document.getElementById('clear');

  if (particleCountSpan) particleCountSpan.textContent = numParticles;
  if (particleSizeSpan) particleSizeSpan.textContent = particleSize;

  if (particleCountSlider) {
    particleCountSlider.addEventListener('input', (e) => {
      numParticles = parseInt(e.target.value);
      if (particleCountSpan) particleCountSpan.textContent = numParticles;
    });
  }

  if (particleSizeSlider) {
    particleSizeSlider.addEventListener('input', (e) => {
      particleSize = parseInt(e.target.value);
      if (particleSizeSpan) particleSizeSpan.textContent = particleSize;
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      aggregates = [];
      particles = [];
      let center = createVector(width / 2, height / 2);
      aggregates.push(center.copy());
      for (let i = 0; i < numParticles; i++) {
        spawnParticle();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      aggregates = [];
      particles = [];
      let center = createVector(width / 2, height / 2);
      aggregates.push(center.copy());
    });
  }
}

function spawnParticle() {
  // Spawn particle at random position outside the existing cluster
  let angle = random(360);
  let distance = PLATE_RADIUS * 0.9;
  let radius = random(PLATE_RADIUS * 0.5, PLATE_RADIUS);
  
  let x = width / 2 + cos(angle) * radius;
  let y = height / 2 + sin(angle) * radius;
  
  particles.push({
    pos: createVector(x, y),
    vel: createVector(random(-1, 1), random(-1, 1)),
    size: particleSize
  });
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  // Draw plate fill (semi-transparent)
  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  // Update and draw aggregates (stuck particles)
  noStroke();
  fill(200, 255, 255);
  for (let a of aggregates) {
    ellipse(a.x, a.y, particleSize * 2, particleSize * 2);
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    // Move particle randomly
    p.pos.add(p.vel);
    
    // Add some randomness to velocity
    p.vel.add(createVector(random(-0.2, 0.2), random(-0.2, 0.2)));
    p.vel.limit(2);
    
    // Check if particle is near any aggregate
    let stuck = false;
    for (let a of aggregates) {
      let d = p.pos.dist(a);
      if (d < particleSize * 2 + 3) {
        // Particle sticks to aggregate
        aggregates.push(p.pos.copy());
        stuck = true;
        break;
      }
    }
    
    // Also check if particle is near other particles that just stuck
    if (!stuck) {
      for (let j = 0; j < aggregates.length; j++) {
        let d = p.pos.dist(aggregates[j]);
        if (d < particleSize * 2 + 3) {
          aggregates.push(p.pos.copy());
          stuck = true;
          break;
        }
      }
    }
    
    if (stuck) {
      particles.splice(i, 1);
      
      // Spawn a new particle if we're below max
      if (particles.length < numParticles && aggregates.length + particles.length < maxParticles) {
        spawnParticle();
      }
    } else {
      // Draw moving particle
      noStroke();
      fill(100, 200, 255, 150);
      ellipse(p.pos.x, p.pos.y, p.size, p.size);
    }
    
    // Constrain particle to plate
    let distFromCenter = dist(p.pos.x, p.pos.y, width / 2, height / 2);
    if (distFromCenter > PLATE_RADIUS) {
      // Bounce off boundary
      let angleToCenter = degrees(atan2(height / 2 - p.pos.y, width / 2 - p.pos.x));
      p.pos.x = width / 2 + cos(angleToCenter) * (PLATE_RADIUS - 1);
      p.pos.y = height / 2 + sin(angleToCenter) * (PLATE_RADIUS - 1);
      p.vel.x *= -0.5;
      p.vel.y *= -0.5;
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    aggregates = [];
    particles = [];
    let center = createVector(width / 2, height / 2);
    aggregates.push(center.copy());
    for (let i = 0; i < numParticles; i++) {
      spawnParticle();
    }
  } else if (key === 'c' || key === 'C') {
    aggregates = [];
    particles = [];
    let center = createVector(width / 2, height / 2);
    aggregates.push(center.copy());
  } else if (key === 's' || key === 'S') {
    saveCanvas('dla_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
