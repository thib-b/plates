/**
 * Voronoi Plate - Cellular/Voronoi diagram patterns within a circular plate
 */

let points = [];
let plateRadius = 300;
let numPoints = 35;
let sampleStep = 2;
let isPaused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  generatePoints();

  background(0);
  setupUI();
}

function generatePoints() {
  points = [];
  for (let i = 0; i < numPoints; i++) {
    let angle = random(360);
    let distance = random(plateRadius * 0.8);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    points.push({
      x: x,
      y: y,
      vx: random(-0.3, 0.3),
      vy: random(-0.3, 0.3),
      color: color(random(100, 255), random(100, 255), random(100, 255))
    });
  }
}

function draw() {
  if (isPaused) return;

  background(0);

  // Move points
  for (let p of points) {
    p.x += p.vx;
    p.y += p.vy;

    // Bounce off plate boundary
    let d = dist(p.x, p.y, width/2, height/2);
    if (d > plateRadius - 10) {
      let angleToCenter = atan2(height/2 - p.y, width/2 - p.x);
      p.vx = cos(angleToCenter) * 0.3;
      p.vy = sin(angleToCenter) * 0.3;
      p.x = width/2 + cos(angleToCenter) * (plateRadius - 10);
      p.y = height/2 + sin(angleToCenter) * (plateRadius - 10);
    }
  }

  // Draw Voronoi approximation using sampled grid
  let cx = width / 2;
  let cy = height / 2;

  noStroke();
  for (let y = cy - plateRadius; y < cy + plateRadius; y += sampleStep) {
    for (let x = cx - plateRadius; x < cx + plateRadius; x += sampleStep) {
      if (dist(x, y, cx, cy) <= plateRadius) {
        // Find closest point
        let closest = 0;
        let minDist = dist(x, y, points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          let d = dist(x, y, points[i].x, points[i].y);
          if (d < minDist) {
            minDist = d;
            closest = i;
          }
        }

        fill(points[closest].color);
        rect(x, y, sampleStep, sampleStep);
      }
    }
  }

  // Draw plate boundary
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(cx, cy, plateRadius * 2, plateRadius * 2);

  // Draw seed points
  for (let p of points) {
    noStroke();
    fill(0);
    ellipse(p.x, p.y, 8, 8);
    fill(255);
    ellipse(p.x, p.y, 4, 4);
  }
}

function setupUI() {
  let pointCount = document.getElementById('point-count');
  let restartBtn = document.getElementById('restart-btn');

  if (pointCount) pointCount.textContent = numPoints;

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      generatePoints();
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 'r' || key === 'R') {
    generatePoints();
  }
}
