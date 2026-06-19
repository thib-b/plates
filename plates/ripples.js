/**
 * Water Ripples Plate
 * Wave simulation with ripple effects
 */

const PLATE_RADIUS = 300;
let ripples = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  
  document.getElementById('restart')?.addEventListener('click', () => {
    ripples = [];
  });
}

function draw() {
  background(0);

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);

  // Draw plate fill (water-like blue)
  noStroke();
  fill(30, 30, 80, 80);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);

  // Update and draw ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    
    r.radius += r.speed;
    r.alpha -= 2;
    
    // Draw ripple
    noFill();
    stroke(100, 200, 255, r.alpha);
    strokeWeight(2);
    ellipse(width / 2 + r.x, height / 2 + r.y, r.radius * 2, r.radius * 2);
    
    // Remove if faded out or too large
    if (r.alpha <= 0 || r.radius > PLATE_RADIUS) {
      ripples.splice(i, 1);
    }
  }
}

function mousePressed() {
  let distFromCenter = dist(mouseX, mouseY, width / 2, height / 2);
  if (distFromCenter <= PLATE_RADIUS) {
    // Add new ripple at mouse position
    ripples.push({
      x: mouseX - width / 2,
      y: mouseY - height / 2,
      radius: 5,
      speed: 2,
      alpha: 200
    });
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    ripples = [];
  } else if (key === 's' || key === 'S') {
    saveCanvas('ripples_plate', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
