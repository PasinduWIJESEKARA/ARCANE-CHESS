import * as THREE from 'three';
import { ProceduralTextureSet } from './textures';

export interface ArcaneMaterialLibrary {
  whiteStonePrimary: THREE.MeshStandardMaterial;
  whiteStoneTrim: THREE.MeshStandardMaterial;
  whiteMetalAccent: THREE.MeshStandardMaterial;
  blackStonePrimary: THREE.MeshStandardMaterial;
  blackStoneTrim: THREE.MeshStandardMaterial;
  blackMetalAccent: THREE.MeshStandardMaterial;
  boardLightTile: THREE.MeshStandardMaterial;
  boardDarkTile: THREE.MeshStandardMaterial;
  boardFrameStone: THREE.MeshStandardMaterial;
  boardTrimBronze: THREE.MeshStandardMaterial;
  hallFloorStone: THREE.MeshStandardMaterial;
  hallPillarStone: THREE.MeshStandardMaterial;
  hallWallStone: THREE.MeshStandardMaterial;
  wroughtIron: THREE.MeshStandardMaterial;
  emberBed: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  selectionHalo: THREE.MeshBasicMaterial;
  dispose: () => void;
}

export function createArcaneMaterials(tex: ProceduralTextureSet): ArcaneMaterialLibrary {
  // White Army — Pale grey-white carved stone with subtle aged ivory highlights and restrained pewter-bronze trim
  const whiteStonePrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#dbd8d1'),
    map: tex.whiteLimestoneMap,
    bumpMap: tex.whiteLimestoneBump,
    bumpScale: 0.036,
    roughness: 0.80,
    metalness: 0.05,
    envMapIntensity: 0.45,
  });

  const whiteStoneTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c2beb4'),
    map: tex.whiteLimestoneMap,
    bumpMap: tex.whiteLimestoneBump,
    bumpScale: 0.028,
    roughness: 0.72,
    metalness: 0.10,
    envMapIntensity: 0.52,
  });

  const whiteMetalAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#918879'),
    bumpMap: tex.metalBrushedBump,
    bumpScale: 0.016,
    roughness: 0.36,
    metalness: 0.80,
    envMapIntensity: 0.90,
  });

  // Black Army — Dark charcoal carved stone, deep grey surfaces, and subtle blackened iron ornamentation
  const blackStonePrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#30343c'),
    map: tex.blackGraniteMap,
    bumpMap: tex.blackGraniteBump,
    bumpScale: 0.038,
    roughness: 0.76,
    metalness: 0.08,
    envMapIntensity: 0.52,
  });

  const blackStoneTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#22252b'),
    map: tex.blackGraniteMap,
    bumpMap: tex.blackGraniteBump,
    bumpScale: 0.030,
    roughness: 0.66,
    metalness: 0.14,
    envMapIntensity: 0.58,
  });

  const blackMetalAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#545b67'),
    bumpMap: tex.metalBrushedBump,
    bumpScale: 0.018,
    roughness: 0.34,
    metalness: 0.85,
    envMapIntensity: 0.95,
  });

  // Chessboard — Monumental travertine vs dark basalt tiles with beveled stone dais
  const boardLightTile = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c8beac'),
    map: tex.whiteLimestoneMap,
    bumpMap: tex.whiteLimestoneBump,
    bumpScale: 0.024,
    roughness: 0.76,
    metalness: 0.05,
    envMapIntensity: 0.45,
  });

  const boardDarkTile = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#272a31'),
    map: tex.blackGraniteMap,
    bumpMap: tex.blackGraniteBump,
    bumpScale: 0.028,
    roughness: 0.7,
    metalness: 0.08,
    envMapIntensity: 0.5,
  });

  const boardFrameStone = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3a3c42'),
    map: tex.blackGraniteMap,
    bumpMap: tex.blackGraniteBump,
    bumpScale: 0.035,
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.4,
  });

  const boardTrimBronze = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#77613f'),
    bumpMap: tex.metalBrushedBump,
    bumpScale: 0.015,
    roughness: 0.42,
    metalness: 0.78,
    envMapIntensity: 0.75,
  });

  // Hall Architecture
  const hallFloorStone = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#262930'),
    map: tex.flagstoneMap,
    bumpMap: tex.flagstoneBump,
    bumpScale: 0.05,
    roughness: 0.88,
    metalness: 0.04,
    envMapIntensity: 0.35,
  });

  const hallPillarStone = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#34373f'),
    map: tex.blackGraniteMap,
    bumpMap: tex.blackGraniteBump,
    bumpScale: 0.04,
    roughness: 0.88,
    metalness: 0.04,
    envMapIntensity: 0.32,
  });

  const hallWallStone = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#23262d'),
    map: tex.flagstoneMap,
    bumpMap: tex.flagstoneBump,
    bumpScale: 0.045,
    roughness: 0.92,
    metalness: 0.03,
    envMapIntensity: 0.25,
  });

  const wroughtIron = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1f2227'),
    bumpMap: tex.metalBrushedBump,
    bumpScale: 0.02,
    roughness: 0.48,
    metalness: 0.82,
    envMapIntensity: 0.7,
  });

  const emberBed = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2a1208'),
    emissive: new THREE.Color('#e25814'),
    emissiveIntensity: 2.2,
    roughness: 0.9,
    metalness: 0.0,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: tex.contactShadowMap,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
  });

  const selectionHalo = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#d8a657'),
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const allMaterials: THREE.Material[] = [
    whiteStonePrimary,
    whiteStoneTrim,
    whiteMetalAccent,
    blackStonePrimary,
    blackStoneTrim,
    blackMetalAccent,
    boardLightTile,
    boardDarkTile,
    boardFrameStone,
    boardTrimBronze,
    hallFloorStone,
    hallPillarStone,
    hallWallStone,
    wroughtIron,
    emberBed,
    contactShadow,
    selectionHalo,
  ];

  return {
    whiteStonePrimary,
    whiteStoneTrim,
    whiteMetalAccent,
    blackStonePrimary,
    blackStoneTrim,
    blackMetalAccent,
    boardLightTile,
    boardDarkTile,
    boardFrameStone,
    boardTrimBronze,
    hallFloorStone,
    hallPillarStone,
    hallWallStone,
    wroughtIron,
    emberBed,
    contactShadow,
    selectionHalo,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
