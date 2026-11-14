import * as THREE from 'three';
import { ProceduralTextureSet } from '../textures';

export interface DustMotesSystem {
  points: THREE.Points;
  update: (delta: number, elapsedTime: number) => void;
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

export function createAtmosphericDust(textures: ProceduralTextureSet): DustMotesSystem {
  const count = 180;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = 0.4 + Math.random() * 13;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
    speeds[i] = 0.14 + Math.random() * 0.22;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: textures.dustMoteMap,
    color: 0xdccbb0,
    size: 0.22,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'atmospheric-dust-motes';

  return {
    points,
    update: (delta: number, elapsedTime: number) => {
      if (!points.visible) return;
      const attr = geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        arr[idx + 1] += speeds[i] * delta;
        arr[idx] += Math.sin(elapsedTime * 0.6 + phases[i]) * 0.08 * delta;
        if (arr[idx + 1] > 13.8) {
          arr[idx + 1] = 0.35;
        }
      }
      attr.needsUpdate = true;
    },
    setEnabled: (enabled: boolean) => {
      points.visible = enabled;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
