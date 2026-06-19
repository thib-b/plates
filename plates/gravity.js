/**
 * Gravity Plate - Particles with gravitational attraction/repulsion
 */

let particles = [];
let attractors = [];
let plateRadius = 300;
let isPaused = false;
let gravityStrength = 1;
let particleCountTarget = 200;

const attractorColors = [
  {r:255,g:100,b:100}, {r:100,g:255,b:100}, {r:100,g:100,b:255},
  {r:255,g:255,b:100}, {r:255,g:100,b:255}, {r:100,g:255,b:255}
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  addAttractor(width/2, height/2-80, 50, 2);
  addAttractor(width/2+80, height/2, 30, -1);
  addAttractor(width/2-80, height/2, 40, 1);
  resetParticles();
  setupUI();
}

function setupUI() {
  const pc = document.getElementById('particle-count');
  const ac = document.getElementById('attractor-count');
  const rb = document.getElementById('restart');
  const gs = document.getElementById('gravity-slider');
  const ps = document.getElementById('particle-count-slider');

  function update() {
    if(pc) pc.textContent = particles.length;
    if(ac) ac.textContent = attractors.length;
  }

  if(rb) rb.addEventListener('click', () => {
    attractors = []; particles = [];
    addAttractor(width/2, height/2-80, 50, 2);
    addAttractor(width/2+80, height/2, 30, -1);
    addAttractor(width/2-80, height/2, 40, 1);
    resetParticles(); update();
  });

  if(gs) gs.addEventListener('input', () => gravityStrength = parseFloat(gs.value));
  if(ps) ps.addEventListener('input', () => { 
    particleCountTarget = parseInt(ps.value); 
    resetParticles(); 
    update(); 
  });
  update();
}

function resetParticles() {
  particles = [];
  for(let i=0; i<particleCountTarget; i++) {
    let a = random(360);
    let d = random(plateRadius*0.7);
    particles.push(new Particle(
      width/2+cos(a)*d, height/2+sin(a)*d,
      random(-1,1), random(-1,1), random(1,3)
    ));
  }
}

function addAttractor(x, y, mass, type) {
  let color = attractorColors[attractors.length % attractorColors.length];
  attractors.push(new Attractor(x, y, mass, type, color));
}

function draw() {
  if(isPaused) return;
  background(0);

  noFill(); stroke(255); strokeWeight(2);
  ellipse(width/2, height/2, plateRadius*2, plateRadius*2);

  for(let a of attractors) a.display();
  for(let p of particles) {
    let fx = 0, fy = 0;
    for(let a of attractors) {
      let dx = a.x-p.x, dy = a.y-p.y;
      let dist = sqrt(dx*dx+dy*dy);
      let minD = 10;
      if(dist < minD) dist = minD;
      let force = gravityStrength * a.mass * p.mass / (dist*dist);
      if(a.type > 0) { 
        fx += force*(dx/dist); 
        fy += force*(dy/dist); 
      } else { 
        fx -= force*(dx/dist); 
        fy -= force*(dy/dist); 
      }
    }
    p.vx += fx*0.01; p.vy += fy*0.01;
    p.vx *= 0.995; p.vy *= 0.995;
    p.x += p.vx; p.y += p.vy;
    p.constrainToPlate();
    p.display();
  }
}

function mousePressed() {
  if(dist(mouseX,mouseY,width/2,height/2) <= plateRadius) {
    addAttractor(mouseX, mouseY, random(20,60), random([-1,1]));
    const ac = document.getElementById('attractor-count');
    if(ac) ac.textContent = attractors.length;
  }
}

function keyPressed() {
  if(key===' ') isPaused=!isPaused;
  else if(key==='r'||key==='R') {
    attractors=[]; particles=[];
    addAttractor(width/2,height/2-80,50,2);
    addAttractor(width/2+80,height/2,30,-1);
    addAttractor(width/2-80,height/2,40,1);
    resetParticles();
    const ac=document.getElementById('attractor-count');
    const pc=document.getElementById('particle-count');
    if(ac) ac.textContent=attractors.length;
    if(pc) pc.textContent=particles.length;
  }
  else if(key==='c'||key==='C') {
    particles=[]; attractors=[];
    const ac=document.getElementById('attractor-count');
    const pc=document.getElementById('particle-count');
    if(ac) ac.textContent=attractors.length;
    if(pc) pc.textContent=particles.length;
  }
  else if(key==='s'||key==='S') saveCanvas('gravity_plate','png');
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}

class Particle {
  constructor(x,y,vx,vy,mass) {
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.mass=mass; this.radius=2;
  }
  constrainToPlate() {
    let cx=width/2, cy=height/2;
    let d=dist(this.x,this.y,cx,cy);
    if(d > plateRadius-this.radius) {
      let a=atan2(this.y-cy, this.x-cx);
      this.x=cx+cos(a)*(plateRadius-this.radius);
      this.y=cy+sin(a)*(plateRadius-this.radius);
      let na=a+180;
      let ra=2*na-degrees(atan2(this.vy,this.vx));
      let s=sqrt(this.vx*this.vx+this.vy*this.vy);
      this.vx=cos(ra)*s*0.8; this.vy=sin(ra)*s*0.8;
    }
  }
  display() { 
    noStroke(); fill(255,200); 
    ellipse(this.x,this.y,this.radius*2); 
  }
}

class Attractor {
  constructor(x,y,mass,type,color) {
    this.x=x; this.y=y; this.mass=mass;
    this.type=type; this.color=color;
    this.radius=mass*0.5;
  }
  display() {
    noStroke(); fill(this.color.r,this.color.g,this.color.b,200);
    ellipse(this.x,this.y,this.radius*2);
    stroke(this.type>0?255:100); strokeWeight(2); noFill();
    ellipse(this.x,this.y,this.radius*2+10);
    noStroke(); fill(255); textSize(12); textAlign(CENTER,CENTER);
    text(Math.round(this.mass).toString(),this.x,this.y);
  }
}
