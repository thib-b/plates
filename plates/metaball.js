/**
 * Metaball Fusion Plate
 * Soft blobs (metaballs) that move and smoothly merge when overlapping.
 * Uses distance field approach with pixel-based rendering for smooth blending.
 */

const plateRadius = 300;
let metaballs = [];
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;
let pixelDensityValue = 1;

// Configuration
let config = {
  ballCount: 10,
  minRadius: 50,
  maxRadius: 100,
  speed: 1,
  blendThreshold: 0.8,
  blendMode: 'lerp'
};

// Create offscreen graphics buffer for distance field
let buffer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  frameRate(60);

  // Create buffer matching display density
  buffer = createGraphics(width, height);

  initializeMetaballs();
  setupUI();
}

function initializeMetaballs() {
  metaballs = [];
  for (let i = 0; i < config.ballCount; i++) {
    metaballs.push(createRandomMetaball());
  }
}

function createRandomMetaball() {
  let angle = random(360);
  let distance = random(plateRadius * 0.7);
  let x = width / 2 + cos(angle) * distance;
  let y = height / 2 + sin(angle) * distance;

  let angleVel = random(360);
  let speed = random(0.5, 2);

  return {
    x: x,
    y: y,
    vx: cos(angleVel) * speed * config.speed,
    vy: sin(angleVel) * speed * config.speed,
    radius: random(config.minRadius, config.maxRadius),
    color: color(random(100, 255), random(100, 255), random(100, 255))
  };
}

function setupUI() {
  document.getElementById('ball-count').textContent = config.ballCount;
  document.getElementById('blend-mode').value = config.blendMode;

  document.getElementById('ball-count-slider').addEventListener('input', (e) => {
    config.ballCount = parseInt(e.target.value);
    document.getElementById('ball-count').textContent = config.ballCount;
    initializeMetaballs();
  });

  document.getElementById('min-radius').addEventListener('input', (e) => {
    config.minRadius = parseInt(e.target.value);
    initializeMetaballs();
  });

  document.getElementById('max-radius').addEventListener('input', (e) => {
    config.maxRadius = parseInt(e.target.value);
    initializeMetaballs();
  });

  document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    initializeMetaballs();
  });

  document.getElementById('threshold').addEventListener('input', (e) => {
    config.blendThreshold = parseFloat(e.target.value);
  });

  document.getElementById('blend-mode').addEventListener('change', (e) => {
    config.blendMode = e.target.value;
  });

  document.getElementById('randomize').addEventListener('click', () => {
    for (let ball of metaballs) {
      ball.color = color(random(100, 255), random(100, 255), random(100, 255));
    }
  });

  document.getElementById('reset').addEventListener('click', () => {
    initializeMetaballs();
  });
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps').textContent = Math.round(fps);
  }

  if (isPaused) {
    drawFrame();
    return;
  }

  // Update metaballs
  for (let ball of metaballs) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off plate boundaries
    let d = dist(ball.x, ball.y, width / 2, height / 2);
    if (d > plateRadius - ball.radius) {
      let nx = ball.x - width / 2;
      let ny = ball.y - height / 2;
      let normalLength = sqrt(nx * nx + ny * ny);

      nx /= normalLength;
      ny /= normalLength;

      let dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;

      let overlap = d - (plateRadius - ball.radius);
      ball.x -= nx * overlap * 1.1;
      ball.y -= ny * overlap * 1.1;
    }
  }

  drawFrame();
}

function drawFrame() {
  background(10, 10, 20);
  drawPetriDish();
  drawMetaballs();
}

function drawPetriDish() {
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
}

function drawMetaballs() {
  buffer.background(0, 0, 0, 0);
  buffer.noStroke();

  // Render each metaball into buffer with additive blending
  for (let ball of metaballs) {
    // Draw the metaball with smooth gradient
    for (let r = ball.radius; r > 0; r -= 2) {
      let alpha = map(r, 0, ball.radius, 0, 200);
      buffer.fill(red(ball.color), green(ball.color), blue(ball.color), alpha);
      buffer.ellipse(ball.x, ball.y, r * 2, r * 2);
    }
  }

  // Composite buffer onto main canvas
  image(buffer, 0, 0);

  // Apply blend mode effect
  if (config.blendMode !== 'lerp') {
    applyBlendModeEffect();
  }
}

function applyBlendModeEffect() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];

    switch (config.blendMode) {
      case 'screen':
        r = 255 - ((255 - r) * (255 - r)) / 255;
        g = 255 - ((255 - g) * (255 - g)) / 255;
        b = 255 - ((255 - b) * (255 - b)) / 255;
        break;
      case 'multiply':
        r = (r * r) / 255;
        g = (g * g) / 255;
        b = (b * b) / 255;
        break;
      case 'add':
        r = min(255, r + 50);
        g = min(255, g + 50);
        b = min(255, b + 50);
        break;
      case 'lightest':
        // Already handled by blending
        break;
      case 'darkest':
        r = r * 0.7;
        g = g * 0.7;
        b = b * 0.7;
        break;
    }
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  updatePixels();
}

function mousePressed() {
  let d = dist(mouseX, mouseY, width / 2, height / 2);
  if (d <= plateRadius) {
    let angleVel = random(360);
    let speed = random(0.5, 2);
    metaballs.push({
      x: mouseX,
      y: mouseY,
      vx: cos(angleVel) * speed * config.speed,
      vy: sin(angleVel) * speed * config.speed,
      radius: random(config.minRadius, config.maxRadius),
      color: color(random(100, 255), random(100, 255), random(100, 255))
    });
    config.ballCount = metaballs.length;
    document.getElementById('ball-count').textContent = config.ballCount;
    document.getElementById('ball-count-slider').value = config.ballCount;
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    initializeMetaballs();
  } else if (key === 's' || key === 'S') {
    saveCanvas('metaball_' + year() + month() + day() + '_' + hour() + minute() + second(), 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buffer = createGraphics(width, height);
}
