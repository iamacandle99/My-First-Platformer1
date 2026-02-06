/**
 * ENGINE SETUP
 * Core THREE.js scene, camera, and renderer initialization
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export let scene, camera, renderer;

export function initializeEngine() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 20;

    // Lighting for planets
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(5, 5, 10);
    scene.add(sunLight);
}

export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    renderer.render(scene, camera);
}

export { THREE };
