/**
 * Chromatic Reaction Plate - Color-based particle interactions
 */

let particles = [];
let plateRadius = 300;
let numParticles = 150;
let isPaused = false;
let interactionMode = 'merge';
let similarityThreshold = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 1);

  // Create particles within plate
  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    let hue = random(360);
    particles.push(new Particle(x, y, random(4, 12), hue, 100, 100, 0.8));
  }

  background(0);
  setupUI();
}

function setupUI() {
  let particleCount = document.getElementById('particle-count');
  let modeSelect = document.getElementById('mode-select');
  let threshSlider = document.getElementById('similarity-thresh');
  let restartBtn = document.getElementById('restart-btn');

  if (particleCount) particleCount.textContent = particles.length;

  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      interactionMode = modeSelect.value;
    });
  }

  if (threshSlider) {
    threshSlider.addEventListener('input', () => {
      similarityThreshold = parseInt(threshSlider.value);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', restartSimulation);
  }
}

function updateParticleCount() {
  let particleCount = document.getElementById('particle-count');
  if (particleCount) particleCount.textContent = particles.length;
}

function restartSimulation() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    let hue = random(360);
    particles.push(new Particle(x, y, random(4, 12), hue, 100, 100, 0.8));
  }
  updateParticleCount();
}

function draw() {
  if (isPaused) return;

  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);

  // Draw plate fill (white circle)
  fill(0, 0, 100, 30);
  noStroke();
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  // Update and display particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }

  // Check interactions between particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].interact(particles[j]);
    }
  }
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= plateRadius) {
    for (let i = 0; i < 20; i++) {
      let angle = random(360);
      let distance = random(15);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      if (dist(x, y, width/2, height/2) <= plateRadius) {
        particles.push(new Particle(x, y, random(4, 12), random(360), 100, 100, 0.8));
      }
    }
    updateParticleCount();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    restartSimulation();
  } else if (key === 's' || key === 'S') {
    saveCanvas('chromatic_plate', 'png');
  } else if (key === 'c' || key === 'C') {
    particles = [];
    updateParticleCount();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor(x, y, r, hue, saturation, brightness, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
    this.speed = speed;
    this.heading = random(360);
    this.velocity = createVector(0, 0);
  }

  update() {
    // Random movement with some persistence
    this.heading += random(-15, 15);
    this.velocity.set(cos(this.heading) * this.speed, sin(this.heading) * this.speed);
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Constrain to plate
    this.constrainToPlate();
  }

  constrainToPlate() {
    let distFromCenter = dist(this.x, this.y, width / 2, height / 2);
    if (distFromCenter > plateRadius - this.r) {
      let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
      this.heading = angleToCenter + 180 + random(-45, 45);
      this.x = width / 2 + cos(angleToCenter) * (plateRadius - this.r - 1);
      this.y = height / 2 + sin(angleToCenter) * (plateRadius - this.r - 1);
    }
  }

  display() {
    noStroke();
    fill(this.hue, this.saturation, this.brightness);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);

    // Add glow effect
    fill(this.hue, this.saturation, this.brightness, 0.3);
    ellipse(this.x, this.y, this.r * 3, this.r * 3);
  }

  interact(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    let minDist = this.r + other.r;

    if (d < minDist * 2) {
      // Calculate color similarity (HSB distance)
      let hueDiff = abs(this.hue - other.hue);
      let hueSimilarity = 1 - min(hueDiff / 180, 1);
      let satDiff = abs(this.saturation - other.saturation);
      let satSimilarity = 1 - satDiff / 100;
      let brightnessDiff = abs(this.brightness - other.brightness);
      let brightSimilarity = 1 - brightnessDiff / 100;

      let colorSimilarity = (hueSimilarity * 0.6 + satSimilarity * 0.2 + brightSimilarity * 0.2) * 100;

      // Apply interaction based on mode and similarity
      if (d < minDist) {
        // Collision - always push apart slightly
        let pushForce = 0.5;
        let angle = atan2(this.y - other.y, this.x - other.x);
        this.x += cos(angle) * pushForce;
        this.y += sin(angle) * pushForce;
        other.x -= cos(angle) * pushForce;
        other.y -= sin(angle) * pushForce;
      }

      if (interactionMode === 'merge' && colorSimilarity > similarityThreshold) {
        // Similar colors merge (move toward each other)
        this.mergeToward(other);
      } else if (interactionMode === 'compete' && colorSimilarity > similarityThreshold) {
        // Similar colors compete (larger wins)
        this.competeWith(other);
      } else if (interactionMode === 'avoid' && colorSimilarity > similarityThreshold) {
        // Similar colors avoid each other
        this.avoid(other);
      } else if (interactionMode === 'avoid' && colorSimilarity <= similarityThreshold) {
        // Different colors attract
        this.mergeToward(other);
      }
    }
  }

  mergeToward(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d > 1) {
      let mergeSpeed = map(d, 0, 100, 0.3, 0.05);
      let angle = atan2(other.y - this.y, other.x - this.x);
      this.x += cos(angle) * mergeSpeed;
      this.y += sin(angle) * mergeSpeed;
      other.x -= cos(angle) * mergeSpeed;
      other.y -= sin(angle) * mergeSpeed;
    }

    // Blend colors slightly
    let newHue = lerp(this.hue, other.hue, 0.05);
    this.hue = newHue;
    other.hue = newHue;
  }

  competeWith(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d > 1) {
      if (this.r > other.r) {
        // This particle is larger, push other away
        let angle = atan2(other.y - this.y, other.x - this.x);
        other.x += cos(angle) * 0.5;
        other.y += sin(angle) * 0.5;
        // This grows slightly
        this.r = min(this.r + 0.1, 20);
      } else if (other.r > this.r) {
        // Other is larger, push this away
        let angle = atan2(this.y - other.y, this.x - other.x);
        this.x += cos(angle) * 0.5;
        this.y += sin(angle) * 0.5;
        // Other grows slightly
        other.r = min(other.r + 0.1, 20);
      } else {
        // Same size, push both away
        let angle = atan2(other.y - this.y, other.x - this.x);
        this.x += cos(angle) * 0.5;
        this.y += sin(angle) * 0.5;
        other.x -= cos(angle) * 0.5;
        other.y -= sin(angle) * 0.5;
      }
    }
  }

  avoid(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d > 1) {
      let avoidSpeed = map(d, 0, 100, 1.0, 0.2);
      let angle = atan2(other.y - this.y, other.x - this.x);
      this.x -= cos(angle) * avoidSpeed;
      this.y -= sin(angle) * avoidSpeed;
      other.x += cos(angle) * avoidSpeed;
      other.y += sin(angle) * avoidSpeed;
    }
  }
}
