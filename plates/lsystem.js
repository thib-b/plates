/**
 * L-System Plant Plate
 * Lindenmayer system for generating plant/branching structures
 */

let lsystem;
let plateRadius = 300;
let currentPreset = 'tree';
let targetIterations = 6;
let stepSize = 10;
let angleDeg = 25;
let branchAngle = 20;
let currentIteration = 0;
let frameCountForIteration = 0;
let framesPerIteration = 30;
const MAX_STRING_LENGTH = 50000;

const presets = {
  tree: {
    axiom: 'F',
    rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' },
    angle: 25,
    branchAngle: 20,
    step: 10
  },
  dragon: {
    axiom: 'FX',
    rules: { 'X': 'X+YF+', 'Y': '-FX-Y' },
    angle: 90,
    branchAngle: 0,
    step: 8
  },
  koch: {
    axiom: 'F',
    rules: { 'F': 'F-F++F-F' },
    angle: 60,
    branchAngle: 0,
    step: 5
  },
  bush: {
    axiom: 'X',
    rules: { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' },
    angle: 22.5,
    branchAngle: 22.5,
    step: 8
  },
  fern: {
    axiom: 'X',
    rules: { 'X': 'F-[[X]+X]+F[+FX]-X', 'F': 'FF' },
    angle: 25,
    branchAngle: 25,
    step: 7
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  setupUI();
  restartSimulation();
  background(0);
}

function setupUI() {
  document.getElementById('preset-select')?.addEventListener('change', (e) => {
    currentPreset = e.target.value;
    const p = presets[currentPreset];
    angleDeg = p.angle;
    branchAngle = p.branchAngle;
    stepSize = p.step;
    document.getElementById('angle').value = angleDeg;
    document.getElementById('branch-angle').value = branchAngle;
    document.getElementById('step-size').value = stepSize;
    restartSimulation();
  });

  document.getElementById('iterations')?.addEventListener('input', (e) => {
    targetIterations = parseInt(e.target.value);
    restartSimulation();
  });

  document.getElementById('step-size')?.addEventListener('input', (e) => {
    stepSize = parseInt(e.target.value);
    restartSimulation();
  });

  document.getElementById('angle')?.addEventListener('input', (e) => {
    angleDeg = parseInt(e.target.value);
    restartSimulation();
  });

  document.getElementById('branch-angle')?.addEventListener('input', (e) => {
    branchAngle = parseInt(e.target.value);
    restartSimulation();
  });

  document.getElementById('restart')?.addEventListener('click', restartSimulation);

  document.getElementById('randomize')?.addEventListener('click', () => {
    const keys = Object.keys(presets);
    currentPreset = keys[Math.floor(Math.random() * keys.length)];
    const p = presets[currentPreset];
    targetIterations = Math.floor(Math.random() * 8) + 4;
    stepSize = Math.floor(Math.random() * 40) + 5;
    angleDeg = Math.floor(Math.random() * 120) + 15;
    branchAngle = Math.floor(Math.random() * 60) + 10;
    document.getElementById('preset-select').value = currentPreset;
    document.getElementById('iterations').value = targetIterations;
    document.getElementById('step-size').value = stepSize;
    document.getElementById('angle').value = angleDeg;
    document.getElementById('branch-angle').value = branchAngle;
    restartSimulation();
  });
}

function restartSimulation() {
  const p = presets[currentPreset];
  lsystem = new LSystem(p.axiom, p.rules, targetIterations, stepSize, angleDeg, branchAngle);
  currentIteration = 0;
  frameCountForIteration = 0;
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);

  // Draw plate fill
  noStroke();
  fill(255, 255, 255, 30);
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);

  if (lsystem) {
    frameCountForIteration++;
    if (frameCountForIteration >= framesPerIteration && currentIteration < targetIterations) {
      currentIteration++;
      frameCountForIteration = 0;
    }

    push();
    translate(width / 2, height / 2);
    lsystem.render(currentIteration);
    pop();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') restartSimulation();
  else if (key === 's' || key === 'S') saveCanvas('lsystem_plate', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class LSystem {
  constructor(axiom, rules, maxIterations, stepSize, angle, branchAngle) {
    this.axiom = axiom;
    this.rules = rules;
    this.maxIterations = maxIterations;
    this.stepSize = stepSize;
    this.angle = angle;
    this.branchAngle = branchAngle;
    this.strings = [axiom];
    this.precomputeAll();
  }

  precomputeAll() {
    let current = this.axiom;
    for (let i = 1; i <= this.maxIterations; i++) {
      let next = '';
      for (let j = 0; j < current.length; j++) {
        const char = current[j];
        next += this.rules[char] || char;
      }
      // Stop precomputing if string gets too long
      if (next.length > MAX_STRING_LENGTH) {
        this.strings[i] = current; // Keep previous iteration
        this.maxIterations = i - 1; // Reduce max iterations
        break;
      }
      this.strings[i] = next;
      current = next;
    }
  }

  getStringAtIteration(iter) {
    return this.strings[Math.min(iter, this.maxIterations)] || this.axiom;
  }

  render(iteration) {
    const currentString = this.getStringAtIteration(iteration);
    
    // Calculate scale based on current string length to fit within plate
    const maxSteps = currentString.length * this.stepSize * 0.5;
    const scaleFactor = Math.min(1, plateRadius * 0.85 / maxSteps);
    const scaledStep = this.stepSize * scaleFactor;

    stroke(255);
    strokeWeight(max(0.5, 1.5 * scaleFactor));
    noFill();

    let x = 0, y = 0, currentAngle = -90;
    let stack = [];

    for (let i = 0; i < currentString.length; i++) {
      const char = currentString[i];

      if (char === 'F') {
        const nx = x + cos(currentAngle) * scaledStep;
        const ny = y + sin(currentAngle) * scaledStep;
        const distFromCenter = Math.sqrt(nx * nx + ny * ny);
        if (distFromCenter <= plateRadius * 0.95) {
          line(x, y, nx, ny);
          x = nx;
          y = ny;
        }
      } else if (char === 'G') {
        x += cos(currentAngle) * scaledStep;
        y += sin(currentAngle) * scaledStep;
      } else if (char === '+') {
        currentAngle += this.angle;
      } else if (char === '-') {
        currentAngle -= this.angle;
      } else if (char === '[') {
        stack.push({ x, y, angle: currentAngle });
      } else if (char === ']') {
        if (stack.length > 0) {
          const saved = stack.pop();
          x = saved.x;
          y = saved.y;
          currentAngle = saved.angle;
        }
      }

      // Clamp to plate boundary
      const dist = Math.sqrt(x * x + y * y);
      if (dist > plateRadius * 0.95) {
        const clampedDist = plateRadius * 0.95;
        x = (x / dist) * clampedDist;
        y = (y / dist) * clampedDist;
      }
    }

    // Display current iteration
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(`Iteration: ${iteration}/${this.maxIterations}`, -width/2 + 20, -height/2 + 20);
  }
}
