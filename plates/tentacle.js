/**
 * Tentacle Growth Plate
 * Multiple tentacle arms growing from center with smooth segment chains.
 * Features: growth with randomness, branching, segment wiggle.
 */

let tentacles = [];
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;

let config = {
  tentacleCount: 8,
  maxSegments: 50,
  segmentLength: 20,
  growthSpeed: 1,
  branchChance: 5,
  wiggleAmount: 0.5,
  branchInterval: 2000,
  growthInterval: 80,
  colors: [
    [255,100,200],[100,200,255],[200,255,100],[255,150,50],
    [150,255,150],[255,100,100],[100,255,255],[255,200,100],
    [100,100,255],[200,100,255],[50,200,100],[255,50,200]
  ]
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  restartTentacles();
  setupUI();
}

function setupUI() {
  document.getElementById('tentacle-count').textContent = config.tentacleCount;
  document.getElementById('tentacle-num').addEventListener('input', e => {
    config.tentacleCount = parseInt(e.target.value);
    document.getElementById('tentacle-count').textContent = config.tentacleCount;
  });
  document.getElementById('growth-speed').addEventListener('input', e =>
    config.growthSpeed = parseFloat(e.target.value));
  document.getElementById('branch-chance').addEventListener('input', e =>
    config.branchChance = parseInt(e.target.value));
  document.getElementById('wiggle-amount').addEventListener('input', e =>
    config.wiggleAmount = parseFloat(e.target.value));
  document.getElementById('segment-length').addEventListener('input', e =>
    config.segmentLength = parseInt(e.target.value));
  document.getElementById('restart-btn').addEventListener('click', restartTentacles);
  document.getElementById('clear-btn').addEventListener('click', () => tentacles = []);
}

function restartTentacles() {
  tentacles = [];
  let center = createVector(width/2, height/2);
  for (let i = 0; i < config.tentacleCount; i++) {
    let angle = i * (360 / config.tentacleCount);
    let col = config.colors[i % config.colors.length];
    tentacles.push(new Tentacle(center, angle, color(col[0], col[1], col[2])));
  }
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    let avgSegments = tentacles.reduce((s,t) => s + t.segments.length, 0) / max(1, tentacles.length);
    document.getElementById('segment-count').textContent = round(avgSegments);
  }
  if (isPaused) { drawStatic(); return; }

  background(0);
  drawPetriDish();

  for (let i = tentacles.length-1; i >= 0; i--) {
    tentacles[i].update();
    tentacles[i].display();
  }
}

function drawStatic() {
  background(0);
  drawPetriDish();
  for (let t of tentacles) t.display();
}

function drawPetriDish() {
  noFill();
  stroke(80,80,100,150); strokeWeight(8);
  ellipse(width/2, height/2, plateRadius*2+20, plateRadius*2+20);
  stroke(100,120,140,150); strokeWeight(4);
  ellipse(width/2, height/2, plateRadius*2+10, plateRadius*2+10);
  fill(15,20,25,255); noStroke();
  ellipse(width/2, height/2, plateRadius*2, plateRadius*2);
}

function mousePressed() {
  let d = dist(mouseX, mouseY, width/2, height/2);
  if (d <= plateRadius) {
    let pos = createVector(mouseX, mouseY);
    let col = config.colors[floor(random(config.colors.length))];
    tentacles.push(new Tentacle(pos, random(360), color(col[0], col[1], col[2])));
    config.tentacleCount = tentacles.length;
    document.getElementById('tentacle-count').textContent = config.tentacleCount;
  }
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') restartTentacles();
  else if (key === 'c' || key === 'C') tentacles = [];
  else if (key === 's' || key === 'S')
    saveCanvas('tentacle_'+year()+month()+day()+'_'+hour()+minute()+second(), 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Tentacle {
  constructor(root, initialAngle, tentacleColor) {
    this.root = root.copy();
    this.initialAngle = initialAngle;
    this.color = tentacleColor;
    this.segments = [];
    this.growthTimer = 0;
    this.branchTimer = 0;
    this.wigglePhase = random(360);
    this.addSegment();
  }

  addSegment() {
    let last = this.segments[this.segments.length-1];
    let startPos = last ? last.end.copy() : this.root.copy();
    let angle = last ? last.getAngle() + random(-15, 15) : this.initialAngle + random(-5, 5);
    let endPos = createVector(
      startPos.x + cos(angle) * config.segmentLength,
      startPos.y + sin(angle) * config.segmentLength
    );
    this.segments.push(new Segment(startPos, endPos));
  }

  branch() {
    if (this.segments.length < 3) return;
    let branchIdx = floor(random(2, this.segments.length-1));
    let branchPoint = this.segments[branchIdx].end.copy();
    let segAngle = this.segments[branchIdx].getAngle();
    let branchAngle = segAngle + random([-60, 60]);
    let branchColor = color(
      red(this.color)*0.8+random(50),
      green(this.color)*0.8+random(50),
      blue(this.color)*0.8+random(50)
    );
    let branch = new Tentacle(branchPoint, branchAngle, branchColor);
    branch.segments = [];
    branch.addSegment();
    tentacles.push(branch);
    config.tentacleCount = tentacles.length;
    document.getElementById('tentacle-count').textContent = config.tentacleCount;
  }

  update() {
    this.growthTimer += deltaTime;
    this.branchTimer += deltaTime;

    if (this.segments.length < config.maxSegments &&
        this.growthTimer >= config.growthInterval/config.growthSpeed) {
      this.growthTimer = 0;
      this.addSegment();
    }

    if (this.segments.length >= 5 && this.branchTimer >= config.branchInterval &&
        random(100) < config.branchChance) {
      this.branchTimer = 0;
      this.branch();
    }

    this.wigglePhase += 0.5 * config.growthSpeed;
    for (let i = this.segments.length-1; i >= 0; i--) {
      let wf = (i/this.segments.length) * config.wiggleAmount;
      this.segments[i].wiggle(wf, this.wigglePhase + i*10);
    }

    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i].follow(this.segments[i-1].end.copy(), 0.5);
    }

    for (let s of this.segments) s.constrainToPlate();
  }

  display() {
    noFill();
    for (let i = 0; i < this.segments.length; i++) {
      let alpha = map(i, 0, this.segments.length-1, 255, 100);
      let segCol = color(red(this.color), green(this.color), blue(this.color), alpha);
      let weight = map(i, 0, this.segments.length-1, 3, 0.5);
      stroke(segCol); strokeWeight(weight);
      this.segments[i].display();
    }
    if (this.segments.length > 0) {
      let tip = this.segments[this.segments.length-1].end;
      fill(this.color); noStroke();
      ellipse(tip.x, tip.y, 5, 5);
      for (let i = 1; i <= 3; i++) {
        fill(red(this.color), green(this.color), blue(this.color), 100/(i*i));
        ellipse(tip.x, tip.y, 5*i*2, 5*i*2);
      }
    }
  }
}

class Segment {
  constructor(start, end) {
    this.start = start.copy();
    this.end = end.copy();
    this.originalLength = p5.Vector.dist(start, end);
    this.noiseOffset = random(1000);
  }

  getAngle() { return atan2(this.end.y-this.start.y, this.end.x-this.start.x); }
  getLength() { return p5.Vector.dist(this.start, this.end); }

  wiggle(amount, phase) {
    if (amount <= 0) return;
    let noiseVal = noise(frameCount*0.01 + phase*0.01 + this.noiseOffset)*2-1;
    let wiggleAngle = noiseVal * amount * 30;
    let center = p5.Vector.add(this.start, this.end).mult(0.5);
    let currentAngle = this.getAngle();
    this.end = createVector(
      center.x + cos(currentAngle + wiggleAngle) * this.originalLength * 0.5,
      center.y + sin(currentAngle + wiggleAngle) * this.originalLength * 0.5
    );
  }

  follow(target, factor) {
    let dir = p5.Vector.sub(target, this.start);
    if (dir.mag() > 0) {
      dir.normalize();
      this.end = p5.Vector.lerp(this.end,
        p5.Vector.add(this.start, dir.mult(this.originalLength)), factor);
    }
  }

  constrainToPlate() {
    let center = createVector(width/2, height/2);
    if (this.end.dist(center) > plateRadius)
      this.end = p5.Vector.lerp(center, this.end, plateRadius/this.end.dist(center));
    if (this.start.dist(center) > plateRadius)
      this.start = p5.Vector.lerp(center, this.start, plateRadius/this.start.dist(center));
  }

  display() { line(this.start.x, this.start.y, this.end.x, this.end.y); }
}
