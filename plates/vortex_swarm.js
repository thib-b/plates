/**
 * Vortex Swarm Plate - Particles orbit moving vortex centers
 * Particles follow circular paths around vortices, switching when closer to another
 */

let particles = [];
let vortices = [];
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;

let config = {
  vortexCount: 3,
  particleCount: 100,
  orbitStrength: 1,
  switchThreshold: 0.5,
  particleSize: 3,
  colors: [
    [255, 100, 200], [100, 200, 255], [200, 255, 100],
    [255, 150, 50], [150, 255, 150], [255, 100, 100]
  ]
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  
  initVortices();
  spawnParticles();
  setupUI();
}

function setupUI() {
  document.getElementById('particle-count').textContent = config.particleCount;
  document.getElementById('vortex-count').textContent = config.vortexCount;

  document.getElementById('vortex-count-slider').addEventListener('input', (e) => {
    config.vortexCount = parseInt(e.target.value);
    document.getElementById('vortex-count').textContent = config.vortexCount;
    initVortices();
  });

  document.getElementById('particle-count-slider').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particle-count').textContent = config.particleCount;
    spawnParticles();
  });

  document.getElementById('orbit-strength-slider').addEventListener('input', (e) => {
    config.orbitStrength = parseFloat(e.target.value);
  });

  document.getElementById('switch-threshold-slider').addEventListener('input', (e) => {
    config.switchThreshold = parseFloat(e.target.value);
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    initVortices();
    spawnParticles();
  });
}

function initVortices() {
  vortices = [];
  for (let i = 0; i < config.vortexCount; i++) {
    let angle = i * (360 / config.vortexCount);
    let distance = plateRadius * 0.7;
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    let vx = cos(angle + 90) * 0.5;
    let vy = sin(angle + 90) * 0.5;
    vortices.push({ x, y, vx, vy, radius: 30 + i * 20, color: color(random(255), random(255), random(255)) });
  }
}

function spawnParticles() {
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    let vortex = random(vortices);
    let angle = random(360);
    let distance = random(vortex.radius * 0.5);
    let x = vortex.x + cos(angle) * distance;
    let y = vortex.y + sin(angle) * distance;
    let col = config.colors[i % config.colors.length];
    particles.push({
      x, y,
      vx: random(-1, 1), vy: random(-1, 1),
      targetVortex: vortex,
      color: color(col[0], col[1], col[2]),
      size: config.particleSize
    });
  }
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps').textContent = Math.round(fps);
  }
  
  if (isPaused) {
    drawStatic();
    return;
  }

  background(10, 10, 20);
  
  // Update vortices
  for (let v of vortices) {
    v.x += v.vx;
    v.y += v.vy;
    
    // Bounce off plate boundary
    let d = dist(v.x, v.y, width / 2, height / 2);
    if (d > plateRadius - v.radius) {
      let nx = v.x - width / 2;
      let ny = v.y - height / 2;
      let normalLength = sqrt(nx * nx + ny * ny);
      nx /= normalLength;
      ny /= normalLength;
      let dot = v.vx * nx + v.vy * ny;
      v.vx -= 2 * dot * nx;
      v.vy -= 2 * dot * ny;
      let overlap = d - (plateRadius - v.radius);
      v.x -= nx * overlap * 1.1;
      v.y -= ny * overlap * 1.1;
    }
  }

  // Update particles
  for (let p of particles) {
    // Find closest vortex
    let closestVortex = p.targetVortex;
    let minDist = Infinity;
    for (let v of vortices) {
      let d = dist(p.x, p.y, v.x, v.y);
      if (d < minDist) {
        minDist = d;
        closestVortex = v;
      }
    }
    
    // Switch vortex if significantly closer
    if (minDist < dist(p.x, p.y, p.targetVortex.x, p.targetVortex.y) * config.switchThreshold) {
      p.targetVortex = closestVortex;
    }
    
    // Orbit around target vortex
    let dx = p.targetVortex.x - p.x;
    let dy = p.targetVortex.y - p.y;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d > 0) {
      // Tangential velocity for orbiting
      let tangentX = -dy / d;
      let tangentY = dx / d;
      
      let orbitForce = config.orbitStrength / max(1, d / p.targetVortex.radius);
      p.vx += tangentX * orbitForce;
      p.vy += tangentY * orbitForce;
    }
    
    // Apply velocity with damping
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;
    
    // Constrain to plate
    let dFromCenter = dist(p.x, p.y, width / 2, height / 2);
    if (dFromCenter > plateRadius) {
      let nx = p.x - width / 2;
      let ny = p.y - height / 2;
      let normalLength = sqrt(nx * nx + ny * ny);
      p.x = width / 2 + (nx / normalLength) * plateRadius * 0.95;
      p.y = height / 2 + (ny / normalLength) * plateRadius * 0.95;
      p.vx *= -0.5;
      p.vy *= -0.5;
    }
  }

  drawStatic();
}

function drawStatic() {
  // Draw plate
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(8);
  ellipse(width / 2, height / 2, plateRadius * 2 + 20, plateRadius * 2 + 20);
  
  stroke(100, 120, 140, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
  
  fill(15, 20, 25);
  noStroke();
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  // Draw vortices
  for (let v of vortices) {
    noStroke();
    fill(red(v.color), green(v.color), blue(v.color), 150);
    ellipse(v.x, v.y, v.radius * 2, v.radius * 2);
    fill(red(v.color), green(v.color), blue(v.color));
    ellipse(v.x, v.y, 10, 10);
  }

  // Draw particles
  noStroke();
  for (let p of particles) {
    fill(p.color);
    ellipse(p.x, p.y, p.size, p.size);
    fill(red(p.color), green(p.color), blue(p.color), 50);
    ellipse(p.x, p.y, p.size * 3, p.size * 3);
  }
}

function mousePressed() {
  let d = dist(mouseX, mouseY, width / 2, height / 2);
  if (d <= plateRadius) {
    vortices.push({
      x: mouseX,
      y: mouseY,
      vx: random(-1, 1),
      vy: random(-1, 1),
      radius: random(20, 60),
      color: color(random(255), random(255), random(255))
    });
    config.vortexCount = vortices.length;
    document.getElementById('vortex-count').textContent = config.vortexCount;
    document.getElementById('vortex-count-slider').value = config.vortexCount;
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    initVortices();
    spawnParticles();
  } else if (key === 's' || key === 'S') {
    saveCanvas('vortex_swarm_' + year() + month() + day() + '_' + hour() + minute() + second(), 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
