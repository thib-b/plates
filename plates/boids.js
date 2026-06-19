/**
 * Flocking Boids Plate
 * Bird-like particles that exhibit emergent flocking behavior
 */

const PLATE_RADIUS = 300;
let boids = [];
let numBoids = 50;
let maxSpeed = 3;
let cohesionFactor = 0.01;
let separationFactor = 0.05;
let alignmentFactor = 0.01;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  // Create initial boids
  for (let i = 0; i < numBoids; i++) {
    boids.push(new Boid());
  }
  
  setupUI();
}

function setupUI() {
  const boidCountSpan = document.getElementById('boid-count');
  const maxSpeedSpan = document.getElementById('max-speed');
  const cohesionSpan = document.getElementById('cohesion');
  const boidCountSlider = document.getElementById('boid-count-slider');
  const maxSpeedSlider = document.getElementById('max-speed-slider');
  const cohesionSlider = document.getElementById('cohesion-slider');
  const restartBtn = document.getElementById('restart');

  if (boidCountSpan) boidCountSpan.textContent = numBoids;
  if (maxSpeedSpan) maxSpeedSpan.textContent = maxSpeed;
  if (cohesionSpan) cohesionSpan.textContent = cohesionFactor.toFixed(2);

  if (boidCountSlider) {
    boidCountSlider.addEventListener('input', (e) => {
      numBoids = parseInt(e.target.value);
      if (boidCountSpan) boidCountSpan.textContent = numBoids;
      boids = [];
      for (let i = 0; i < numBoids; i++) {
        boids.push(new Boid());
      }
    });
  }

  if (maxSpeedSlider) {
    maxSpeedSlider.addEventListener('input', (e) => {
      maxSpeed = parseInt(e.target.value);
      if (maxSpeedSpan) maxSpeedSpan.textContent = maxSpeed;
    });
  }

  if (cohesionSlider) {
    cohesionSlider.addEventListener('input', (e) => {
      cohesionFactor = parseFloat(e.target.value);
      if (cohesionSpan) cohesionSpan.textContent = cohesionFactor.toFixed(2);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      boids = [];
      for (let i = 0; i < numBoids; i++) {
        boids.push(new Boid());
      }
    });
  }
}

function draw() {
  background(0);

  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  for (let boid of boids) {
    boid.update(boids);
    boid.display();
    boid.checkBounds();
  }
}

class Boid {
  constructor() {
    this.position = createVector(
      width / 2 + random(-PLATE_RADIUS * 0.8, PLATE_RADIUS * 0.8),
      height / 2 + random(-PLATE_RADIUS * 0.8, PLATE_RADIUS * 0.8)
    );
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.velocity.limit(maxSpeed);
  }

  update(otherBoids) {
    let v1 = this.separate(otherBoids);
    let v2 = this.align(otherBoids);
    let v3 = this.cohere(otherBoids);

    v1.mult(separationFactor * 10);
    v2.mult(alignmentFactor * 10);
    v3.mult(cohesionFactor * 10);

    this.velocity.add(v1);
    this.velocity.add(v2);
    this.velocity.add(v3);
    this.velocity.limit(maxSpeed);
    
    this.position.add(this.velocity);
  }

  separate(otherBoids) {
    let steering = createVector(0, 0);
    let count = 0;

    for (let other of otherBoids) {
      if (other === this) continue;
      let d = this.position.dist(other.position);
      if (d < 50) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        steering.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steering.div(count);
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxSpeed);
    }

    return steering;
  }

  align(otherBoids) {
    let steering = createVector(0, 0);
    let count = 0;

    for (let other of otherBoids) {
      if (other === this) continue;
      let d = this.position.dist(other.position);
      if (d < 100) {
        steering.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      steering.div(count);
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxSpeed);
    }

    return steering;
  }

  cohere(otherBoids) {
    let steering = createVector(0, 0);
    let count = 0;

    for (let other of otherBoids) {
      if (other === this) continue;
      let d = this.position.dist(other.position);
      if (d < 100) {
        steering.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      steering.div(count);
      steering.sub(this.position);
      steering.setMag(maxSpeed);
      steering.sub(this.velocity);
      steering.limit(maxSpeed);
    }

    return steering;
  }

  checkBounds() {
    let distFromCenter = dist(this.position.x, this.position.y, width / 2, height / 2);
    
    if (distFromCenter > PLATE_RADIUS) {
      let angleToCenter = degrees(atan2(height / 2 - this.position.y, width / 2 - this.position.x));
      this.position.x = width / 2 + cos(angleToCenter) * (PLATE_RADIUS - 1);
      this.position.y = height / 2 + sin(angleToCenter) * (PLATE_RADIUS - 1);
      this.velocity.x *= -0.5;
      this.velocity.y *= -0.5;
    }
  }

  display() {
    noStroke();
    fill(200, 255, 255, 200);
    ellipse(this.position.x, this.position.y, 8, 8);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    boids = [];
    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid());
    }
  } else if (key === 's' || key === 'S') {
    saveCanvas('boids_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
