/**
 * Phyllotaxis Spiral Plate
 * Golden ratio spiral pattern generator
 * Elements arranged following Fibonacci sequence angles (137.5°)
 */

let elements = [];
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;

// Configuration
let config = {
  elementType: 'circle',
  colorScheme: 'golden',
  scaleFactor: 2,
  growthSpeed: 1,
  elementSize: 8,
  angle: 137.5,
  c: 0.3,
  maxElements: 2000
};

// Growth state
let growthIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  frameRate(60);
  setupUI();

  resetGrowth();
}

function setupUI() {
  document.getElementById('element-count').textContent = elements.length;
  document.getElementById('scale-value').textContent = config.scaleFactor;
  document.getElementById('speed-value').textContent = config.growthSpeed;
  document.getElementById('size-value').textContent = config.elementSize;

  document.getElementById('element-type').addEventListener('change', (e) => {
    config.elementType = e.target.value;
  });

  document.getElementById('color-scheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
  });

  document.getElementById('scale-factor').addEventListener('input', (e) => {
    config.scaleFactor = parseFloat(e.target.value);
    document.getElementById('scale-value').textContent = config.scaleFactor.toFixed(1);
  });

  document.getElementById('growth-speed').addEventListener('input', (e) => {
    config.growthSpeed = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = config.growthSpeed;
  });

  document.getElementById('element-size').addEventListener('input', (e) => {
    config.elementSize = parseInt(e.target.value);
    document.getElementById('size-value').textContent = config.elementSize;
  });

  document.getElementById('reset').addEventListener('click', () => {
    resetGrowth();
  });

  document.getElementById('clear').addEventListener('click', () => {
    elements = [];
    growthIndex = 0;
    updateElementCount();
  });
}

function updateElementCount() {
  document.getElementById('element-count').textContent = elements.length;
}

function resetGrowth() {
  elements = [];
  growthIndex = 0;
  updateElementCount();
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps').textContent = Math.round(fps);
  }

  if (isPaused) return;

  background(26, 26, 46);
  drawPetriDish();

  for (let el of elements) {
    el.display();
  }

  for (let i = 0; i < config.growthSpeed; i++) {
    addNextElement();
  }
}

function drawPetriDish() {
  noFill();

  stroke(80, 80, 100, 150);
  strokeWeight(8);
  ellipse(width / 2, height / 2, plateRadius * 2 + 20, plateRadius * 2 + 20);

  stroke(100, 120, 140, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);

  fill(20, 25, 35);
  noStroke();
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);
}

function addNextElement() {
  if (elements.length >= config.maxElements) return;

  let centerX = width / 2;
  let centerY = height / 2;

  let n = growthIndex;
  let angle = n * config.angle;
  let distance = config.c * config.scaleFactor * sqrt(n);

  let x = centerX + cos(angle) * distance;
  let y = centerY + sin(angle) * distance;

  let d = dist(x, y, centerX, centerY);
  if (d > plateRadius) {
    return;
  }

  let el = new PhyllotaxisElement(x, y, n);
  elements.push(el);
  growthIndex++;

  updateElementCount();
}

function mousePressed() {
  addNextElement();
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    resetGrowth();
  } else if (key === 'c' || key === 'C') {
    elements = [];
    growthIndex = 0;
    updateElementCount();
  } else if (key === 's' || key === 'S') {
    saveCanvas('phyllotaxis_' + year() + month() + day() + '_' + hour() + minute() + second(), 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Phyllotaxis Element
class PhyllotaxisElement {
  constructor(x, y, index) {
    this.x = x;
    this.y = y;
    this.index = index;
  }

  getColor() {
    let hue, saturation, brightness;

    switch (config.colorScheme) {
      case 'golden':
        hue = map(this.index % 50, 0, 50, 40, 20);
        saturation = 200;
        brightness = 255;
        break;
      case 'rainbow':
        hue = map(this.index % 100, 0, 100, 0, 360);
        saturation = 200;
        brightness = 255;
        break;
      case 'monochrome':
        hue = 210;
        saturation = 100;
        brightness = map(this.index % 100, 0, 100, 100, 255);
        break;
      case 'warm':
        hue = map(this.index % 50, 0, 50, 0, 60);
        saturation = 200;
        brightness = 255;
        break;
      case 'cool':
        hue = map(this.index % 50, 0, 50, 180, 240);
        saturation = 200;
        brightness = 255;
        break;
      default:
        hue = map(this.index % 50, 0, 50, 40, 20);
        saturation = 200;
        brightness = 255;
    }

    let centerX = width / 2;
    let centerY = height / 2;
    let distFromCenter = dist(this.x, this.y, centerX, centerY);
    let distFactor = map(distFromCenter, 0, plateRadius, 1, 1.5);
    brightness = constrain(brightness * distFactor, 50, 255);

    return color(hue, saturation, brightness);
  }

  display() {
    let elColor = this.getColor();
    let centerX = width / 2;
    let centerY = height / 2;
    let distFromCenter = dist(this.x, this.y, centerX, centerY);
    let size = map(distFromCenter, 0, plateRadius, config.elementSize * 1.5, config.elementSize * 0.5);
    size = constrain(size, 2, config.elementSize * 2);

    switch (config.elementType) {
      case 'circle':
        this.drawCircle(elColor, size);
        break;
      case 'leaf':
        this.drawLeaf(elColor, size);
        break;
      case 'petal':
        this.drawPetal(elColor, size);
        break;
    }
  }

  drawCircle(col, size) {
    noStroke();
    fill(col);
    ellipse(this.x, this.y, size, size);
    fill(red(col), green(col), blue(col), 100);
    ellipse(this.x, this.y, size * 2, size * 2);
  }

  drawLeaf(col, size) {
    push();
    translate(this.x, this.y);
    let leafWidth = size * 1.5;
    let leafHeight = size * 3;
    noStroke();
    fill(col);
    ellipse(0, 0, leafWidth, leafHeight);
    stroke(red(col) * 0.7, green(col) * 0.7, blue(col) * 0.7);
    strokeWeight(1);
    line(-leafWidth/2, 0, leafWidth/2, 0);
    noStroke();
    fill(red(col), green(col), blue(col), 80);
    ellipse(0, 0, leafWidth * 1.5, leafHeight * 1.5);
    pop();
  }

  drawPetal(col, size) {
    push();
    translate(this.x, this.y);
    let petalSize = size * 1.2;
    noStroke();
    fill(col);
    beginShape();
    vertex(-petalSize/2, 0);
    bezierVertex(-petalSize/2, -petalSize/3, 0, -petalSize, petalSize/2, 0);
    bezierVertex(petalSize/2, petalSize, 0, petalSize/3, -petalSize/2, 0);
    endShape(CLOSE);
    fill(red(col), green(col), blue(col), 80);
    beginShape();
    vertex(-petalSize/2 * 1.5, 0);
    bezierVertex(-petalSize/2 * 1.5, -petalSize/2, 0, -petalSize * 1.5, petalSize/2 * 1.5, 0);
    bezierVertex(petalSize/2 * 1.5, petalSize * 1.5, 0, petalSize/2, -petalSize/2 * 1.5, 0);
    endShape(CLOSE);
    pop();
  }
}
