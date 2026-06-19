// ===== CONFIG =====
const DISH_RADIUS = 300;
const ORGANISM_BASE_RADIUS = 4;
const SPAWN_PROBABILITY = 0.02;
const SPAWN_DISTANCE = 12;
const INTERACTION_RADIUS = 20;
const MERGE_THRESHOLD = 0.15;
const COMPETE_THRESHOLD = 0.50;
const GROWTH_RATE = 0.01;
const MAX_ORGANISMS = 2000;

// ===== STATE =====
let app, dish, organismsContainer, organismsArray, colonies, paused = false;
let statsEl, population = 0;
let lastFrameTime = 0, fps = 0, frameCount = 0;

// ===== INIT =====
function init() {
    app = new PIXI.Application({
        width: 800, height: 800,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio
    });
    app.view.style.display = 'block';
    document.body.appendChild(app.view);

    // Petri dish
    dish = new PIXI.Graphics();
    dish.beginFill(0x16213e);
    dish.drawCircle(400, 400, DISH_RADIUS);
    dish.endFill();
    app.stage.addChild(dish);

    // Organism container
    organismsContainer = new PIXI.Container();
    app.stage.addChild(organismsContainer);

    // Organism metadata array
    organismsArray = [];

    // Colonies map: colonyId -> {color}
    colonies = new Map();

    // UI
    statsEl = document.getElementById('stats');
    document.getElementById('pause').onclick = () => paused = !paused;
    document.getElementById('clear').onclick = clearPlate;
    app.view.onclick = addOrganismAtMouse;

    // Initial organisms
    for (let i = 0; i < 5; i++) addRandomOrganism();

    // Start loop
    app.ticker.add(gameLoop);
    app.ticker.maxFPS = 60;
}

// ===== ORGANISM HELPERS =====
function randomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

function addOrganism(x, y, colonyId, color) {
    if (population >= MAX_ORGANISMS) return null;

    const id = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const radius = ORGANISM_BASE_RADIUS;
    const g = new PIXI.Graphics();
    g.beginFill(color);
    g.drawCircle(0, 0, radius);
    g.endFill();
    g.position.set(x, y);

    organismsContainer.addChild(g);
    const org = { id, x, y, radius, color, colonyId, graphics: g, scale: { x: 1, y: 1 } };
    organismsArray.push(org);
    population++;

    return org;
}

function removeOrganism(org) {
    organismsContainer.removeChild(org.graphics);
    org.graphics.destroy();
    const idx = organismsArray.indexOf(org);
    if (idx !== -1) organismsArray.splice(idx, 1);
    population--;
}

function addRandomOrganism() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * DISH_RADIUS * 0.7;
    const x = 400 + Math.cos(angle) * dist;
    const y = 400 + Math.sin(angle) * dist;
    const color = randomColor();
    const colonyId = `colony_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    colonies.set(colonyId, { color });
    addOrganism(x, y, colonyId, color);
}

// ===== COLOR DISTANCE (HSL) =====
function rgbToHsl(rgb) {
    const r = ((rgb >> 16) & 0xFF) / 255;
    const g = ((rgb >> 8) & 0xFF) / 255;
    const b = (rgb & 0xFF) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function colorDistance(c1, c2) {
    const [h1, s1, l1] = rgbToHsl(c1);
    const [h2, s2, l2] = rgbToHsl(c2);
    const dh = Math.min(Math.abs(h1 - h2), 1 - Math.abs(h1 - h2));
    const ds = Math.abs(s1 - s2);
    const dl = Math.abs(l1 - l2);
    return Math.sqrt(dh * dh * 4 + ds * ds + dl * dl) / Math.sqrt(6);
}

// ===== SPAWN LOGIC =====
function attemptSpawn(parent) {
    if (population >= MAX_ORGANISMS) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = SPAWN_DISTANCE * (0.7 + Math.random() * 0.6);
    let nx = parent.x + Math.cos(angle) * dist;
    let ny = parent.y + Math.sin(angle) * dist;

    // Check dish bounds
    const dx = nx - 400;
    const dy = ny - 400;
    if (dx * dx + dy * dy > DISH_RADIUS * DISH_RADIUS) return;

    let newColor = parent.color;
    let newColonyId = parent.colonyId;
    let shouldSpawn = true;
    let toRemove = [];

    // Check interactions with existing organisms
    for (const org of organismsArray) {
        const ox = org.x;
        const oy = org.y;
        const od = Math.sqrt((nx - ox) ** 2 + (ny - oy) ** 2);
        if (od < INTERACTION_RADIUS) {
            const existingColony = colonies.get(org.colonyId);
            const d = colorDistance(newColor, existingColony.color);

            if (d < MERGE_THRESHOLD) {
                newColor = existingColony.color;
                newColonyId = org.colonyId;
            } else if (d > COMPETE_THRESHOLD) {
                toRemove.push(org);
            } else {
                shouldSpawn = false;
                break;
            }
        }
    }

    // Remove competed organisms
    for (const org of toRemove) {
        removeOrganism(org);
    }

    if (shouldSpawn) {
        if (!colonies.has(newColonyId)) {
            colonies.set(newColonyId, { color: newColor });
        }
        const newOrg = addOrganism(nx, ny, newColonyId, newColor);
        if (newOrg) {
            newOrg.x = nx;
            newOrg.y = ny;
        }
    }
}

// ===== GAME LOOP =====
function gameLoop(delta) {
    if (paused) return;

    // FPS counter
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        frameCount = 0;
        lastFrameTime = now;
    }

    // Spawn new organisms
    const orgList = [...organismsArray];
    for (const org of orgList) {
        if (Math.random() < SPAWN_PROBABILITY) {
            attemptSpawn(org);
        }
        // Growth
        org.graphics.scale.x = org.graphics.scale.y = Math.min(1.0, org.graphics.scale.x + GROWTH_RATE * delta * 0.1);
        org.x = org.graphics.position.x;
        org.y = org.graphics.position.y;
    }

    // Update stats
    statsEl.textContent = `Population: ${population} | FPS: ${fps}`;
}

// ===== CONTROLS =====
function clearPlate() {
    while (organismsArray.length > 0) {
        removeOrganism(organismsArray[0]);
    }
    colonies.clear();
    population = 0;
}

function addOrganismAtMouse(e) {
    const rect = app.view.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - 400;
    const dy = y - 400;
    if (dx * dx + dy * dy <= DISH_RADIUS * DISH_RADIUS) {
        const color = randomColor();
        const colonyId = `colony_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        colonies.set(colonyId, { color });
        const org = addOrganism(x, y, colonyId, color);
        if (org) {
            org.x = x;
            org.y = y;
        }
    }
}

// ===== START =====
window.onload = init;
