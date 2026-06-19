// Petri Dish Animation - ZIM Framework

const DISH_RADIUS = 280;
const ORG_RADIUS = 8;
const SPAWN_PROB = 0.05;
const SPAWN_DISTANCE = 8;
const MERGE_THRESHOLD = 80;
const COMPETE_THRESHOLD = 200;
const MAX_POPULATION = 800;

let stage, frame, dish;
let organisms = [];
let colonies = new Map();
let paused = false;
let population = 0;
let lastTime = performance.now();
let fps = 0;
let frameCount = 0;

function colorDistance(c1, c2) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function inDish(x, y) {
    // Use stage dimensions
    const cx = stage.width / 2;
    const cy = stage.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= DISH_RADIUS * DISH_RADIUS;
}

function getOrganismAt(x, y, excludeOrg = null) {
    const threshold = ORG_RADIUS * 2;
    for (const org of organisms) {
        if (org === excludeOrg) continue;
        const dx = org.x - x;
        const dy = org.y - y;
        if (dx * dx + dy * dy <= threshold * threshold) {
            return org;
        }
    }
    return null;
}

function randomColor() {
    // Generate bright, visible colors
    return "#" + (Math.floor(Math.random() * 16777215) + 0x888888).toString(16).padStart(6, '0');
}

function generateColonyId() {
    return "c" + Math.random().toString(36).substr(2, 8);
}

function spawnOrganism(x, y, color, colonyId, parentOrg = null) {
    if (!inDish(x, y)) return null;
    if (population >= MAX_POPULATION) return null;

    const existing = getOrganismAt(x, y, parentOrg);
    if (existing) {
        const dist = colorDistance(existing.color, color);
        if (dist < MERGE_THRESHOLD) {
            colonyId = existing.colonyId;
            color = existing.color;
        } else if (dist > COMPETE_THRESHOLD) {
            removeOrganism(existing);
        } else {
            return null;
        }
    }

    const circle = new Circle(ORG_RADIUS, color);
    circle.pos(x, y);
    circle.addTo(stage);
    
    const org = {
        x, y,
        color: color,
        colonyId: colonyId,
        circle: circle
    };
    organisms.push(org);

    if (!colonies.has(colonyId)) {
        colonies.set(colonyId, { color, count: 0 });
    }
    colonies.get(colonyId).count++;
    population++;

    return org;
}

function removeOrganism(org) {
    const index = organisms.indexOf(org);
    if (index > -1) {
        organisms.splice(index, 1);
        org.circle.removeFrom();
        const colony = colonies.get(org.colonyId);
        if (colony) {
            colony.count--;
            if (colony.count <= 0) {
                colonies.delete(org.colonyId);
            }
        }
        population--;
    }
}

function spawnRandom() {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (DISH_RADIUS - 30);
    // Use stage dimensions for positioning
    const x = stage.width / 2 + Math.cos(angle) * r;
    const y = stage.height / 2 + Math.sin(angle) * r;
    const color = randomColor();
    const colonyId = generateColonyId();
    spawnOrganism(x, y, color, colonyId);
}

function clearPlate() {
    for (const org of organisms) {
        org.circle.removeFrom();
    }
    organisms = [];
    colonies.clear();
    population = 0;
    document.getElementById('popCount').textContent = '0';
}

function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        document.getElementById('fpsCount').textContent = fps;
    }
}

function update() {
    if (paused) return;
    updateFPS();

    if (Math.random() < 0.02) spawnRandom();

    for (const org of organisms.slice()) {
        if (Math.random() < SPAWN_PROB) {
            const angle = Math.random() * Math.PI * 2;
            const nx = org.x + Math.cos(angle) * SPAWN_DISTANCE;
            const ny = org.y + Math.sin(angle) * SPAWN_DISTANCE;
            spawnOrganism(nx, ny, org.color, org.colonyId, org);
        }
    }

    document.getElementById('popCount').textContent = population;
}

function setup() {
    // Create Frame with FIXED dimensions (no scaling issues)
    frame = new Frame(800, 600, "#111", "#000");
    
    frame.on("ready", function() {
        stage = frame.stage;
        
        // Draw dish centered on stage
        dish = new Circle(DISH_RADIUS, "#444");
        dish.pos(stage.width/2, stage.height/2);
        dish.addTo(stage);
        dish.alpha = 0.3;
        
        // Setup UI and start simulation
        document.getElementById('pauseBtn').onclick = () => {
            paused = !paused;
            document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
        };
        document.getElementById('clearBtn').onclick = clearPlate;

        // Use frame.canvas for click events
        frame.canvas.onclick = (e) => {
            const rect = frame.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Make sure click is within dish
            if (inDish(x, y)) {
                spawnOrganism(x, y, randomColor(), generateColonyId());
            }
        };

        for (let i = 0; i < 5; i++) {
            spawnRandom();
        }
        frame.on("update", update);
    });
}

window.onload = setup;
