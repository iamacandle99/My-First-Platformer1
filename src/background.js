/**
 * BACKGROUND MANAGEMENT
 * Background planets and environmental elements
 */

import { scene, THREE } from './engine.js';
import { playerGroup } from './sprite.js';

const backgroundPlanets = [];
let farStars, nearStars;

/**
 * STARFIELD GENERATOR
 */
export function createStarfield() {
    // Distant small stars
    const farGeometry = new THREE.BufferGeometry();
    const farVertices = [];
    for (let i = 0; i < 5000; i++) {
        farVertices.push((Math.random() - 0.5) * 3000, (Math.random() - 0.5) * 3000, -1000 - Math.random() * 1000);
    }
    farGeometry.setAttribute('position', new THREE.Float32BufferAttribute(farVertices, 3));
    farStars = new THREE.Points(farGeometry, new THREE.PointsMaterial({ color: 0x888888, size: 0.5 }));
    scene.add(farStars);

    // Closer colorful stars
    const nearGeometry = new THREE.BufferGeometry();
    const nearVertices = [];
    const nearColors = [];
    for (let i = 0; i < 2000; i++) {
        nearVertices.push((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, -100 - Math.random() * 500);
        const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.8);
        nearColors.push(color.r, color.g, color.b);
    }
    nearGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nearVertices, 3));
    nearGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nearColors, 3));
    nearStars = new THREE.Points(nearGeometry, new THREE.PointsMaterial({ vertexColors: true, size: 1.2, transparent: true, opacity: 0.8 }));
    scene.add(nearStars);
}

export function getBackgroundPlanets() {
    return backgroundPlanets;
}

/**
 * PLANET GENERATOR
 */
export function createPlanet(theme) {
    const size = Math.random() * 4 + 2;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    
    // Procedural look using level color with variation
    const hueShift = (Math.random() - 0.5) * 0.1;
    const planetColor = new THREE.Color(theme.color).offsetHSL(hueShift, 0, 0);

    const material = new THREE.MeshStandardMaterial({
        color: planetColor,
        roughness: 0.7 + Math.random() * 0.3,
        metalness: 0.1,
        emissive: planetColor,
        emissiveIntensity: 0.05
    });

    const planet = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    planet.add(mesh);
    
    // Random rotation for the mesh
    mesh.rotation.x = Math.random() * Math.PI;

    // Maybe add rings
    if (Math.random() > 0.6) {
        const ringGeo = new THREE.TorusGeometry(size * 1.8, 0.1, 8, 64);
        const ringMat = new THREE.MeshStandardMaterial({ 
            color: planetColor, 
            transparent: true, 
            opacity: 0.4,
            side: THREE.DoubleSide 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        planet.add(ring);
    }
    
    // Position planets relative to player initially
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 100;
    planet.position.set(
        playerGroup.position.x + Math.cos(angle) * distance, 
        playerGroup.position.y + Math.sin(angle) * distance, 
        -50 - Math.random() * 50
    );
    
    // Rotation speed
    planet.userData.rotSpeed = (Math.random() - 0.5) * 0.02;
    
    scene.add(planet);
    backgroundPlanets.push(planet);
}

export function clearPlanets() {
    backgroundPlanets.forEach(p => scene.remove(p));
    backgroundPlanets.length = 0;
}

export function updatePlanets() {
    const pPos = playerGroup.position;
    const despawnDist = 250;

    backgroundPlanets.forEach(p => {
        p.rotation.y += p.userData.rotSpeed;

        // Recycle planets that are too far
        const distToPlayer = Math.sqrt(
            Math.pow(p.position.x - pPos.x, 2) + 
            Math.pow(p.position.y - pPos.y, 2)
        );

        if (distToPlayer > despawnDist) {
            const angle = Math.random() * Math.PI * 2;
            const newDist = 180 + Math.random() * 50;
            p.position.x = pPos.x + Math.cos(angle) * newDist;
            p.position.y = pPos.y + Math.sin(angle) * newDist;
        }
    });

    // Make stars follow player for "infinite" feel
    if (farStars) {
        farStars.position.x = pPos.x * 0.98; // Parallax
        farStars.position.y = pPos.y * 0.98;
    }
    if (nearStars) {
        nearStars.position.x = pPos.x * 0.9; // More parallax
        nearStars.position.y = pPos.y * 0.9;
    }
}
