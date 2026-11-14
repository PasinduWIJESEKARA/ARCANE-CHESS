import * as THREE from 'three';
import { ArmyColor, PieceArchetype } from '../../types/arcane';
import { ArcaneMaterialLibrary } from '../materials';
import { createChessPieceGroup } from '../pieces/archetypes';

export const SQUARE_SIZE = 2.2;
export const BOARD_SPAN = SQUARE_SIZE * 8; // 17.6

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function squareToWorld(fileIdx: number, rankIdx: number): [number, number] {
  // fileIdx 0..7 (a..h -> -X to +X)
  // rankIdx 0..7 (1..8 -> +Z to -Z so White is at +Z facing -Z)
  const x = (fileIdx - 3.5) * SQUARE_SIZE;
  const z = (3.5 - rankIdx) * SQUARE_SIZE;
  return [x, z];
}

export interface BoardAssembly {
  group: THREE.Group;
  piecesGroup: THREE.Group;
  selectionHalo: THREE.Mesh;
  pieces: THREE.Group[];
  dispose: () => void;
}

export function createMonumentalBoard(materials: ArcaneMaterialLibrary): BoardAssembly {
  const group = new THREE.Group();
  group.name = 'monumental-chessboard';
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geometriesToDispose.push(g);
    return g;
  };

  // Sub-bed mortar slab under the tiles (top at y = -0.055)
  const subBedGeo = track(new THREE.BoxGeometry(BOARD_SPAN + 0.3, 0.16, BOARD_SPAN + 0.3));
  const subBed = new THREE.Mesh(subBedGeo, materials.boardFrameStone);
  subBed.position.y = -0.135;
  subBed.receiveShadow = true;
  group.add(subBed);

  // 64 individual slightly chamfered stone tiles (top surface strictly at y = 0)
  const tileGeo = track(new THREE.BoxGeometry(SQUARE_SIZE - 0.055, 0.06, SQUARE_SIZE - 0.055));
  const lightTiles = new THREE.InstancedMesh(tileGeo, materials.boardLightTile, 32);
  const darkTiles = new THREE.InstancedMesh(tileGeo, materials.boardDarkTile, 32);
  lightTiles.receiveShadow = true;
  darkTiles.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();
  let lIdx = 0;
  let dIdx = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const [x, z] = squareToWorld(file, rank);
      dummy.position.set(x, -0.03, z);
      dummy.rotation.set(0, ((rank * 7 + file * 3) % 4) * (Math.PI / 2), 0);
      dummy.updateMatrix();

      // Standard chess orientation: a1 (file 0, rank 0) is dark
      const isLight = (file + rank) % 2 === 1;
      // Subtle per-tile stone variation (±4%)
      const hash = Math.sin(file * 12.9898 + rank * 78.233) * 43758.5453;
      const frac = hash - Math.floor(hash);
      const shade = 0.94 + frac * 0.11;

      if (isLight) {
        lightTiles.setMatrixAt(lIdx, dummy.matrix);
        tintColor.setRGB(shade, shade * 0.99, shade * 0.97);
        lightTiles.setColorAt(lIdx, tintColor);
        lIdx++;
      } else {
        darkTiles.setMatrixAt(dIdx, dummy.matrix);
        tintColor.setRGB(shade, shade, shade * 1.03);
        darkTiles.setColorAt(dIdx, tintColor);
        dIdx++;
      }
    }
  }
  lightTiles.instanceMatrix.needsUpdate = true;
  if (lightTiles.instanceColor) lightTiles.instanceColor.needsUpdate = true;
  lightTiles.computeBoundingSphere();

  darkTiles.instanceMatrix.needsUpdate = true;
  if (darkTiles.instanceColor) darkTiles.instanceColor.needsUpdate = true;
  darkTiles.computeBoundingSphere();

  group.add(lightTiles, darkTiles);

  // Carved stone border frame flush around the 8x8 playing field
  const borderWidth = 1.15;
  const outerSpan = BOARD_SPAN + borderWidth * 2;
  const frameDepth = 0.24;

  const hBarGeo = track(new THREE.BoxGeometry(outerSpan, frameDepth, borderWidth));
  const vBarGeo = track(new THREE.BoxGeometry(borderWidth, frameDepth, BOARD_SPAN));

  const northBorder = new THREE.Mesh(hBarGeo, materials.boardFrameStone);
  northBorder.position.set(0, -0.11, -(BOARD_SPAN / 2 + borderWidth / 2));
  northBorder.receiveShadow = true;

  const southBorder = new THREE.Mesh(hBarGeo, materials.boardFrameStone);
  southBorder.position.set(0, -0.11, BOARD_SPAN / 2 + borderWidth / 2);
  southBorder.receiveShadow = true;

  const westBorder = new THREE.Mesh(vBarGeo, materials.boardFrameStone);
  westBorder.position.set(-(BOARD_SPAN / 2 + borderWidth / 2), -0.11, 0);
  westBorder.receiveShadow = true;

  const eastBorder = new THREE.Mesh(vBarGeo, materials.boardFrameStone);
  eastBorder.position.set(BOARD_SPAN / 2 + borderWidth / 2, -0.11, 0);
  eastBorder.receiveShadow = true;

  group.add(northBorder, southBorder, westBorder, eastBorder);

  // Thin tarnished bronze inlay trim framing the 8x8 grid
  const trimHGeo = track(new THREE.BoxGeometry(BOARD_SPAN + 0.28, 0.04, 0.09));
  const trimVGeo = track(new THREE.BoxGeometry(0.09, 0.04, BOARD_SPAN + 0.28));
  const trimOffset = BOARD_SPAN / 2 + 0.09;

  const trimN = new THREE.Mesh(trimHGeo, materials.boardTrimBronze);
  trimN.position.set(0, 0.005, -trimOffset);
  const trimS = new THREE.Mesh(trimHGeo, materials.boardTrimBronze);
  trimS.position.set(0, 0.005, trimOffset);
  const trimW = new THREE.Mesh(trimVGeo, materials.boardTrimBronze);
  trimW.position.set(-trimOffset, 0.005, 0);
  const trimE = new THREE.Mesh(trimVGeo, materials.boardTrimBronze);
  trimE.position.set(trimOffset, 0.005, 0);
  group.add(trimN, trimS, trimW, trimE);

  // Stepped ceremonial stone dais supporting the chessboard (down to hall floor at y = -0.58)
  const daisUpperGeo = track(new THREE.BoxGeometry(outerSpan + 1.5, 0.18, outerSpan + 1.5));
  const daisUpper = new THREE.Mesh(daisUpperGeo, materials.hallPillarStone);
  daisUpper.position.y = -0.31;
  daisUpper.receiveShadow = true;

  const daisLowerGeo = track(new THREE.BoxGeometry(outerSpan + 3.1, 0.18, outerSpan + 3.1));
  const daisLower = new THREE.Mesh(daisLowerGeo, materials.hallPillarStone);
  daisLower.position.y = -0.49;
  daisLower.receiveShadow = true;

  group.add(daisUpper, daisLower);

  // Subtle selection halo ring (placed cleanly at y = 0.015 when a piece is inspected)
  const haloGeo = track(new THREE.RingGeometry(0.84, 0.98, 8));
  haloGeo.rotateX(-Math.PI / 2);
  haloGeo.rotateY(Math.PI / 8);
  const selectionHalo = new THREE.Mesh(haloGeo, materials.selectionHalo);
  selectionHalo.position.y = 0.015;
  selectionHalo.visible = false;
  group.add(selectionHalo);

  // Populate initial 32 sculpted chess pieces
  const piecesGroup = new THREE.Group();
  piecesGroup.name = 'chess-armies';
  group.add(piecesGroup);

  const pieces: THREE.Group[] = [];
  const backRank: PieceArchetype[] = [
    'rook',
    'knight',
    'bishop',
    'queen',
    'king',
    'bishop',
    'knight',
    'rook',
  ];

  const spawnArmy = (army: ArmyColor) => {
    const backRankIdx = army === 'white' ? 0 : 7;
    const pawnRankIdx = army === 'white' ? 1 : 6;
    const facingY = army === 'white' ? Math.PI : 0;

    for (let f = 0; f < 8; f++) {
      // Back rank piece
      const arch = backRank[f];
      const square = `${FILES[f]}${backRankIdx + 1}`;
      const [wx, wz] = squareToWorld(f, backRankIdx);
      const piece = createChessPieceGroup(
        arch,
        army,
        materials,
        `${army}-${arch}-${square}`,
        square,
      );
      piece.position.set(wx, 0, wz);
      piece.rotation.y = facingY;
      piecesGroup.add(piece);
      pieces.push(piece);

      // Pawn
      const pSquare = `${FILES[f]}${pawnRankIdx + 1}`;
      const [px, pz] = squareToWorld(f, pawnRankIdx);
      const pawn = createChessPieceGroup(
        'pawn',
        army,
        materials,
        `${army}-pawn-${pSquare}`,
        pSquare,
      );
      pawn.position.set(px, 0, pz);
      pawn.rotation.y = facingY;
      piecesGroup.add(pawn);
      pieces.push(pawn);
    }
  };

  spawnArmy('white');
  spawnArmy('black');

  return {
    group,
    piecesGroup,
    selectionHalo,
    pieces,
    dispose: () => {
      geometriesToDispose.forEach((g) => g.dispose());
    },
  };
}
