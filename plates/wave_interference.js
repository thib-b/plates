/**
 * Wave Interference Plate
 * Multiple wave emitters create interference patterns via additive wave propagation.
 */

let waves = [];
let emitters = [];
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;

let config = {
  emitterCount: 4,
  frequency: 0.05,
  waveSpeed: 2,
  damping: 0.98,
  amplitude: 10,
  wavelength: 50,
  colorMode: 'rainbow'
};

let waveField = [];
let fieldSize = 200;
let cellSize = 2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 1.0);
  frameRate(60);
  setupUI();
  initField();
  initEmitters();
}

function setupUI() {
  document.getElementById('fps').textContent = fps;
  ['emitter-count','frequency','wave-speed','damping','amplitude','wavelength'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
      config[e.target.id.replace(/-g/, '')] = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
      if (id === 'emitter-count') initEmitters();
    });
  });
  document.getElementById('color-mode').addEventListener('change', e => config.colorMode = e.target.value);
  document.getElementById('randomize-emitters').addEventListener('click', () => { emitters = []; initEmitters(); });
  document.getElementById('reset').addEventListener('click', () => { waves = []; initField(); });
}

function initField() {
  waveField = [];
  for (let y = 0; y < fieldSize; y++) {
    waveField[y] = [];
    for (let x = 0; x < fieldSize; x++) {
      waveField[y][x] = { v: 0, prev: 0 };
    }
  }
}

function initEmitters() {
  emitters = [];
  for (let i = 0; i < config.emitterCount; i++) {
    let angle = TWO_PI * i / config.emitterCount;
    let x = width/2 + cos(angle) * plateRadius * 0.9;
    let y = height/2 + sin(angle) * plateRadius * 0.9;
    emitters.push(new Emitter(x, y, i));
  }
}

function draw() {
  if (frameCount % 10 === 0) {
    fps = 10000 / (millis() - lastFrameTime);
    lastFrameTime = millis();
    document.getElementById('fps').textContent = Math.round(fps);
  }
  if (isPaused) return;

  background(10, 10, 20, 1.0);
  updateWaves();
  renderField();
  drawPlate();
  drawEmitters();
}

function updateWaves() {
  for (let e of emitters) {
    e.update();
    if (e.shouldEmit()) waves.push(e.emitWave());
  }
  for (let i = waves.length-1; i >= 0; i--) {
    waves[i].update();
    if (waves[i].radius > plateRadius*1.5) waves.splice(i, 1);
  }
}

function renderField() {
  noStroke();
  let cx = width/2 - plateRadius;
  let cy = height/2 - plateRadius;

  // Reset field
  for (let y = 0; y < fieldSize; y++)
    for (let x = 0; x < fieldSize; x++)
      waveField[y][x].v = 0;

  // Add wave contributions
  for (let w of waves) {
    let fx = floor((w.x - cx) / cellSize);
    let fy = floor((w.y - cy) / cellSize);
    let rad = w.radius / cellSize;
    for (let y = max(0, fy-rad); y <= min(fieldSize-1, fy+rad); y++) {
      for (let x = max(0, fx-rad); x <= min(fieldSize-1, fx+rad); x++) {
        let d = dist(fx+0.5, fy+0.5, x, y) * cellSize;
        if (d <= w.radius) {
          let amp = w.amplitude * (1 - d/w.radius) * sin(frameCount*0.1 + w.phase + d*0.1);
          waveField[y][x].v += amp;
        }
      }
    }
  }

  // Render
  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      let d = dist(x*cellSize + cx, y*cellSize + cy, width/2, height/2);
      if (d > plateRadius) continue;
      let v = waveField[y][x].v;
      let c = getColor(abs(v) / (config.amplitude * emitters.length * 0.3), config.colorMode);
      fill(c);
      rect(cx + x*cellSize, cy + y*cellSize, cellSize, cellSize);
    }
  }
}

function getColor(norm, mode) {
  norm = min(norm, 1);
  switch(mode) {
    case 'grayscale': return color(0, 0, 100*norm, norm);
    case 'heat': return color(40*norm, 100, 100*norm, norm);
    case 'ocean': return color(200+40*norm, 100, 50+50*norm, norm);
    default: return color(200+160*norm, 100, 100*norm, norm);
  }
}

function drawPlate() {
  noFill();
  stroke(80, 80, 100, 0.6); strokeWeight(8);
  ellipse(width/2, height/2, plateRadius*2+20, plateRadius*2+20);
  stroke(100, 120, 140, 0.6); strokeWeight(4);
  ellipse(width/2, height/2, plateRadius*2+10, plateRadius*2+10);
  fill(15, 20, 25, 0.3); noStroke();
  ellipse(width/2, height/2, plateRadius*2, plateRadius*2);
}

function drawEmitters() {
  for (let e of emitters) e.display();
}

function mousePressed() {
  let d = dist(mouseX, mouseY, width/2, height/2);
  if (d <= plateRadius) {
    emitters.push(new Emitter(mouseX, mouseY, emitters.length));
    config.emitterCount = emitters.length;
    document.getElementById('emitter-count').value = config.emitterCount;
  }
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') { waves = []; initField(); }
  else if (key === 'c' || key === 'C') waves = [];
  else if (key === 's' || key === 'S') saveCanvas('wave_'+nf(year(),4)+nf(month(),2)+nf(day(),2), 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initField();
}

class Emitter {
  constructor(x, y, idx) {
    this.x = x; this.y = y; this.idx = idx;
    this.phase = random(TWO_PI);
    this.timer = 0;
    this.color = color(random(360), 80, 80);
  }
  update() { this.phase += config.frequency; this.timer++; }
  shouldEmit() { return this.timer >= 5 + random(10); }
  emitWave() {
    this.timer = 0;
    return new Wave(this.x, this.y, this.phase, config.amplitude, config.waveSpeed, this.idx);
  }
  display() {
    noStroke(); fill(this.color);
    ellipse(this.x, this.y, 8, 8);
    fill(red(this.color), green(this.color), blue(this.color), 0.3 * (0.5 + 0.5 * sin(frameCount*0.2 + this.idx)));
    ellipse(this.x, this.y, 24, 24);
  }
}

class Wave {
  constructor(x, y, phase, amp, speed, emitterIdx) {
    this.x = x; this.y = y; this.phase = phase;
    this.amplitude = amp; this.speed = speed;
    this.radius = 0; this.emitterIdx = emitterIdx;
    this.color = emitters[emitterIdx].color;
  }
  update() { this.radius += this.speed; this.amplitude *= config.damping; }
}
