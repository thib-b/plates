/**
 * Boolean Flow Field Plate
 * Combine 2-3 perlin noise vector fields using boolean operations
 */

const PLATE_RADIUS = 300;
let particles = [];
let numParticles = 300;
let fieldScale = 0.05;
let particleSpeed = 1;
let noiseIncrement = 0.05;
let boolOperation = 'and';
let isPaused = false;

let noiseOffset1 = random(1000);
let noiseOffset2 = random(1000);
let noiseOffset3 = random(1000);

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  spawnParticles();
  setupUI();
}

function setupUI() {
  const pc = document.getElementById('particle-count');
  const ps = document.getElementById('particle-count-slider');
  const fs = document.getElementById('field-scale');
  const sp = document.getElementById('particle-speed');
  const ni = document.getElementById('noise-inc');
  const bo = document.getElementById('bool-operation');
  const rb = document.getElementById('restart');

  function update() {
    if (pc) pc.textContent = particles.length;
  }

  if (ps) ps.addEventListener('input', () => { numParticles = parseInt(ps.value); spawnParticles(); update(); });
  if (fs) fs.addEventListener('input', () => { fieldScale = parseFloat(fs.value); });
  if (sp) sp.addEventListener('input', () => { particleSpeed = parseFloat(sp.value); });
  if (ni) ni.addEventListener('input', () => { noiseIncrement = parseFloat(ni.value); });
  if (bo) bo.addEventListener('change', () => { boolOperation = bo.value; });
  if (rb) rb.addEventListener('click', () => { 
    spawnParticles(); 
    update(); 
    noiseOffset1 = random(1000); 
    noiseOffset2 = random(1000); 
    noiseOffset3 = random(1000); 
    background(0); 
  });
  update();
}

function spawnParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(PLATE_RADIUS * 0.8);
    particles.push({
      x: width / 2 + cos(angle) * distance,
      y: height / 2 + sin(angle) * distance,
      size: random(2, 4)
    });
  }
}

function draw() {
  if (isPaused) return;
  
  fill(0, 0, 0, 20);
  noStroke();
  rect(0, 0, width, height);

  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);
  
  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  noiseOffset1 += noiseIncrement * 0.01;
  noiseOffset2 += noiseIncrement * 0.01;
  noiseOffset3 += noiseIncrement * 0.01;

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    let v1 = getVector(p.x, p.y, noiseOffset1);
    let v2 = getVector(p.x, p.y, noiseOffset2 + 5000);
    let v3 = getVector(p.x, p.y, noiseOffset3 + 10000);
    
    let finalV = combineVectors(v1, v2, v3);
    
    p.x += finalV.x * particleSpeed;
    p.y += finalV.y * particleSpeed;
    
    // Constrain to plate - simpler method
    if (dist(p.x, p.y, width / 2, height / 2) > PLATE_RADIUS) {
      p.x = width / 2 + cos(random(360)) * PLATE_RADIUS * 0.9;
      p.y = height / 2 + sin(random(360)) * PLATE_RADIUS * 0.9;
    }
    
    noStroke();
    fill(200, 255, 255);
    ellipse(p.x, p.y, p.size * 2, p.size * 2);
  }
}

function getVector(x, y, offset) {
  let nx = (x - width / 2 + PLATE_RADIUS) / (PLATE_RADIUS * 2) * 2 + offset;
  let ny = (y - height / 2 + PLATE_RADIUS) / (PLATE_RADIUS * 2) * 2 + offset * 1.5;
  
  let angle = noise(nx, ny) * PI * 2;
  return createVector(cos(angle), sin(angle));
}

function combineVectors(v1, v2, v3) {
  switch (boolOperation) {
    case 'and':
      if (v1.mag() > 0.5 && v2.mag() > 0.5) return v1.copy();
      return createVector(0, 0);
    case 'or':
      if (v1.mag() > 0.5 || v2.mag() > 0.5) return v1.copy();
      return v3.copy();
    case 'not':
      return v1.copy().mult(-1);
    case 'xor':
      return (v1.mag() > 0.5 !== v2.mag() > 0.5) ? v1.copy() : v2.copy().mult(-1);
    case 'nand':
      return (!(v1.mag() > 0.5 && v2.mag() > 0.5)) ? v1.copy() : createVector(0, 0);
    case 'nor':
      return (!(v1.mag() > 0.5 || v2.mag() > 0.5)) ? v1.copy() : createVector(0, 0);
    default:
      return v1.copy();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    spawnParticles();
    noiseOffset1 = random(1000);
    noiseOffset2 = random(1000);
    noiseOffset3 = random(1000);
    background(0);
  } else if (key === 'c' || key === 'C') {
    particles = [];
  } else if (key === 's' || key === 'S') {
    saveCanvas('boolean_flow_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  spawnParticles();
}
