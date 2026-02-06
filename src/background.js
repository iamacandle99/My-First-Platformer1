/**
 * BACKGROUND MANAGEMENT
 * Background planets and environmental elements
 */

import { scene, THREE } from './engine.js';

const backgroundPlanets = [];

export function getBackgroundPlanets() {
    return backgroundPlanets;
}

/**
 * PLANET GENERATOR
 */
export function createPlanet(theme) {
    const size = Math.random() * 4 + 2;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    
    // Procedural look using level color
    const material = new THREE.MeshStandardMaterial({
        color: theme.color,
        roughness: 0.8,
        metalness: 0.2,
        emissive: theme.color,
        emissiveIntensity: 0.1
    });

    const planet = new THREE.Mesh(geometry, material);
    
    // Position planets far in background
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    planet.position.set(
        Math.cos(angle) * distance, 
        Math.sin(angle) * distance, 
        -30 - Math.random() * 20
    );
    
    // Rotation speed
    planet.userData.rotSpeed = Math.random() * 0.01;
    
    scene.add(planet);
    backgroundPlanets.push(planet);
}

export function clearPlanets() {
    backgroundPlanets.forEach(p => scene.remove(p));
    backgroundPlanets.length = 0;
}

export function updatePlanets() {
    backgroundPlanets.forEach(p => {
        p.rotation.y += p.userData.rotSpeed;
    });
}
