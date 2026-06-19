/**
 * Neural Network Plate - Dynamic node connections forming network-like patterns
 * ECS-style architecture with Position, Velocity, Node, Connection components
 */

const plateRadius = 300;
let ecs = { entities: [], nextId: 0 };

let config = {
  maxNodes: 50,
  connectionDistance: 80,
  growthRate: 5,
  isPaused: false
};

// Component factories
const Position = (x, y) => ({ type: 'Position', x, y });
const Velocity = (vx, vy) => ({ type: 'Velocity', vx, vy });
const Node = (radius, color) => ({ type: 'Node', radius, color });
const Connection = (targetId, weight) => ({ type: 'Connection', targetId, weight });

function spawnNode(x, y) {
  const id = ecs.nextId++;
  const radius = random(3, 8);
  const color = [random(100, 255), random(100, 255), random(200, 255)];
  const angle = random(TWO_PI);
  const speed = random(0.2, 1.0);

  ecs.entities.push({
    id,
    components: [
      Position(x, y),
      Velocity(cos(angle) * speed, sin(angle) * speed),
      Node(radius, color)
    ]
  });
  return id;
}

function clearAll() {
  ecs.entities = [];
  ecs.nextId = 0;
}

function restart() {
  clearAll();
  for (let i = 0; i < config.maxNodes; i++) {
    const angle = random(TWO_PI);
    const distance = random(plateRadius * 0.7);
    spawnNode(width / 2 + cos(angle) * distance, height / 2 + sin(angle) * distance);
  }
  if (typeof updateUI === 'function') updateUI();
}

function updatePositions() {
  for (let entity of ecs.entities) {
    const pos = entity.components.find(c => c.type === 'Position');
    const vel = entity.components.find(c => c.type === 'Velocity');
    if (!pos || !vel) continue;

    pos.x += vel.vx;
    pos.y += vel.vy;

    // Constrain to plate
    const d = dist(pos.x, pos.y, width / 2, height / 2);
    if (d > plateRadius) {
      const angleToCenter = atan2(height / 2 - pos.y, width / 2 - pos.x);
      pos.x = width / 2 + cos(angleToCenter) * (plateRadius - 10);
      pos.y = height / 2 + sin(angleToCenter) * (plateRadius - 10);
      vel.vx *= -0.5;
      vel.vy *= -0.5;
    }
  }
}

function updateConnections() {
  const nodes = ecs.entities.filter(e =>
    e.components.some(c => c.type === 'Node') &&
    e.components.some(c => c.type === 'Position')
  );

  for (let entity of ecs.entities) {
    entity.components = entity.components.filter(c => c.type !== 'Connection');
  }

  for (let i = 0; i < nodes.length; i++) {
    const posA = nodes[i].components.find(c => c.type === 'Position');
    for (let j = i + 1; j < nodes.length; j++) {
      const posB = nodes[j].components.find(c => c.type === 'Position');
      const d = dist(posA.x, posA.y, posB.x, posB.y);
      if (d < config.connectionDistance) {
        const weight = map(d, 0, config.connectionDistance, 1.0, 0.1);
        nodes[i].components.push(Connection(nodes[j].id, weight));
        nodes[j].components.push(Connection(nodes[i].id, weight));
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  restart();
  setupUI();
  background(0);
}

function setupUI() {
  const nodeCountEl = document.getElementById('node-count');
  const connCountEl = document.getElementById('connection-count');
  const maxNodesEl = document.getElementById('max-nodes');
  const connDistanceEl = document.getElementById('conn-distance');
  const growthRateEl = document.getElementById('growth-rate');
  const restartBtn = document.getElementById('restart-btn');

  window.updateUI = function() {
    if (nodeCountEl) {
      nodeCountEl.textContent = ecs.entities.filter(e =>
        e.components.some(c => c.type === 'Node')
      ).length;
    }
    if (connCountEl) {
      let total = 0;
      for (let e of ecs.entities) {
        total += e.components.filter(c => c.type === 'Connection').length;
      }
      connCountEl.textContent = Math.floor(total / 2);
    }
  };

  if (maxNodesEl) maxNodesEl.addEventListener('input', () => config.maxNodes = parseInt(maxNodesEl.value));
  if (connDistanceEl) connDistanceEl.addEventListener('input', () => config.connectionDistance = parseInt(connDistanceEl.value));
  if (growthRateEl) growthRateEl.addEventListener('input', () => config.growthRate = parseInt(growthRateEl.value));
  if (restartBtn) restartBtn.addEventListener('click', restart);

  updateUI();
}

function draw() {
  if (config.isPaused) return;

  background(0, 10);

  updatePositions();

  if (frameCount % config.growthRate === 0) {
    updateConnections();
  }

  if (frameCount % 60 === 0 && ecs.entities.length < config.maxNodes) {
    const angle = random(TWO_PI);
    const distance = random(plateRadius * 0.7);
    spawnNode(width / 2 + cos(angle) * distance, height / 2 + sin(angle) * distance);
    updateUI();
  }

  // Draw connections
  strokeWeight(1);
  for (let entity of ecs.entities) {
    const posA = entity.components.find(c => c.type === 'Position');
    if (!posA) continue;
    for (let conn of entity.components.filter(c => c.type === 'Connection')) {
      const target = ecs.entities.find(e => e.id === conn.targetId);
      if (!target) continue;
      const posB = target.components.find(c => c.type === 'Position');
      if (!posB) continue;
      stroke(100, 180, 255, map(conn.weight, 0.1, 1.0, 30, 200));
      line(posA.x, posA.y, posB.x, posB.y);
    }
  }

  // Draw nodes
  noStroke();
  for (let entity of ecs.entities) {
    const pos = entity.components.find(c => c.type === 'Position');
    const node = entity.components.find(c => c.type === 'Node');
    if (pos && node) {
      fill(node.color);
      ellipse(pos.x, pos.y, node.radius * 2);
      noFill();
      stroke(node.color[0], node.color[1], node.color[2], 150);
      ellipse(pos.x, pos.y, node.radius * 2 + 4);
    }
  }

  // Draw plate boundary
  noFill();
  stroke(80, 80, 100, 150);
  strokeWeight(4);
  ellipse(width / 2, height / 2, plateRadius * 2 + 10, plateRadius * 2 + 10);
}

function mousePressed() {
  const d = dist(mouseX, mouseY, width / 2, height / 2);
  if (d <= plateRadius && ecs.entities.length < config.maxNodes) {
    spawnNode(mouseX, mouseY);
    updateUI();
  }
}

function keyPressed() {
  if (key === ' ') config.isPaused = !config.isPaused;
  else if (key === 'r' || key === 'R') restart();
  else if (key === 'c' || key === 'C') { clearAll(); updateUI(); }
  else if (key === 's' || key === 'S') saveCanvas('neural_plate', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
