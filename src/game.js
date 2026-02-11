/**
 * MAIN GAME FILE
 * Orchestrates all game systems: engine, sprites, background, controls
 */

import { initializeEngine, handleResize, render, THREE } from './engine.js';
import { levelThemes, gameSettings } from './design.js';
import { HarvestStar, playerGroup, bhMaterial, discMaterial, getMass, resetPlayerState, setGameState } from './sprite.js';
import { createPlanet, clearPlanets, updatePlanets, createStarfield } from './background.js';
import { initializeControls, handleMovement } from './controls.js';

/** 
 * GAME STATE 
 */
let level = 1;
let mass = 1.0;
let goal = 10.0;
const stars = [];

/**
 * INITIALIZATION
 */
function initLevel() {
    clearPlanets();
    
    const theme = levelThemes[(level - 1) % levelThemes.length];
    document.getElementById('sector-name').innerText = theme.name.toUpperCase();
    document.getElementById('level').innerText = level;
    document.getElementById('goal').innerText = goal;
    
    // Change Black Hole color based on level
    const newColor = new THREE.Color(theme.color);
    bhMaterial.uniforms.bhColor.value = newColor;
    discMaterial.color = newColor;

    for(let i = 0; i < theme.planetCount; i++) {
        createPlanet(theme);
    }
}

function nextLevel() {
    level++;
    mass = 1.0;
    goal = 10 + (level * 5);
    resetPlayerState();
    setGameState(level, mass, goal);
    
    const msg = document.getElementById('msg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
    
    initLevel();
}

/**
 * GAME LOOP
 */
function animate() {
    requestAnimationFrame(animate);
    
    bhMaterial.uniforms.time.value += 0.05;
    handleMovement();

    // Update stars
    if (Math.random() < gameSettings.harvestStarSpawnThreshold + (level * 0.01)) {
        let type = 'normal';
        const rand = Math.random();
        if (rand < 0.05) type = 'mass';      // 5% red
        else if (rand < 0.15) type = 'speed'; // 10% blue
        
        const newStar = new HarvestStar(type);
        stars.push(newStar);
    }

    // Update and remove collected/despawned stars
    for (let i = stars.length - 1; i >= 0; i--) {
        if (stars[i].update()) {
            mass = getMass();
            document.getElementById('mass').innerText = mass.toFixed(2);
            
            if (mass >= goal) {
                nextLevel();
            }
            stars.splice(i, 1);
        }
    }

    // Rotate planets
    updatePlanets();

    render();
}

// Start game
initializeEngine();
initializeControls();
createStarfield();
initLevel();
animate();

// Handle resize
window.addEventListener('resize', handleResize);
