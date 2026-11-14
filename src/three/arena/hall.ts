import * as THREE from 'three';
import { ArcaneMaterialLibrary } from '../materials';
import { ProceduralTextureSet } from '../textures';

export interface BrazierFlameHandle {
  sprites: THREE.Sprite[];
  baseScales: number[];
  phase: number;
}

export interface GothicHallAssembly {
  group: THREE.Group;
  flames: BrazierFlameHandle[];
  setFlamesVisible: (visible: boolean) => void;
  updateFlames: (elapsedTime: number) => void;
  dispose: () => void;
}

export function createGothicHall(
  materials: ArcaneMaterialLibrary,
  textures: ProceduralTextureSet,
): GothicHallAssembly {
  const group = new THREE.Group();
  group.name = 'gothic-underground-hall';

  const geometries: THREE.BufferGeometry[] = [];
  const spriteMaterials: THREE.SpriteMaterial[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // 1. Flagstone Cavern Floor at y = -0.58 (flush under lower dais)
  const floorGeo = trackGeo(new THREE.PlaneGeometry(96, 96));
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, materials.hallFloorStone);
  floor.position.y = -0.58;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. Massive Gothic Stone Pillars (12 clustered piers along left/right flanks & far gallery)
  const pillarPositions: Array<[number, number]> = [
    [-16.5, -16],
    [-16.5, -5.5],
    [-16.5, 5.5],
    [-16.5, 16],
    [16.5, -16],
    [16.5, -5.5],
    [16.5, 5.5],
    [16.5, 16],
    [-8.5, -24],
    [8.5, -24],
    [-8.5, 24],
    [8.5, 24],
  ];

  const basePlinthGeo = trackGeo(new THREE.BoxGeometry(3.2, 1.3, 3.2));
  const shaftCoreGeo = trackGeo(new THREE.CylinderGeometry(0.95, 1.05, 17.5, 10));
  const ribShaftGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.30, 17.5, 8));
  const capitalGeo = trackGeo(new THREE.CylinderGeometry(1.65, 1.02, 1.15, 8));

  const count = pillarPositions.length;
  const plinthInst = new THREE.InstancedMesh(basePlinthGeo, materials.hallPillarStone, count);
  const shaftInst = new THREE.InstancedMesh(shaftCoreGeo, materials.hallPillarStone, count);
  const capitalInst = new THREE.InstancedMesh(capitalGeo, materials.hallPillarStone, count);
  const ribInst = new THREE.InstancedMesh(ribShaftGeo, materials.boardFrameStone, count * 4);

  plinthInst.receiveShadow = true;
  shaftInst.castShadow = false; // Outside chessboard shadow frustum; saves GPU shadow passes
  shaftInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  pillarPositions.forEach(([px, pz], idx) => {
    dummy.position.set(px, 0.07, pz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    plinthInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(px, 9.4, pz);
    dummy.updateMatrix();
    shaftInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(px, 18.6, pz);
    dummy.rotation.set(0, Math.PI / 8, 0);
    dummy.updateMatrix();
    capitalInst.setMatrixAt(idx, dummy.matrix);

    // 4 engaged Gothic colonnette shafts around each pier
    for (let r = 0; r < 4; r++) {
      const a = (r / 4) * Math.PI * 2;
      dummy.position.set(px + Math.cos(a) * 0.92, 9.4, pz + Math.sin(a) * 0.92);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      ribInst.setMatrixAt(idx * 4 + r, dummy.matrix);
    }
  });

  [plinthInst, shaftInst, capitalInst, ribInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    group.add(inst);
  });

  // 3. Overhead Pointed Gothic Vault Ribs spanning across X = -16.5 to +16.5
  const archZRows = [-16, -5.5, 5.5, 16];
  const createVaultHalfCurve = (zPos: number, signX: number) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(signX * 16.5, 18.8, zPos),
      new THREE.Vector3(signX * 12.2, 23.8, zPos),
      new THREE.Vector3(signX * 5.2, 27.6, zPos),
      new THREE.Vector3(0, 29.2, zPos),
    ]);

  archZRows.forEach((zPos) => {
    for (const signX of [-1, 1]) {
      const ribGeo = trackGeo(new THREE.TubeGeometry(createVaultHalfCurve(zPos, signX), 14, 0.42, 6, false));
      const ribMesh = new THREE.Mesh(ribGeo, materials.hallPillarStone);
      group.add(ribMesh);
    }
  });

  // Longitudinal Gothic Arcade Arches connecting side pillars along Z
  for (const xSide of [-16.5, 16.5]) {
    const pairs: Array<[number, number]> = [
      [-16, -5.5],
      [-5.5, 5.5],
      [5.5, 16],
    ];
    pairs.forEach(([zA, zB]) => {
      const midZ = (zA + zB) / 2;
      const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xSide, 18.5, zA),
        new THREE.Vector3(xSide, 22.8, midZ - 2.0),
        new THREE.Vector3(xSide, 24.4, midZ),
        new THREE.Vector3(xSide, 22.8, midZ + 2.0),
        new THREE.Vector3(xSide, 18.5, zB),
      ]);
      const archGeo = trackGeo(new THREE.TubeGeometry(archCurve, 14, 0.44, 6, false));
      group.add(new THREE.Mesh(archGeo, materials.hallPillarStone));
    });
  }

  // 4. Ancient Carved Perimeter Cavern Walls & Buttresses (enclosing the vast hall)
  const sideWallGeo = trackGeo(new THREE.BoxGeometry(1.6, 28, 72));
  const endWallGeo = trackGeo(new THREE.BoxGeometry(58, 28, 1.8));
  const buttressGeo = trackGeo(new THREE.BoxGeometry(2.2, 26, 2.2));

  const westWall = new THREE.Mesh(sideWallGeo, materials.hallWallStone);
  westWall.position.set(-25.5, 13.4, 0);
  const eastWall = new THREE.Mesh(sideWallGeo, materials.hallWallStone);
  eastWall.position.set(25.5, 13.4, 0);
  const northWall = new THREE.Mesh(endWallGeo, materials.hallWallStone);
  northWall.position.set(0, 13.4, -33.5);
  const southWall = new THREE.Mesh(endWallGeo, materials.hallWallStone);
  southWall.position.set(0, 13.4, 33.5);
  group.add(westWall, eastWall, northWall, southWall);

  // Wall pilasters along side walls for architectural relief
  const wallPilasters = new THREE.InstancedMesh(buttressGeo, materials.hallPillarStone, 10);
  let wp = 0;
  for (const xW of [-24.2, 24.2]) {
    for (const zW of [-21, -10.5, 0, 10.5, 21]) {
      dummy.position.set(xW, 12.4, zW);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      wallPilasters.setMatrixAt(wp++, dummy.matrix);
    }
  }
  wallPilasters.instanceMatrix.needsUpdate = true;
  wallPilasters.computeBoundingSphere();
  group.add(wallPilasters);

  // 5. Monumental Wrought-Iron & Stone Fire Braziers (8 total: 4 board corners + 4 colonnade)
  const brazierCoords: Array<[number, number, number]> = [
    // 4 inner corner braziers flanking the chessboard dais
    [-11.6, -0.58, -11.6],
    [11.6, -0.58, -11.6],
    [-11.6, -0.58, 11.6],
    [11.6, -0.58, 11.6],
    // 4 outer colonnade braziers adding depth in the hall
    [-14.6, -0.58, -5.5],
    [14.6, -0.58, -5.5],
    [-14.6, -0.58, 5.5],
    [14.6, -0.58, 5.5],
  ];

  const brazierPedestalGeo = trackGeo(new THREE.CylinderGeometry(0.56, 0.78, 1.35, 8));
  const brazierBowlGeo = trackGeo(new THREE.CylinderGeometry(0.86, 0.42, 0.56, 8));
  const brazierRimGeo = trackGeo(new THREE.TorusGeometry(0.85, 0.08, 6, 8));
  const emberGeo = trackGeo(new THREE.SphereGeometry(0.62, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5));

  const flames: BrazierFlameHandle[] = [];
  const flameGroup = new THREE.Group();
  group.add(flameGroup);

  brazierCoords.forEach(([bx, by, bz], i) => {
    const pedestal = new THREE.Mesh(brazierPedestalGeo, materials.hallPillarStone);
    pedestal.position.set(bx, by + 0.675, bz);
    pedestal.receiveShadow = true;
    group.add(pedestal);

    const bowl = new THREE.Mesh(brazierBowlGeo, materials.wroughtIron);
    bowl.position.set(bx, by + 1.56, bz);
    group.add(bowl);

    const rim = new THREE.Mesh(brazierRimGeo, materials.wroughtIron);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(bx, by + 1.84, bz);
    group.add(rim);

    const embers = new THREE.Mesh(emberGeo, materials.emberBed);
    embers.position.set(bx, by + 1.66, bz);
    group.add(embers);

    // Multi-layered soft flame sprites (cheap, zero geometry overhead, atmospheric)
    const sprites: THREE.Sprite[] = [];
    const baseScales = [2.1, 1.35, 0.9];
    const offsets: Array<[number, number, number]> = [
      [0, by + 2.38, 0],
      [-0.14, by + 2.52, 0.10],
      [0.14, by + 2.46, -0.10],
    ];

    baseScales.forEach((sc, sIdx) => {
      const mat = new THREE.SpriteMaterial({
        map: textures.flameGlowMap,
        color: sIdx === 0 ? 0xff933b : 0xffcd78,
        transparent: true,
        opacity: sIdx === 0 ? 0.72 : 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      spriteMaterials.push(mat);

      const sprite = new THREE.Sprite(mat);
      sprite.position.set(bx + offsets[sIdx][0], offsets[sIdx][1], bz + offsets[sIdx][2]);
      sprite.scale.set(sc * 0.72, sc * 1.25, 1);
      flameGroup.add(sprite);
      sprites.push(sprite);
    });

    flames.push({
      sprites,
      baseScales,
      phase: i * 1.37,
    });
  });

  return {
    group,
    flames,
    setFlamesVisible: (visible: boolean) => {
      flameGroup.visible = visible;
    },
    updateFlames: (elapsedTime: number) => {
      for (let i = 0; i < flames.length; i++) {
        const f = flames[i];
        const t = elapsedTime * 5.2 + f.phase;
        const flickerA = 0.88 + Math.sin(t) * 0.08 + Math.sin(t * 2.3) * 0.05;
        const flickerB = 0.90 + Math.cos(t * 1.4) * 0.09;

        f.sprites[0].scale.set(
          f.baseScales[0] * 0.72 * flickerB,
          f.baseScales[0] * 1.25 * flickerA,
          1,
        );
        f.sprites[1].scale.set(
          f.baseScales[1] * 0.68 * flickerA,
          f.baseScales[1] * 1.32 * flickerB,
          1,
        );
        f.sprites[2].scale.set(
          f.baseScales[2] * 0.7 * flickerB,
          f.baseScales[2] * 1.2 * flickerA,
          1,
        );
      }
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      spriteMaterials.forEach((m) => m.dispose());
    },
  };
}
