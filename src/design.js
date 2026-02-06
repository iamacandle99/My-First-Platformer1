/**
 * DESIGN & CONFIGURATION
 * Level themes and game settings
 */

export const levelThemes = [
    { name: "Veridian System", color: 0x22ff88, planetCount: 3 },
    { name: "Iron Core Nebula", color: 0xff4422, planetCount: 4 },
    { name: "Frozen Expanse", color: 0x2288ff, planetCount: 5 },
    { name: "The Gilded Void", color: 0xffcc22, planetCount: 6 },
    { name: "Obsidian Realm", color: 0xaa22ff, planetCount: 8 }
];

export const gameSettings = {
    acceleration: 0.01,
    friction: 0.96,
    harvestStarSpawnThreshold: 0.05,
    harvestStarMassReward: 0.25,
    collectionRadius: 1.2,
    despawnDistance: 100
};
