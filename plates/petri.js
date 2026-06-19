/**
 * Petri Dish - Color-Based Organism Growth
 * 
 * Random individual points appear, each with unique color (colony).
 * Organisms grow by spawning adjacent points.
 * Interaction based on color similarity:
 * - Close colors: merge
 * - Very different: compete (overwrite)
 * - Somewhat different: avoid
 */

let organisms = [];
let plateRadius = 300;
let isPaused = false;
let lastFrameTime = 0;
let fps = 0;

// Configuration
let config = {
  plateRadius: 300,
  organismSize: 3,
  spawnRate: 0.02,        // Probability of new organism spawning per frame
  reproduceRate: 0.01,   // Probability an organism spawns a neighbor
  reproduceDistance: 8, // Max distance for reproduction
  colorThresholdMerge: 50,    // Color distance for merging (0-441)
  colorThresholdAvoid: 120,   // Color distance for avoiding
  // color distance > colorThresholdAvoid means compete
};

// Colors
let colors = {
  background: [10, 10, 20, 255],
  plateEdge: [80, 80, 100, 150],
  agar: [15, 20, 25, 255]
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  frameRate(60);
  setupUI();
}

function setupUI() {
  document.getElementById('pop-count').textContent = organisms.length;
  
  document.getElementById('add-organism').addEventListener('click', () => {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    spawnOrganism(x, y);
    updatePopulationCount();
  });
  
  document.getElementById('clear-plate').addEventListener('click', () => {
    organisms = [];
    updatePopulationCount();
  });
  
  document.getElementById('randomize').addEventListener('click', () => {
    organisms = [];
    for (let i = 0; i < 5; i++) {
      let angle = random(360);
      let distance = random(plateRadius * 0.8);
      let x = width / 2 + cos(angle) * distance;
      let y = height / 2 + sin(angle) * distance;
      spawnOrganism(x, y);
    }
    updatePopulationCount();
  });
  
  document.getElementById('spawn-rate').addEventListener('input', (e) => {
    config.spawnRate = parseFloat(e.target.value);
  });
  
  document.getElementById('reproduce-rate').addEventListener('input', (e) => {
    config.reproduceRate = parseFloat(e.target.value);
  });
  
  document.getElementById('merge-threshold').addEventListener('input', (e) => {
    config.colorThresholdMerge = parseInt(e.target.value);
  });
  
  document.getElementById('avoid-threshold').addEventListener('input', (e) => {
    config.colorThresholdAvoid = parseInt(e.target.value);
  });
  
  document.getElementById('plate-radius').addEventListener('input', (e) => {
    plateRadius = parseInt(e.target.value);
    config.plateRadius = plateRadius;
  });
}

function updatePopulationCount() {
  document.getElementById('pop-count').textContent = organisms.length;
}

function draw() {
  if (frameCount % 10 === 0) {
    let currentTime = millis();
    fps = 10000 / (currentTime - lastFrameTime);
    lastFrameTime = currentTime;
    document.getElementById('fps').textContent = Math.round(fps);
  }
  
  if (isPaused) return;
  
  background(colors.background);
  drawPetriDish();
  
  // Draw all organisms
  for (let org of organisms) {
    org.display();
  }
  
  // Update organisms (reproduction happens in update)
  for (let i = organisms.length - 1; i >= 0; i--) {
    organisms[i].update();
  }
  
  // Spawn new organisms randomly
  if (random() < config.spawnRate) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    spawnOrganism(x, y);
    updatePopulationCount();
  }
}

function drawPetriDish() {
  noFill();
  
  stroke(colors.plateEdge);
  strokeWeight(8);
  ellipse(width / 2, height / 2, plateRadius * 2 + 20, plateRadius * 2 + 20);
  
  stroke(100, 120, 140, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
  
  fill(colors.agar);
  noStroke();
  ellipse(width / 2, height / 2, plateRadius * 2, plateRadius * 2);
}

function spawnOrganism(x, y) {
  let d = dist(x, y, width/2, height/2);
  if (d > plateRadius) return null;
  
  // Create a new organism with a new colony color
  let newOrg = new Organism(x, y);
  organisms.push(newOrg);
  return newOrg;
}

function mousePressed() {
  let d = dist(mouseX, mouseY, width / 2, height / 2);
  if (d <= plateRadius) {
    spawnOrganism(mouseX, mouseY);
    updatePopulationCount();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    organisms = [];
    updatePopulationCount();
  } else if (key === 's' || key === 'S') {
    saveCanvas('petri_dish_' + year() + month() + day() + '_' + hour() + minute() + second(), 'png');
  } else if (key === 'c' || key === 'C') {
    organisms = [];
    updatePopulationCount();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Organism - static point that reproduces locally
class Organism {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = config.organismSize;
    // Each new organism that's a colony starter gets a new color
    this.colonyColor = color(random(150, 255), random(100, 255), random(150, 255));
    this.age = 0;
  }
  
  update() {
    this.age++;
    
    // Try to reproduce
    if (random() < config.reproduceRate) {
      this.reproduce();
    }
  }
  
  reproduce() {
    // Try to spawn in a random direction
    let angle = random(360);
    let distance = random(5, config.reproduceDistance);
    let nx = this.x + cos(angle) * distance;
    let ny = this.y + sin(angle) * distance;
    
    // Check if within plate
    let d = dist(nx, ny, width/2, height/2);
    if (d > plateRadius) return;
    
    // Check for nearby organisms at the spawn position
    let interaction = this.checkPosition(nx, ny);
    
    if (interaction === 'compete') {
      // Overwrite nearby organisms with our color
      this.overwriteNearby(nx, ny);
    } else if (interaction === 'avoid') {
      // Don't spawn here, but maybe try a different direction?
      // For now, just skip
      return;
    }
    // For merge and no interaction, spawn new organism with same colony color
    spawnOrganismWithColor(nx, ny, this.colonyColor);
  }
  
  checkPosition(x, y) {
    // Check for organisms near this position
    for (let other of organisms) {
      if (other === this) continue;
      
      if (dist(x, y, other.x, other.y) < 10) {
        // Close enough to interact
        let colorDist = colorDistance(this.colonyColor, other.colonyColor);
        
        if (colorDist < config.colorThresholdMerge) {
          return 'merge';
        } else if (colorDist < config.colorThresholdAvoid) {
          return 'avoid';
        } else {
          return 'compete';
        }
      }
    }
    return null; // No interaction
  }
  
  overwriteNearby(x, y) {
    // Change nearby organisms to our color
    for (let other of organisms) {
      if (other === this) continue;
      
      if (dist(x, y, other.x, other.y) < 15) {
        other.colonyColor = this.colonyColor;
      }
    }
  }
  
  display() {
    noStroke();
    fill(this.colonyColor);
    ellipse(this.x, this.y, this.size, this.size);
    
    // Slight glow
    fill(red(this.colonyColor), green(this.colonyColor), blue(this.colonyColor), 100);
    ellipse(this.x, this.y, this.size * 2.5, this.size * 2.5);
  }
}

// Spawn organism with specific color (for when inheriting colony color)
function spawnOrganismWithColor(x, y, col) {
  let d = dist(x, y, width/2, height/2);
  if (d > plateRadius) return null;
  
  let newOrg = new Organism(x, y);
  newOrg.colonyColor = col;
  organisms.push(newOrg);
  updatePopulationCount();
  return newOrg;
}

// Helper: calculate color distance (Euclidean in RGB space)
function colorDistance(c1, c2) {
  let r1 = red(c1), g1 = green(c1), b1 = blue(c1);
  let r2 = red(c2), g2 = green(c2), b2 = blue(c2);
  
  let dr = r1 - r2;
  let dg = g1 - g2;
  let db = b1 - b2;
  
  return sqrt(dr*dr + dg*dg + db*db);
}
