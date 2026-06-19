/**
 * Fire Simulation Plate
 * Particle-based fire effect starting from center of plate
 */

const PLATE_RADIUS = 300;
let particles = [];
let emitterX = 0;
let emitterY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  // Set emitter at center of plate
  emitterX = width / 2;
  emitterY = height / 2;
  
  // Create initial particles at center
  for (let i = 0; i < 200; i++) {
    spawnParticle();
  }
  
  document.getElementById('restart')?.addEventListener('click', () => {
    particles = [];
    for (let i = 0; i < 200; i++) {
      spawnParticle();
    }
  });
}

function spawnParticle() {
  // Spawn from center with random offset
  let angle = random(360);
  let distance = random(0, PLATE_RADIUS * 0.1);
  particles.push({
    x: emitterX + cos(angle) * distance,
    y: emitterY + sin(angle) * distance,
    size: random(2, 5),
    life: 100,
    maxLife: 100,
    vx: random(-0.5, 0.5),
    vy: random(-1.5, -0.5)
  });
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  // Draw plate fill
  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    p.x += p.vx + random(-0.2, 0.2);
    p.y += p.vy;
    p.life--;
    
    // Color based on life (red to yellow to white)
    let lifeRatio = constrain(p.life / p.maxLife, 0, 1);
    fill(255 * lifeRatio, 255 * (1 - lifeRatio) * 0.7 + 150, 50 * lifeRatio);
    noStroke();
    ellipse(p.x, p.y, p.size, p.size);
    
    // Respawn if dead or out of bounds
    if (p.life <= 0 || dist(p.x, p.y, width / 2, height / 2) > PLATE_RADIUS) {
      particles.splice(i, 1);
      spawnParticle();
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    particles = [];
    for (let i = 0; i < 200; i++) {
      spawnParticle();
    }
  } else if (key === 's' || key === 'S') {
    saveCanvas('fire_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Update emitter position
  emitterX = width / 2;
  emitterY = height / 2;
}
