# p5.js Petri Dish / Agar Plate Simulation

An interactive petri dish simulation inspired by slime mold behavior and particle systems. Built with p5.js.

## Features

- **Round Agar Plate**: Realistic petri dish visualization with boundary
- **Slime Mold-Inspired Organisms**: Agents that follow and deposit chemical trails
- **Sensor-Based Movement**: Organisms detect and follow trail concentrations
- **Interactive Controls**: Adjust parameters in real-time
- **Trail System**: Persistent trails with configurable decay

## Inspirations

- [Slime mold simulation by @u429398](https://openprocessing.org/@u429398/2213463) (physarum behavior)
- [Microscope simulation by @kiantiong](https://openprocessing.org/@kiantiong/2111906) (round plate concept)
- [tangert/physarum](https://github.com/tangert/physarum) - Slime mold simulations in p5.js
- [moralesangel/slime-mold-simulation](https://github.com/moralesangel/slime-mold-simulation) - Particle-based slime mold
- [Coding Train's Nature of Code](https://natureofcode.com/) - Particle systems

## Quick Start

1. **Open in browser**: Simply open `index.html` in a modern web browser
2. **Local server**: For best results, run a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```
   Then open `http://localhost:8000` in your browser

3. **Online editor**: You can also paste the code into the [p5.js Web Editor](https://editor.p5js.org/)

## Controls

### Keyboard
- **SPACE**: Pause/Resume simulation
- **R**: Reset simulation (create new organisms)
- **S**: Save image (PNG)
- **C**: Clear plate (remove all organisms)

### Mouse
- **Click on plate**: Add new organism at click position

### UI Panel (Top Left)
- **Population**: Current number of organisms
- **FPS**: Frames per second
- 
- **Add Organism**: Button to add random organism
- **Clear Plate**: Remove all organisms
- **Randomize**: Randomize organism positions
- 
- **Organisms**: Adjust number of organisms (10-1000)
- **Trail Weight**: How bright/intense trails appear
- **Sensor Angle**: Angle between organism's sensors (degrees)
- **Deposit Amount**: How much trail each organism leaves
- **Decay Rate**: How quickly trails fade away
- **Plate Radius**: Size of the petri dish

## How It Works

### Organism Behavior

Each organism has three sensors (left, front, right) that detect chemical trail concentrations. The movement logic:

1. **Sensing**: Each frame, sensors sample the trail map at their positions
2. **Decision**: The organism compares sensor readings:
   - If **front** has highest value → continue straight
   - If **left** > right → turn left toward higher concentration
   - If **right** > left → turn right toward higher concentration
   - If equal → small random movement
3. **Movement**: Move forward in current heading direction
4. **Deposit**: Leave a trail behind

### Trail System

- Trails are deposited on an off-screen canvas for rendering
- A separate grid-based map tracks trail values for sensing
- Trails gradually decay over time (configurable)

### Boundary Handling

Organisms that hit the plate boundary:
- Bounce off the edge
- Receive a slight random direction change
- Are repositioned just inside the boundary

## Customization

You can easily customize the simulation by modifying the `config` object in `petri_dish.js`:

```javascript
let config = {
  numOrganisms: 200,      // Initial number of organisms
  trailWeight: 10,        // Trail brightness multiplier
  sensoryAngle: 45,       // Sensor spread angle (degrees)
  depositAmount: 5,       // Trail deposit amount per frame
  decayRate: 0.01,        // Trail decay rate (0-1)
  organismSize: 2,        // Size of organisms
  speed: 2,               // Movement speed
  sensorDistance: 10,     // Distance from organism to sensors
  plateRadius: 300        // Radius of petri dish
};
```

### Advanced Customization

- **Colors**: Modify the `colors` object to change plate, agar, organism, and trail colors
- **Organism Appearance**: Edit the `Organism.display()` method
- **Movement Logic**: Modify the `Organism.update()` method for different behaviors

## Performance Tips

- Reduce `numOrganisms` for smoother performance
- Increase `decayRate` to reduce trail rendering overhead
- Lower `trailWeight` for subtler visual effects

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires ES6 support.

## Dependencies

- [p5.js](https://p5js.org/) v1.9.0 (loaded from CDN)

## Project Structure

```
p5plates/
├── index.html          # Main HTML file with UI
├── petri_dish.js       # Main simulation code
├── README.md           # This file
└── reference_slime/    # Reference: slime mold simulation example
└── reference_physarum/ # Reference: physarum simulation example
```

## References & Further Reading

- [p5.js Documentation](https://p5js.org/reference/)
- [The Nature of Code](https://natureofcode.com/) - Daniel Shiffman
- [Physarum Polycephalum](https://en.wikipedia.org/wiki/Physarum_polycephalum) - Wikipedia
- [Slime Mold Simulations](https://www.youtube.com/watch?v=3q3QF5Nj91A) - Primordial Life

## License

This project is open source. Feel free to use, modify, and distribute as you wish.

---

Created with inspiration from various p5.js and Processing sketches.
