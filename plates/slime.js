/**
 * Slime Mold Plate - exact reference behavior within a circular plate
 * Based on: https://openprocessing.org/@u429398/2213463
 */

let m = [];
let plateRadius = 300;
let numMolds = 2000;
let d;
let isPaused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  d = pixelDensity();

  // Create molds within plate
  for (let i = 0; i < numMolds; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    m[i] = new Mold(x, y, 3, random(360), 45, 10, 1);
  }

  background(0);
  setupUI();
}

function setupUI() {
  let popCount = document.getElementById('pop-count');
  let clearBtn = document.getElementById('clear-plate');
  let randomizeBtn = document.getElementById('randomize');
  
  if (popCount) popCount.textContent = m.length;
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      m = [];
      for (let i = 0; i < numMolds; i++) {
        let angle = random(360);
        let distance = random(plateRadius * 0.8);
        let x = width / 2 + cos(angle) * distance;
        let y = height / 2 + sin(angle) * distance;
        m[i] = new Mold(x, y, 3, random(360), 45, 10, 1);
      }
      if (popCount) popCount.textContent = m.length;
    });
  }
  
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      for (let i = 0; i < m.length; i++) {
        let angle = random(360);
        let distance = random(plateRadius * 0.8);
        m[i].x = width / 2 + cos(angle) * distance;
        m[i].y = height / 2 + sin(angle) * distance;
        m[i].heading = random(360);
      }
    });
  }
}

function updatePopulationCount() {
  let popCount = document.getElementById('pop-count');
  if (popCount) popCount.textContent = m.length;
}

function draw() {
  if (isPaused) return;
  
  background(0, 5);
  
  loadPixels();

  for (let i = 0; i < m.length; i++) {
    m[i].update();
    m[i].display();
  }

  // Draw plate boundary on top
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= plateRadius) {
    for (let i = 0; i < 100; i++) {
      let angle = random(360);
      let distance = random(20);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      if (dist(x, y, width/2, height/2) <= plateRadius) {
        m.push(new Mold(x, y, 3, random(360), 45, 10, 1));
      }
    }
    updatePopulationCount();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    m = [];
    for (let i = 0; i < numMolds; i++) {
      let angle = random(360);
      let distance = random(plateRadius * 0.8);
      let x = width / 2 + cos(angle) * distance;
      let y = height / 2 + sin(angle) * distance;
      m[i] = new Mold(x, y, 3, random(360), 45, 10, 1);
    }
    updatePopulationCount();
  } else if (key === 's' || key === 'S') {
    saveCanvas('slime_plate', 'png');
  } else if (key === 'c' || key === 'C') {
    m = [];
    updatePopulationCount();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Mold {
  constructor(x, y, r, heading, sensorAngle, sensorDistance, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
    this.heading = heading;
    
    this.left = new Sensor(this, -sensorAngle, sensorDistance);
    this.front = new Sensor(this, 0, sensorDistance);
    this.right = new Sensor(this, sensorAngle, sensorDistance);
  }

  update() {
    let l = this.left.detection();
    let f = this.front.detection();
    let r = this.right.detection();

    if (f > l && f > r) this.heading += 0;
    else {
      if (l > r) this.heading += this.left.angle;
      else if (r > l) this.heading += this.right.angle;
      else this.heading += 0;
    }

    this.x += cos(this.heading) * this.speed;
    this.y += sin(this.heading) * this.speed;

    // Constrain to plate
    this.constrainToPlate();

    this.left.update();
    this.front.update();
    this.right.update();
  }

  constrainToPlate() {
    let distFromCenter = dist(this.x, this.y, width / 2, height / 2);
    if (distFromCenter > plateRadius) {
      let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
      this.heading = angleToCenter + 180 + random(-30, 30);
      this.x = width / 2 + cos(angleToCenter) * (plateRadius - this.r);
      this.y = height / 2 + sin(angleToCenter) * (plateRadius - this.r);
    }
  }

  display() {
    noStroke();
    fill(255, 255, 255);
    ellipse(this.x, this.y, 2 * this.r, 2 * this.r);
  }
}

class Sensor {
  constructor(m, angle, distance) {
    this.x = m.x + cos(angle) * distance * m.r;
    this.y = m.y + sin(angle) * distance * m.r;
    this.m = m;
    this.angle = angle;
    this.distance = distance;
  }

  detection() {
    let i = 4 * d * floor(this.y) * d * width + 4 * d * floor(this.x);
    return pixels[i] + pixels[i + 1] + pixels[i + 2] + pixels[i + 3];
  }

  update() {
    this.x = this.m.x + cos(this.m.heading + this.angle) * this.distance * this.m.r;
    this.y = this.m.y + sin(this.m.heading + this.angle) * this.distance * this.m.r;
  }
}
