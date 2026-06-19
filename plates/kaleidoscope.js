let plateRadius = 300;
let numSides = 6;
let rotationSpeed = 5;
let numElements = 15;
let angleOffset = 0;
let isPaused = false;
let colors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  for (let i = 0; i < 100; i++) {
    colors.push(color(random(200, 255), random(100, 200), random(150, 255)));
  }
  document.getElementById('clear-plate')?.addEventListener('click', restart);
  document.getElementById('sides-slider')?.addEventListener('input', e => numSides = parseInt(e.target.value));
  document.getElementById('speed-slider')?.addEventListener('input', e => rotationSpeed = parseInt(e.target.value));
  document.getElementById('elements-slider')?.addEventListener('input', e => numElements = parseInt(e.target.value));
}

function restart() {
  angleOffset = 0;
  colors = [];
  for (let i = 0; i < 100; i++) {
    colors.push(color(random(200, 255), random(100, 200), random(150, 255)));
  }
}

function draw() {
  if (isPaused) return;
  background(0);
  const cx = width / 2;
  const cy = height / 2;
  angleOffset += rotationSpeed * 0.05;

  noFill();
  stroke(255);
  strokeWeight(4);
  ellipse(cx, cy, plateRadius * 2 + 10, plateRadius * 2 + 10);

  fill(0);
  noStroke();
  ellipse(cx, cy, plateRadius * 2, plateRadius * 2);

  push();
  translate(cx, cy);

  const symmetryAngle = 360 / numSides;
  for (let s = 0; s < numSides; s++) {
    push();
    rotate(s * symmetryAngle + angleOffset);

    for (let ring = 1; ring <= 4; ring++) {
      const radius = plateRadius * ring / 5;
      const ringElems = numElements * ring;
      for (let i = 0; i < ringElems; i++) {
        const angle = (i / ringElems) * 360;
        const pos = polarToCartesian(radius, angle);
        push();
        translate(pos.x, pos.y);
        rotate(angle + angleOffset * 2);
        const size = map(ring, 1, 4, 40, 15);
        const col = colors[i % colors.length];
        fill(col);
        noStroke();
        if (ring % 4 === 1) drawTriangle(size);
        else if (ring % 4 === 2) drawSquare(size);
        else if (ring % 4 === 3) drawHexagon(size);
        else ellipse(0, 0, size, size);
        pop();
      }
    }

    for (let ring = 1; ring < 4; ring++) {
      const outerR = plateRadius * (ring + 1) / 5;
      const innerR = plateRadius * ring / 5;
      for (let i = 0; i < numElements; i++) {
        const a1 = (i / numElements) * 360;
        const a2 = ((i + 1) % numElements / numElements) * 360;
        const p1 = polarToCartesian(innerR, a1);
        const p2 = polarToCartesian(outerR, a2);
        stroke(colors[i % colors.length]);
        strokeWeight(1);
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }
    pop();
  }
  pop();

  noFill();
  stroke(255);
  strokeWeight(4);
  ellipse(cx, cy, plateRadius * 2 + 10, plateRadius * 2 + 10);
}

function polarToCartesian(r, a) {
  return createVector(r * cos(a), r * sin(a));
}

function drawTriangle(s) {
  beginShape();
  vertex(s * 0.5, -s * sqrt(3) / 6);
  vertex(0, s * sqrt(3) / 3);
  vertex(-s * 0.5, -s * sqrt(3) / 6);
  endShape(CLOSE);
}

function drawSquare(s) {
  rectMode(CENTER);
  rect(0, 0, s, s);
}

function drawHexagon(s) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    const a = i * 60;
    vertex(s * cos(a), s * sin(a));
  }
  endShape(CLOSE);
}

function keyPressed() {
  if (key === ' ') isPaused = !isPaused;
  else if (key === 'r' || key === 'R') restart();
  else if (key === 's' || key === 'S') saveCanvas('kaleidoscope_plate', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
