/**
 * CONTROLS & INPUT HANDLING
 * Keyboard input and player movement
 */

import { playerGroup } from './sprite.js';
import { gameSettings } from './design.js';
import { camera, THREE } from './engine.js';

const keys = { 
    ArrowUp: false, 
    ArrowDown: false, 
    ArrowLeft: false, 
    ArrowRight: false 
};

let velocity = new THREE.Vector2(0, 0);

export function initializeControls() {
    window.addEventListener('keydown', (e) => { 
        if (keys.hasOwnProperty(e.code)) keys[e.code] = true; 
    });
    window.addEventListener('keyup', (e) => { 
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false; 
    });
}

export function handleMovement() {
    if (keys.ArrowUp) velocity.y += gameSettings.acceleration;
    if (keys.ArrowDown) velocity.y -= gameSettings.acceleration;
    if (keys.ArrowLeft) velocity.x -= gameSettings.acceleration;
    if (keys.ArrowRight) velocity.x += gameSettings.acceleration;

    velocity.multiplyScalar(gameSettings.friction);
    playerGroup.position.x += velocity.x;
    playerGroup.position.y += velocity.y;
    
    // Keep camera following slightly
    camera.position.x += (playerGroup.position.x - camera.position.x) * 0.05;
    camera.position.y += (playerGroup.position.y - camera.position.y) * 0.05;
}

export function resetVelocity() {
    velocity.set(0, 0);
}
