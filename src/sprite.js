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
            float ring = smoothstep(0.48, 0.5, dist) - smoothstep(0.5, 0.52, dist);
            float core = smoothstep(0.35, 0.3, dist);
            
            vec3 finalColor = bhColor * ring * 2.0;
            if (dist < 0.3) finalColor = vec3(0.0); // The Singularity
            
            float alpha = (dist < 0.3) ? 1.0 : ring;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `,
    transparent: true
});

const bhMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), bhMaterial);
playerGroup.add(bhMesh);

/**
 * HARVEST STAR - The "Food"
 */
export class HarvestStar {
    constructor() {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Random spawn outside view
        const angle = Math.random() * Math.PI * 2;
        const dist = 30;
        this.mesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0);
        
        // Give them initial orbital velocity
        this.vel = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0)
            .multiplyScalar(0.1 + (level * 0.05));
        scene.add(this.mesh);
    }

    update() {
        // Gravity logic
        const diff = new THREE.Vector3().subVectors(playerGroup.position, this.mesh.position);
        const distance = diff.length();
        const force = 0.1 / (distance * distance); // Newtonish
        
        this.vel.add(diff.normalize().multiplyScalar(force));
        this.mesh.position.add(this.vel);

        // Check collection
        if (distance < gameSettings.collectionRadius * (mass / 2)) {
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
        mass += gameSettings.harvestStarMassReward;
        scene.remove(this.mesh);
        document.getElementById('mass').innerText = mass.toFixed(2);
        
        // Scale player
        const scale = 1 + (mass * 0.05);
        playerGroup.scale.set(scale, scale, scale);
        
        return mass >= goal;
    }
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
