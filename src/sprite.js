/**
 * SPRITE DEFINITIONS
 * Player (Black Hole) and Harvest Stars
 */

import { scene, THREE } from './engine.js';
import { gameSettings } from './design.js';

let level = 1;
let mass = 1.0;
let goal = 10.0;

export function getGameState() {
    return { level, mass, goal };
}

export function setGameState(newLevel, newMass, newGoal) {
    level = newLevel;
    mass = newMass;
    goal = newGoal;
}

/**
 * BLACK HOLE (THE PLAYER)
 * Custom shader for lensing and event horizon
 */
export const playerGroup = new THREE.Group();
scene.add(playerGroup);

export const bhMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        bhColor: { value: new THREE.Color(0x00d2ff) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        uniform vec3 bhColor;
        void main() {
            float dist = distance(vUv, vec2(0.5));
            
            // Accretion disk glow
            float glow = 0.05 / pow(dist, 1.5);
            glow = clamp(glow, 0.0, 1.0);
            
            // Event horizon ring
            float ring = smoothstep(0.45, 0.46, dist) - smoothstep(0.46, 0.48, dist);
            
            vec3 color = bhColor * glow * 2.0;
            color += bhColor * ring * 4.0;
            
            if (dist < 0.3) color = vec3(0.0); // The Singularity
            
            float alpha = (dist < 0.3) ? 1.0 : (glow + ring);
            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true
});

const bhMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), bhMaterial);
playerGroup.add(bhMesh);

// Add an accretion disc for 3D look
const discGeometry = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
export const discMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00d2ff, 
    transparent: true, 
    opacity: 0.7 
});
const disc = new THREE.Mesh(discGeometry, discMaterial);
disc.rotation.x = Math.PI / 2.1;
playerGroup.add(disc);

/**
 * HARVEST STAR - The "Food"
 */
export class HarvestStar {
    constructor(type = 'normal') {
        this.type = type;
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        
        let color = 0xffffff;
        if (type === 'speed') color = 0x00ffff; // Blue
        if (type === 'mass') color = 0xff0000;  // Red
        
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9 
        });
        this.mesh = new THREE.Mesh(geometry, material);

        // Add glow for powerups
        if (type !== 'normal') {
            const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
            this.mesh.add(new THREE.Mesh(glowGeo, glowMat));
        }
        
        // Random spawn outside view relative to player
        const angle = Math.random() * Math.PI * 2;
        const dist = 35;
        const playerPos = playerGroup.position;
        this.mesh.position.set(
            playerPos.x + Math.cos(angle) * dist, 
            playerPos.y + Math.sin(angle) * dist, 
            0
        );
        
        // Give them initial orbital velocity relative to player heading
        this.vel = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0)
            .multiplyScalar(0.1 + (level * 0.05));
        scene.add(this.mesh);
    }

    update() {
        // Gravity logic
        const diff = new THREE.Vector3().subVectors(playerGroup.position, this.mesh.position);
        const distance = diff.length();
        
        // Increase pull for powerups
        const forceMultiplier = (this.type !== 'normal') ? 0.3 : 0.1;
        const force = forceMultiplier / (distance * distance); 
        
        this.vel.add(diff.normalize().multiplyScalar(force));
        this.mesh.position.add(this.vel);

        // Check collection - Based on actual black hole horizon
        const bhRadius = 1.3 * playerGroup.scale.x; 
        if (distance < bhRadius) {
            this.collect();
            return true;
        }
        // Despawn if too far
        if (distance > gameSettings.despawnDistance) {
            scene.remove(this.mesh);
            return true;
        }
        return false;
    }

    collect() {
        if (this.type === 'normal') {
            mass += gameSettings.harvestStarMassReward;
        } else if (this.type === 'mass') {
            mass += gameSettings.harvestStarMassReward * 5; // Big boost
            showNotification("MASSIVE COLLISION!");
        } else if (this.type === 'speed') {
            mass += gameSettings.harvestStarMassReward;
            activateSpeedBoost();
            showNotification("SINGULARITY ACCELERATED!");
        }

        scene.remove(this.mesh);
        document.getElementById('mass').innerText = mass.toFixed(2);
        
        // Scale player
        const scale = 1 + (mass * 0.05);
        playerGroup.scale.set(scale, scale, scale);
        
        return mass >= goal;
    }
}

function showNotification(text) {
    const msg = document.getElementById('msg');
    const originalText = msg.innerHTML;
    msg.innerHTML = text;
    msg.style.display = 'block';
    msg.style.fontSize = '1.5em';
    setTimeout(() => { 
        msg.style.display = 'none'; 
        msg.innerHTML = originalText;
        msg.style.fontSize = '2em';
    }, 1500);
}

let boostTimer = null;
function activateSpeedBoost() {
    gameSettings.acceleration = 0.03; // Triple speed
    if (boostTimer) clearTimeout(boostTimer);
    boostTimer = setTimeout(() => {
        gameSettings.acceleration = 0.01; // Back to normal
    }, 5000);
}

export function resetPlayerState() {
    playerGroup.position.set(0, 0, 0);
    playerGroup.scale.set(1, 1, 1);
    mass = 1.0;
}

export function scalePlayer(newMass) {
    mass = newMass;
    const scale = 1 + (mass * 0.05);
    playerGroup.scale.set(scale, scale, scale);
}

export function getMass() {
    return mass;
}

export function updateMass(delta) {
    mass += delta;
}
