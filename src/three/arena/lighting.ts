import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface ArenaLightingRig {
  keyLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  fillLight: THREE.DirectionalLight;
  torchLights: THREE.PointLight[];
  updateTorchFlicker: (elapsedTime: number, enabled: boolean) => void;
  setShadowResolution: (size: number, enabled: boolean) => void;
  dispose: () => void;
}

export function createArenaLighting(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
): ArenaLightingRig {
  // Background & Exponential Cavern Fog matched seamlessly
  const fogColor = new THREE.Color('#090b10');
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2('#090b10', 0.0175);

  // Zero-dependency PMREM studio reflections so brushed bronze & wrought-iron bevels gleam realistically
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRenderTarget.texture;
  pmremGenerator.dispose();

  // 1. Cool Moonlit Clerestory Key Light (Primary shadow caster, tightly bounded to chessboard)
  const keyLight = new THREE.DirectionalLight(0x9ec0e8, 1.85);
  keyLight.position.set(11, 22, 13);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 4;
  keyLight.shadow.camera.far = 48;
  keyLight.shadow.camera.left = -13.5;
  keyLight.shadow.camera.right = 13.5;
  keyLight.shadow.camera.top = 13.5;
  keyLight.shadow.camera.bottom = -13.5;
  keyLight.shadow.bias = -0.00045;
  keyLight.shadow.normalBias = 0.025;
  scene.add(keyLight);

  // 2. Cool Sky / Warm Stone Ground Hemisphere Fill (avoids flat white AmbientLight)
  const hemiLight = new THREE.HemisphereLight(0x6c84a8, 0x261a14, 0.9);
  hemiLight.position.set(0, 26, 0);
  scene.add(hemiLight);

  // 3. Soft Opposite Rim/Fill Light (preserves carved detail on dark granite pieces)
  const fillLight = new THREE.DirectionalLight(0x7c93b5, 0.55);
  fillLight.position.set(-14, 12, -16);
  scene.add(fillLight);

  // 4. Four Warm Firelight PointLights at the inner corner braziers (no shadow maps for mobile/PC 30+ FPS budget)
  const torchPositions: Array<[number, number, number]> = [
    [-11.6, 2.3, -11.6],
    [11.6, 2.3, -11.6],
    [-11.6, 2.3, 11.6],
    [11.6, 2.3, 11.6],
  ];
  const baseIntensity = 26;
  const torchLights = torchPositions.map(([x, y, z]) => {
    const light = new THREE.PointLight(0xff8e3c, baseIntensity, 28, 1.75);
    light.position.set(x, y, z);
    scene.add(light);
    return light;
  });

  return {
    keyLight,
    hemiLight,
    fillLight,
    torchLights,
    updateTorchFlicker: (elapsedTime: number, enabled: boolean) => {
      if (!enabled) {
        for (let i = 0; i < torchLights.length; i++) {
          torchLights[i].intensity = 0;
        }
        return;
      }
      for (let i = 0; i < torchLights.length; i++) {
        const phase = i * 1.9;
        const wave =
          Math.sin(elapsedTime * 5.8 + phase) * 2.2 +
          Math.sin(elapsedTime * 11.3 + phase * 0.7) * 1.1;
        torchLights[i].intensity = baseIntensity + wave;
      }
    },
    setShadowResolution: (size: number, enabled: boolean) => {
      keyLight.castShadow = !isSoftwareGl && enabled;
      if (keyLight.shadow.mapSize.width !== size) {
        keyLight.shadow.mapSize.set(size, size);
        if (keyLight.shadow.map) {
          keyLight.shadow.map.dispose();
          keyLight.shadow.map = null;
        }
      }
    },
    dispose: () => {
      envRenderTarget.dispose();
      keyLight.shadow.map?.dispose();
    },
  };
}
