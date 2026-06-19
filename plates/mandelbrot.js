/**
 * Mandelbrot Set Plate
 * Fractal visualization - computes once and displays within circular plate
 */

const PLATE_RADIUS = 300;
let maxIter = 80;
let mandelbrotImg = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  generateMandelbrot();
  
  document.getElementById('restart')?.addEventListener('click', generateMandelbrot);
}

function generateMandelbrot() {
  let img = createGraphics(PLATE_RADIUS * 2, PLATE_RADIUS * 2);
  img.loadPixels();
  
  const w = PLATE_RADIUS * 2;
  const h = PLATE_RADIUS * 2;
  const centerX = PLATE_RADIUS;
  const centerY = PLATE_RADIUS;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Check if pixel is within circular plate
      let dx = x - centerX;
      let dy = y - centerY;
      if (dx * dx + dy * dy > PLATE_RADIUS * PLATE_RADIUS) {
        // Outside circle - set to transparent
        let pix = (x + y * w) * 4;
        img.pixels[pix] = 0;
        img.pixels[pix+1] = 0;
        img.pixels[pix+2] = 0;
        img.pixels[pix+3] = 0;
        continue;
      }
      
      // Map pixel to complex plane (-2.0 to 1.0 in x, -1.5 to 1.5 in y)
      let zx = map(x, 0, w, -2.0, 1.0);
      let zy = map(y, 0, h, -1.5, 1.5);
      
      let a = zx, b = zy;
      let iter = 0;
      
      while (iter < maxIter) {
        let aa = a * a;
        let bb = b * b;
        if (aa + bb > 16) break;
        let twoab = 2.0 * a * b;
        a = aa - bb + zx;
        b = twoab + zy;
        iter++;
      }
      
      let pix = (x + y * w) * 4;
      if (iter === maxIter) {
        img.pixels[pix] = 0;
        img.pixels[pix+1] = 0;
        img.pixels[pix+2] = 50;
        img.pixels[pix+3] = 255;
      } else {
        img.pixels[pix] = map(iter, 0, maxIter, 200, 255);
        img.pixels[pix+1] = map(iter, 0, maxIter, 150, 200);
        img.pixels[pix+2] = map(iter, 0, maxIter, 0, 100);
        img.pixels[pix+3] = 255;
      }
    }
  }
  
  img.updatePixels();
  mandelbrotImg = img;
}

function draw() {
  background(0);
  
  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2 + 10, PLATE_RADIUS * 2 + 10);
  
  // Draw plate fill
  noStroke();
  fill(30, 30, 50, 50);
  ellipse(width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);
  
  // Draw Mandelbrot image
  if (mandelbrotImg) {
    imageMode(CENTER);
    image(mandelbrotImg, width / 2, height / 2, PLATE_RADIUS * 2, PLATE_RADIUS * 2);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') generateMandelbrot();
  else if (key === 's' || key === 'S') saveCanvas('mandelbrot_plate', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
