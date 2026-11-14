import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type MaterialRole = 'primary' | 'trim' | 'metal';

export interface SculptPart {
  geometry: THREE.BufferGeometry;
  role: MaterialRole;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();

/**
 * Ensures any BufferGeometry has clean non-indexed position, normal, and uv attributes
 * so BufferGeometryUtils.mergeGeometries succeeds reliably across Lathe, Extrude, Tube, and Box/Cylinder.
 */
function normalizeForMerge(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = source.index ? source.toNonIndexed() : source.clone();
  if (!geo.attributes.normal) {
    geo.computeVertexNormals();
  }
  const posAttr = geo.attributes.position;
  if (!geo.attributes.uv) {
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      uvs[i * 2] = (x + z) * 0.45 + 0.5;
      uvs[i * 2 + 1] = y * 0.45;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }
  // Remove tangent or extra attributes that might not exist on all primitives
  for (const key of Object.keys(geo.attributes)) {
    if (key !== 'position' && key !== 'normal' && key !== 'uv') {
      geo.deleteAttribute(key);
    }
  }
  return geo;
}

export interface MergedBlueprint {
  primary: THREE.BufferGeometry | null;
  trim: THREE.BufferGeometry | null;
  metal: THREE.BufferGeometry | null;
}

/**
 * Bakes all SculptParts grouped by MaterialRole into 3 merged BufferGeometries
 * so each full-body chess warrior statue renders in just 3 draw calls!
 */
export function bakeMergedBlueprint(parts: SculptPart[]): MergedBlueprint {
  const buckets: Record<MaterialRole, THREE.BufferGeometry[]> = {
    primary: [],
    trim: [],
    metal: [],
  };

  for (const part of parts) {
    const g = normalizeForMerge(part.geometry);
    _pos.set(...(part.position ?? [0, 0, 0]));
    _euler.set(...(part.rotation ?? [0, 0, 0]));
    _quat.setFromEuler(_euler);
    _scale.set(...(part.scale ?? [1, 1, 1]));
    _mat4.compose(_pos, _quat, _scale);
    g.applyMatrix4(_mat4);
    buckets[part.role].push(g);
  }

  const mergeBucket = (list: THREE.BufferGeometry[]) => {
    if (list.length === 0) return null;
    const merged = mergeGeometries(list, false);
    list.forEach((g) => g.dispose());
    return merged;
  };

  return {
    primary: mergeBucket(buckets.primary),
    trim: mergeBucket(buckets.trim),
    metal: mergeBucket(buckets.metal),
  };
}

/**
 * Centered beveled ExtrudeGeometry helper
 */
export function extrudeCenteredZ(
  shape: THREE.Shape,
  depth: number,
  bevelSize = 0.022,
  bevelThickness = 0.022,
  bevelSegments = 2,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelSize > 0,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sculpted medieval fantasy heater/kite shield with raised bevel
 */
export function createFantasyShield(width: number, height: number, depth: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw * 0.92, height * 0.44);
  s.lineTo(-hw * 0.4, height * 0.50);
  s.lineTo(0, height * 0.47);
  s.lineTo(hw * 0.4, height * 0.50);
  s.lineTo(hw * 0.92, height * 0.44);
  s.lineTo(hw, height * 0.14);
  s.quadraticCurveTo(hw * 0.85, -height * 0.28, 0, -height * 0.54);
  s.quadraticCurveTo(-hw * 0.85, -height * 0.28, -hw, height * 0.14);
  s.closePath();
  return extrudeCenteredZ(s, depth, 0.022, 0.024, 2);
}

/**
 * Creates a heavy fantasy broadsword / greatsword blade with fuller ridge taper
 */
export function createFantasySwordBlade(width: number, length: number, thickness: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw * 0.82, length * 0.78);
  s.lineTo(0, length);
  s.lineTo(-hw * 0.82, length * 0.78);
  s.closePath();
  return extrudeCenteredZ(s, thickness, 0.016, 0.018, 1);
}

/**
 * Creates a layered fantasy pauldron dome
 */
export function createPauldronDome(radius: number): THREE.SphereGeometry {
  const geo = new THREE.SphereGeometry(radius, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.56);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a carved stone armored breastplate silhouette
 */
export function createBreastplate(
  waistW: number,
  chestW: number,
  height: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-waistW / 2, 0);
  s.lineTo(waistW / 2, 0);
  s.lineTo(chestW / 2, height * 0.72);
  s.lineTo(chestW * 0.34, height);
  s.lineTo(-chestW * 0.34, height);
  s.lineTo(-chestW / 2, height * 0.72);
  s.closePath();
  return extrudeCenteredZ(s, depth, 0.04, 0.04, 2);
}

/**
 * Creates a sculpted armored leg (thigh cuisse + knee poleyn + shin greave + armored sabaton foot)
 * Grounded cleanly at y = 0 at the sole of the foot, extending upward to height `totalH`.
 */
export function buildArmoredLegParts(
  xOffset: number,
  zOffset: number,
  baseY: number,
  scale = 1.0,
  stanceAngleX = 0,
  stanceSplayZ = 0,
): SculptPart[] {
  const boot = new THREE.BoxGeometry(0.20 * scale, 0.14 * scale, 0.34 * scale);
  const greave = new THREE.CylinderGeometry(0.115 * scale, 0.095 * scale, 0.48 * scale, 8);
  const poleyn = new THREE.OctahedronGeometry(0.125 * scale, 0);
  const cuisse = new THREE.CylinderGeometry(0.135 * scale, 0.11 * scale, 0.44 * scale, 8);

  return [
    {
      geometry: boot,
      role: 'trim',
      position: [xOffset, baseY + 0.07 * scale, zOffset + 0.05 * scale],
      rotation: [0, stanceSplayZ * -0.8, 0],
    },
    {
      geometry: greave,
      role: 'primary',
      position: [xOffset, baseY + 0.34 * scale, zOffset],
      rotation: [stanceAngleX, 0, stanceSplayZ],
    },
    {
      geometry: poleyn,
      role: 'metal',
      position: [xOffset, baseY + 0.58 * scale, zOffset + 0.06 * scale],
      rotation: [0, Math.PI / 4, 0],
    },
    {
      geometry: cuisse,
      role: 'primary',
      position: [xOffset * 0.92, baseY + 0.78 * scale, zOffset],
      rotation: [-stanceAngleX * 0.5, 0, -stanceSplayZ * 0.5],
    },
  ];
}
