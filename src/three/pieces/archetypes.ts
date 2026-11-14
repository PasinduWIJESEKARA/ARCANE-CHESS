import * as THREE from 'three';
import { ArmyColor, PieceArchetype } from '../../types/arcane';
import { ArcaneMaterialLibrary } from '../materials';
import { getPlinthGeometries } from './plinth';
import {
  bakeMergedBlueprint,
  buildArmoredLegParts,
  createBreastplate,
  createFantasyShield,
  createFantasySwordBlade,
  createPauldronDome,
  extrudeCenteredZ,
  MergedBlueprint,
  SculptPart,
} from './sculptHelpers';

const mergedBlueprintCache = new Map<PieceArchetype, MergedBlueprint>();
const hitboxGeometryCache = new Map<PieceArchetype, THREE.BufferGeometry>();

function buildKingSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Sculpted stone mail skirt & armored tassets
  const kilt = t(new THREE.CylinderGeometry(0.32, 0.44, 0.44, 10));
  const belt = t(new THREE.CylinderGeometry(0.33, 0.34, 0.14, 10));
  const tassetShape = new THREE.Shape();
  tassetShape.moveTo(-0.16, 0);
  tassetShape.lineTo(0.16, 0);
  tassetShape.lineTo(0.19, -0.34);
  tassetShape.lineTo(0, -0.42);
  tassetShape.lineTo(-0.19, -0.34);
  tassetShape.closePath();
  const tasset = t(extrudeCenteredZ(tassetShape, 0.08, 0.018, 0.018, 1));

  // Broad royal cuirass & fur/stone shoulder mantle
  const cuirass = t(createBreastplate(0.62, 0.92, 0.86, 0.50));
  const mantle = t(new THREE.CylinderGeometry(0.56, 0.62, 0.24, 10));
  const pauldron = t(createPauldronDome(0.28));

  // Sculpted kingly head: angular carved face + bearded jaw + open war-helm + 5-point fantasy crown
  const headCore = t(new THREE.CylinderGeometry(0.19, 0.18, 0.34, 8));
  const browPlate = t(new THREE.BoxGeometry(0.32, 0.12, 0.14));
  const beard = t(
    extrudeCenteredZ(
      (() => {
        const s = new THREE.Shape();
        s.moveTo(-0.14, 0);
        s.lineTo(0.14, 0);
        s.lineTo(0.10, -0.24);
        s.lineTo(0, -0.32);
        s.lineTo(-0.10, -0.24);
        s.closePath();
        return s;
      })(),
      0.16,
      0.018,
      0.018,
      1,
    ),
  );
  const cheekWing = t(new THREE.BoxGeometry(0.06, 0.30, 0.20));
  const crownRim = t(new THREE.CylinderGeometry(0.24, 0.21, 0.15, 8));
  const crownSpire = t(new THREE.ConeGeometry(0.065, 0.30, 4));
  const crownCenterSpire = t(new THREE.ConeGeometry(0.08, 0.38, 4));

  // Articulated arms gripping the two-handed greatsword
  const upperArm = t(new THREE.CylinderGeometry(0.115, 0.105, 0.44, 8));
  const forearm = t(new THREE.CylinderGeometry(0.10, 0.115, 0.46, 8));
  const gauntlet = t(new THREE.BoxGeometry(0.16, 0.16, 0.18));

  // Massive royal two-handed greatsword planted between boots
  const swordBlade = t(createFantasySwordBlade(0.22, 1.56, 0.055));
  const crossguard = t(new THREE.BoxGeometry(0.68, 0.09, 0.11));
  const grip = t(new THREE.CylinderGeometry(0.048, 0.052, 0.40, 8));
  const pommel = t(new THREE.OctahedronGeometry(0.10, 0));

  const parts: SculptPart[] = [
    { geometry: plinths.octagonalPlinth, role: 'primary' },
    { geometry: plinths.octagonalCollar, role: 'metal' },
    ...buildArmoredLegParts(-0.23, 0.0, 0.34, 1.05, 0.04, 0.05),
    ...buildArmoredLegParts(0.23, 0.0, 0.34, 1.05, 0.04, -0.05),
    { geometry: kilt, role: 'trim', position: [0, 1.32, 0] },
    { geometry: belt, role: 'metal', position: [0, 1.48, 0] },
    { geometry: tasset, role: 'primary', position: [-0.23, 1.44, 0.22], rotation: [-0.14, 0.15, 0] },
    { geometry: tasset, role: 'primary', position: [0.23, 1.44, 0.22], rotation: [-0.14, -0.15, 0] },
    { geometry: cuirass, role: 'primary', position: [0, 1.50, 0.02] },
    { geometry: mantle, role: 'trim', position: [0, 2.26, -0.04] },
    { geometry: pauldron, role: 'metal', position: [-0.52, 2.34, 0], rotation: [0, 0, 0.26], scale: [1.18, 1.0, 1.1] },
    { geometry: pauldron, role: 'metal', position: [0.52, 2.34, 0], rotation: [0, 0, -0.26], scale: [1.18, 1.0, 1.1] },
    // Arms reaching forward to sword hilt
    { geometry: upperArm, role: 'trim', position: [-0.46, 2.08, 0.08], rotation: [-0.42, 0, -0.25] },
    { geometry: forearm, role: 'primary', position: [-0.28, 1.98, 0.34], rotation: [-1.18, 0, -0.58] },
    { geometry: gauntlet, role: 'metal', position: [-0.07, 2.05, 0.45] },
    { geometry: upperArm, role: 'trim', position: [0.46, 2.08, 0.08], rotation: [-0.42, 0, 0.25] },
    { geometry: forearm, role: 'primary', position: [0.28, 1.98, 0.34], rotation: [-1.18, 0, 0.58] },
    { geometry: gauntlet, role: 'metal', position: [0.07, 2.16, 0.45] },
    // Sculpted face, beard, helm, crown
    { geometry: headCore, role: 'trim', position: [0, 2.66, 0.02] },
    { geometry: browPlate, role: 'metal', position: [0, 2.75, 0.16] },
    { geometry: beard, role: 'primary', position: [0, 2.60, 0.17] },
    { geometry: cheekWing, role: 'metal', position: [-0.21, 2.68, 0.06], rotation: [0, 0.25, 0] },
    { geometry: cheekWing, role: 'metal', position: [0.21, 2.68, 0.06], rotation: [0, -0.25, 0] },
    { geometry: crownRim, role: 'metal', position: [0, 2.90, 0.02] },
    { geometry: crownCenterSpire, role: 'metal', position: [0, 3.16, 0.20], rotation: [0.16, 0, 0] },
    // Greatsword planted vertically at center front
    { geometry: swordBlade, role: 'metal', position: [0, 1.94, 0.45], rotation: [Math.PI, 0, 0] },
    { geometry: crossguard, role: 'metal', position: [0, 1.94, 0.45] },
    { geometry: grip, role: 'trim', position: [0, 2.14, 0.45] },
    { geometry: pommel, role: 'metal', position: [0, 2.38, 0.45] },
  ];

  for (let i = 1; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    parts.push({
      geometry: crownSpire,
      role: 'metal',
      position: [Math.sin(a) * 0.20, 3.10, 0.02 + Math.cos(a) * 0.20],
      rotation: [Math.cos(a) * 0.15, a, -Math.sin(a) * 0.15],
    });
  }

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function buildQueenSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Monumental Gothic War-Throne (for future combat choreography!)
  const throneSeatBlock = t(new THREE.BoxGeometry(1.06, 0.68, 0.92));
  const throneArmrest = t(new THREE.BoxGeometry(0.18, 0.34, 0.86));
  const throneBackShape = new THREE.Shape();
  throneBackShape.moveTo(-0.56, 0);
  throneBackShape.lineTo(0.56, 0);
  throneBackShape.lineTo(0.60, 1.65);
  throneBackShape.lineTo(0.36, 2.05);
  throneBackShape.lineTo(0.22, 1.82);
  throneBackShape.lineTo(0, 2.32);
  throneBackShape.lineTo(-0.22, 1.82);
  throneBackShape.lineTo(-0.36, 2.05);
  throneBackShape.lineTo(-0.60, 1.65);
  throneBackShape.closePath();
  const throneBack = t(extrudeCenteredZ(throneBackShape, 0.18, 0.03, 0.03, 2));
  const throneFinial = t(new THREE.ConeGeometry(0.08, 0.38, 4));

  // Seated Warrior-Queen Anatomy
  const boot = t(new THREE.BoxGeometry(0.16, 0.12, 0.30));
  const shin = t(new THREE.CylinderGeometry(0.095, 0.08, 0.56, 8));
  const knee = t(new THREE.OctahedronGeometry(0.10, 0));
  const thigh = t(new THREE.CylinderGeometry(0.115, 0.095, 0.48, 8));
  const drapedSkirt = t(new THREE.CylinderGeometry(0.32, 0.46, 0.72, 10));
  const waist = t(new THREE.CylinderGeometry(0.20, 0.25, 0.22, 8));
  const cuirass = t(createBreastplate(0.40, 0.62, 0.62, 0.34));
  const highCollarShape = new THREE.Shape();
  highCollarShape.moveTo(-0.30, 0);
  highCollarShape.lineTo(0.30, 0);
  highCollarShape.lineTo(0.42, 0.36);
  highCollarShape.lineTo(0, 0.44);
  highCollarShape.lineTo(-0.42, 0.36);
  highCollarShape.closePath();
  const highCollar = t(extrudeCenteredZ(highCollarShape, 0.08, 0.018, 0.018, 1));
  const pauldron = t(createPauldronDome(0.20));

  // Head & Crescent-Horned Diadem
  const head = t(new THREE.CylinderGeometry(0.15, 0.14, 0.30, 8));
  const veil = t(new THREE.CylinderGeometry(0.18, 0.24, 0.36, 8));
  const diademBand = t(new THREE.CylinderGeometry(0.19, 0.17, 0.10, 8));
  const diademHorn = t(new THREE.ConeGeometry(0.048, 0.34, 4));
  const diademCrest = t(new THREE.OctahedronGeometry(0.085, 0));

  // Arms & Ceremonial War-Mace / Battle-Scepter
  const arm = t(new THREE.CylinderGeometry(0.078, 0.088, 0.54, 8));
  const scepterShaft = t(new THREE.CylinderGeometry(0.036, 0.042, 2.15, 8));
  const scepterHead = t(new THREE.OctahedronGeometry(0.16, 0));
  const scepterFlange = t(new THREE.BoxGeometry(0.34, 0.22, 0.06));

  const parts: SculptPart[] = [
    { geometry: plinths.octagonalPlinth, role: 'primary' },
    { geometry: plinths.octagonalCollar, role: 'metal' },
    // Monumental Throne
    { geometry: throneSeatBlock, role: 'trim', position: [0, 0.68, -0.14] },
    { geometry: throneArmrest, role: 'primary', position: [-0.46, 1.15, -0.12] },
    { geometry: throneArmrest, role: 'primary', position: [0.46, 1.15, -0.12] },
    { geometry: throneBack, role: 'primary', position: [0, 0.95, -0.48] },
    { geometry: throneFinial, role: 'metal', position: [-0.36, 3.16, -0.48] },
    { geometry: throneFinial, role: 'metal', position: [0.36, 3.16, -0.48] },
    { geometry: throneFinial, role: 'metal', position: [0, 3.42, -0.48] },
    // Seated Legs & Draped War-Skirt
    { geometry: boot, role: 'metal', position: [-0.19, 0.40, 0.44] },
    { geometry: boot, role: 'metal', position: [0.19, 0.40, 0.44] },
    { geometry: shin, role: 'primary', position: [-0.19, 0.72, 0.38], rotation: [-0.12, 0, 0] },
    { geometry: shin, role: 'primary', position: [0.19, 0.72, 0.38], rotation: [-0.12, 0, 0] },
    { geometry: knee, role: 'metal', position: [-0.19, 1.02, 0.36] },
    { geometry: knee, role: 'metal', position: [0.19, 1.02, 0.36] },
    { geometry: thigh, role: 'primary', position: [-0.19, 1.04, 0.12], rotation: [Math.PI / 2, 0, 0] },
    { geometry: thigh, role: 'primary', position: [0.19, 1.04, 0.12], rotation: [Math.PI / 2, 0, 0] },
    { geometry: drapedSkirt, role: 'trim', position: [0, 0.76, 0.08] },
    // Upper Body Armor
    { geometry: waist, role: 'metal', position: [0, 1.18, -0.06] },
    { geometry: cuirass, role: 'primary', position: [0, 1.24, -0.04] },
    { geometry: highCollar, role: 'metal', position: [0, 1.84, -0.20], rotation: [-0.18, 0, 0] },
    { geometry: pauldron, role: 'metal', position: [-0.36, 1.82, -0.04], rotation: [0, 0, 0.32] },
    { geometry: pauldron, role: 'metal', position: [0.36, 1.82, -0.04], rotation: [0, 0, -0.32] },
    // Arms (left resting on armrest, right holding upright battle-scepter)
    { geometry: arm, role: 'trim', position: [-0.42, 1.48, 0.04], rotation: [-0.55, 0, -0.20] },
    { geometry: arm, role: 'trim', position: [0.42, 1.54, 0.14], rotation: [-0.75, 0, 0.25] },
    // Head & Diadem
    { geometry: veil, role: 'trim', position: [0, 2.10, -0.08] },
    { geometry: head, role: 'primary', position: [0, 2.12, 0.02] },
    { geometry: diademBand, role: 'metal', position: [0, 2.30, 0.02] },
    { geometry: diademHorn, role: 'metal', position: [-0.17, 2.48, 0.08], rotation: [0.1, 0, 0.38] },
    { geometry: diademHorn, role: 'metal', position: [0.17, 2.48, 0.08], rotation: [0.1, 0, -0.38] },
    { geometry: diademCrest, role: 'metal', position: [0, 2.46, 0.14] },
    // Battle-Scepter
    { geometry: scepterShaft, role: 'trim', position: [0.56, 1.42, 0.26] },
    { geometry: scepterHead, role: 'metal', position: [0.56, 2.55, 0.26] },
    { geometry: scepterFlange, role: 'metal', position: [0.56, 2.55, 0.26] },
    { geometry: scepterFlange, role: 'metal', position: [0.56, 2.55, 0.26], rotation: [0, Math.PI / 2, 0] },
  ];

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function buildBishopSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Sculpted ceremonial war-robes split at the front to reveal armored greaves
  const backRobe = t(
    new THREE.CylinderGeometry(0.32, 0.50, 1.18, 10, 1, false, Math.PI * 0.25, Math.PI * 1.5),
  );
  const stoleShape = new THREE.Shape();
  stoleShape.moveTo(-0.14, 0);
  stoleShape.lineTo(0.14, 0);
  stoleShape.lineTo(0.18, -1.06);
  stoleShape.lineTo(0, -1.16);
  stoleShape.lineTo(-0.18, -1.06);
  stoleShape.closePath();
  const stole = t(extrudeCenteredZ(stoleShape, 0.07, 0.015, 0.015, 1));

  // Ceremonial armored chestplate & shoulder amice/mantle
  const cuirass = t(createBreastplate(0.46, 0.72, 0.74, 0.42));
  const amice = t(new THREE.CylinderGeometry(0.36, 0.50, 0.28, 10));
  const pauldron = t(createPauldronDome(0.22));

  // Sculpted austere face + tall split-peak Gothic battle-mitre
  const head = t(new THREE.CylinderGeometry(0.16, 0.16, 0.30, 8));
  const beard = t(new THREE.ConeGeometry(0.13, 0.22, 6));
  const mitreHalfShape = new THREE.Shape();
  mitreHalfShape.moveTo(0.03, 0);
  mitreHalfShape.lineTo(0.22, 0.10);
  mitreHalfShape.quadraticCurveTo(0.24, 0.42, 0.04, 0.68);
  mitreHalfShape.lineTo(0.02, 0.34);
  mitreHalfShape.closePath();
  const mitreHalf = t(extrudeCenteredZ(mitreHalfShape, 0.28, 0.02, 0.02, 2));

  // Left arm holding stone reliquary tome; right arm gripping tall battle-crozier
  const arm = t(new THREE.CylinderGeometry(0.09, 0.10, 0.54, 8));
  const tome = t(new THREE.BoxGeometry(0.28, 0.36, 0.12));
  const staff = t(new THREE.CylinderGeometry(0.038, 0.042, 2.22, 8));
  const crookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.24, 0.07),
    new THREE.Vector3(0, 0.38, 0.24),
    new THREE.Vector3(0, 0.24, 0.38),
    new THREE.Vector3(0, 0.08, 0.28),
  ]);
  const crook = t(new THREE.TubeGeometry(crookCurve, 16, 0.04, 8, false));
  const crozierRing = t(new THREE.TorusGeometry(0.08, 0.024, 6, 12));

  const parts: SculptPart[] = [
    { geometry: plinths.octagonalPlinth, role: 'primary' },
    { geometry: plinths.octagonalCollar, role: 'metal' },
    ...buildArmoredLegParts(-0.18, 0.08, 0.34, 0.92, 0.04, 0.03),
    ...buildArmoredLegParts(0.18, 0.08, 0.34, 0.92, 0.04, -0.03),
    { geometry: backRobe, role: 'trim', position: [0, 0.98, -0.02] },
    { geometry: stole, role: 'metal', position: [0, 1.54, 0.26] },
    { geometry: cuirass, role: 'primary', position: [0, 1.46, 0.02] },
    { geometry: amice, role: 'trim', position: [0, 2.08, 0] },
    { geometry: pauldron, role: 'metal', position: [-0.42, 2.12, 0], rotation: [0, 0, 0.28] },
    { geometry: pauldron, role: 'metal', position: [0.42, 2.12, 0], rotation: [0, 0, -0.28] },
    // Arms & Reliquary Tome
    { geometry: arm, role: 'trim', position: [-0.34, 1.80, 0.16], rotation: [-0.75, 0, -0.35] },
    { geometry: tome, role: 'metal', position: [-0.18, 1.72, 0.34], rotation: [-0.2, 0.3, 0] },
    { geometry: arm, role: 'trim', position: [0.38, 1.82, 0.22], rotation: [-0.85, 0, 0.22] },
    // Sculpted Face & Tall Split Mitre
    { geometry: head, role: 'primary', position: [0, 2.34, 0.02] },
    { geometry: beard, role: 'trim', position: [0, 2.18, 0.14], rotation: [Math.PI, 0, 0] },
    { geometry: mitreHalf, role: 'primary', position: [0, 2.36, 0.02] },
    { geometry: mitreHalf, role: 'primary', position: [0, 2.36, 0.02], rotation: [0, Math.PI, 0] },
    // Battle-Crozier
    { geometry: staff, role: 'trim', position: [0.48, 1.46, 0.36] },
    { geometry: crozierRing, role: 'metal', position: [0.48, 2.54, 0.36], rotation: [Math.PI / 2, 0, 0] },
    { geometry: crook, role: 'metal', position: [0.48, 2.56, 0.36] },
  ];

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function buildKnightSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Sculpted Armored Warhorse Torso & Haunches
  const horseTorsoShape = new THREE.Shape();
  horseTorsoShape.moveTo(-0.56, 0.14);
  horseTorsoShape.quadraticCurveTo(-0.68, 0.44, -0.40, 0.62);
  horseTorsoShape.lineTo(0.24, 0.64);
  horseTorsoShape.quadraticCurveTo(0.58, 0.68, 0.62, 0.36);
  horseTorsoShape.quadraticCurveTo(0.58, 0.05, 0.30, 0.05);
  horseTorsoShape.lineTo(-0.42, 0.05);
  horseTorsoShape.closePath();
  const horseTorso = t(extrudeCenteredZ(horseTorsoShape, 0.56, 0.05, 0.05, 2));
  horseTorso.rotateY(-Math.PI / 2);

  // Heavy horse chest barding (peytral) & flank armor
  const peytral = t(new THREE.CylinderGeometry(0.30, 0.24, 0.44, 8));
  const peytralBoss = t(new THREE.ConeGeometry(0.10, 0.18, 6));
  const saddleCantle = t(new THREE.BoxGeometry(0.46, 0.26, 0.14));
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.quadraticCurveTo(-0.24, -0.06, -0.28, -0.68);
  tailShape.lineTo(-0.14, -0.74);
  tailShape.quadraticCurveTo(-0.08, -0.20, 0.05, -0.08);
  tailShape.closePath();
  const horseTail = t(extrudeCenteredZ(tailShape, 0.14, 0.02, 0.02, 1));
  horseTail.rotateY(-Math.PI / 2);

  // Detailed Armored Horse Neck & Head with Chamfron Plate
  const neckShape = new THREE.Shape();
  neckShape.moveTo(-0.18, 0);
  neckShape.lineTo(0.28, 0.08);
  neckShape.lineTo(0.38, 0.72);
  neckShape.lineTo(0.04, 0.84);
  neckShape.lineTo(-0.16, 0.58);
  neckShape.closePath();
  const horseNeck = t(extrudeCenteredZ(neckShape, 0.32, 0.035, 0.035, 2));
  horseNeck.rotateY(-Math.PI / 2);

  const horseHeadShape = new THREE.Shape();
  horseHeadShape.moveTo(-0.12, 0.16);
  horseHeadShape.lineTo(0.18, 0.26);
  horseHeadShape.lineTo(0.56, -0.02); // muzzle bridge
  horseHeadShape.lineTo(0.46, -0.18); // jaw
  horseHeadShape.lineTo(0.10, -0.06);
  horseHeadShape.lineTo(-0.08, -0.02);
  horseHeadShape.closePath();
  const horseHead = t(extrudeCenteredZ(horseHeadShape, 0.24, 0.028, 0.028, 2));
  horseHead.rotateY(-Math.PI / 2);

  const horseEar = t(new THREE.ConeGeometry(0.045, 0.16, 4));
  const chamfron = t(new THREE.BoxGeometry(0.18, 0.42, 0.08));

  // Horse leg segments
  const upperLeg = t(new THREE.CylinderGeometry(0.105, 0.085, 0.48, 8));
  const lowerLeg = t(new THREE.CylinderGeometry(0.078, 0.095, 0.46, 8));
  const hoof = t(new THREE.CylinderGeometry(0.085, 0.11, 0.10, 8));

  // Mounted Armored Knight Warrior
  const riderThigh = t(new THREE.CylinderGeometry(0.11, 0.09, 0.40, 8));
  const riderShin = t(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 8));
  const riderCuirass = t(createBreastplate(0.48, 0.70, 0.68, 0.40));
  const riderPauldron = t(createPauldronDome(0.21));
  const greatHelm = t(new THREE.CylinderGeometry(0.17, 0.19, 0.38, 8));
  const helmCrest = t(new THREE.BoxGeometry(0.06, 0.24, 0.30));
  const riderArm = t(new THREE.CylinderGeometry(0.085, 0.095, 0.48, 8));

  // Heroic Shield & Couched Jousting War-Lance
  const shield = t(createFantasyShield(0.56, 0.78, 0.06));
  const lanceShaft = t(new THREE.CylinderGeometry(0.032, 0.052, 2.25, 8));
  const lanceGuard = t(new THREE.ConeGeometry(0.11, 0.24, 8));
  const lanceTip = t(new THREE.ConeGeometry(0.072, 0.36, 6));

  const parts: SculptPart[] = [
    { geometry: plinths.knightPlinth, role: 'primary' },
    { geometry: plinths.knightCollar, role: 'metal' },
    // Hind Left Leg (planted)
    { geometry: upperLeg, role: 'primary', position: [-0.20, 0.84, -0.42], rotation: [0.16, 0, 0] },
    { geometry: lowerLeg, role: 'trim', position: [-0.20, 0.50, -0.46], rotation: [-0.10, 0, 0] },
    { geometry: hoof, role: 'metal', position: [-0.20, 0.33, -0.44] },
    // Hind Right Leg (planted)
    { geometry: upperLeg, role: 'primary', position: [0.20, 0.84, -0.42], rotation: [0.16, 0, 0] },
    { geometry: lowerLeg, role: 'trim', position: [0.20, 0.50, -0.46], rotation: [-0.10, 0, 0] },
    { geometry: hoof, role: 'metal', position: [0.20, 0.33, -0.44] },
    // Front Left Leg (planted forward)
    { geometry: upperLeg, role: 'primary', position: [-0.20, 0.84, 0.34], rotation: [-0.18, 0, 0] },
    { geometry: lowerLeg, role: 'trim', position: [-0.20, 0.50, 0.40], rotation: [0.10, 0, 0] },
    { geometry: hoof, role: 'metal', position: [-0.20, 0.33, 0.38] },
    // Front Right Leg (raised high in noble charge!)
    { geometry: upperLeg, role: 'primary', position: [0.20, 0.96, 0.40], rotation: [-0.95, 0, 0] },
    { geometry: lowerLeg, role: 'trim', position: [0.20, 0.78, 0.68], rotation: [0.75, 0, 0] },
    { geometry: hoof, role: 'metal', position: [0.20, 0.60, 0.56], rotation: [0.65, 0, 0] },
    // Warhorse Body, Barding, Tail, Neck & Head
    { geometry: horseTorso, role: 'primary', position: [0, 0.92, 0.02] },
    { geometry: peytral, role: 'metal', position: [0, 1.24, 0.50], rotation: [0.35, 0, 0] },
    { geometry: peytralBoss, role: 'metal', position: [0, 1.26, 0.74], rotation: [Math.PI / 2, 0, 0] },
    { geometry: saddleCantle, role: 'trim', position: [0, 1.62, -0.30], rotation: [-0.25, 0, 0] },
    { geometry: horseTail, role: 'trim', position: [0, 1.40, -0.56] },
    { geometry: horseNeck, role: 'trim', position: [0, 1.32, 0.34] },
    { geometry: horseHead, role: 'primary', position: [0, 1.98, 0.58] },
    { geometry: chamfron, role: 'metal', position: [0, 2.08, 0.78], rotation: [-0.98, 0, 0] },
    { geometry: horseEar, role: 'trim', position: [-0.08, 2.26, 0.56], rotation: [0.2, 0, 0.15] },
    { geometry: horseEar, role: 'trim', position: [0.08, 2.26, 0.56], rotation: [0.2, 0, -0.15] },
    // Mounted Knight Rider
    { geometry: riderThigh, role: 'primary', position: [-0.30, 1.36, 0.04], rotation: [-0.45, 0, 0.25] },
    { geometry: riderShin, role: 'trim', position: [-0.34, 1.06, 0.12], rotation: [0.20, 0, 0] },
    { geometry: riderThigh, role: 'primary', position: [0.30, 1.36, 0.04], rotation: [-0.45, 0, -0.25] },
    { geometry: riderShin, role: 'trim', position: [0.34, 1.06, 0.12], rotation: [0.20, 0, 0] },
    { geometry: riderCuirass, role: 'trim', position: [0, 1.50, -0.06] },
    { geometry: riderPauldron, role: 'metal', position: [-0.38, 2.14, -0.04], rotation: [0, 0, 0.28] },
    { geometry: riderPauldron, role: 'metal', position: [0.38, 2.14, -0.04], rotation: [0, 0, -0.28] },
    { geometry: greatHelm, role: 'primary', position: [0, 2.34, -0.02] },
    { geometry: helmCrest, role: 'metal', position: [0, 2.56, -0.04] },
    // Shield & Couched Lance
    { geometry: riderArm, role: 'primary', position: [-0.38, 1.88, 0.12], rotation: [-0.85, 0, -0.2] },
    { geometry: shield, role: 'metal', position: [-0.46, 1.82, 0.24], rotation: [0.06, -0.58, 0.08] },
    { geometry: riderArm, role: 'primary', position: [0.40, 1.88, 0.12], rotation: [-0.95, 0, 0.15] },
    { geometry: lanceShaft, role: 'trim', position: [0.46, 2.02, 0.36], rotation: [0.85, 0, 0] },
    { geometry: lanceGuard, role: 'metal', position: [0.46, 1.86, 0.18], rotation: [0.85, 0, 0] },
    { geometry: lanceTip, role: 'metal', position: [0.46, 2.84, 1.30], rotation: [0.85, 0, 0] },
  ];

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function buildRookSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Siege-Breaker Armored Guardian (NOT a castle tower!)
  const waistBelt = t(new THREE.CylinderGeometry(0.38, 0.40, 0.16, 8));
  const tassetApron = t(new THREE.BoxGeometry(0.68, 0.34, 0.46));
  const juggernautCuirass = t(createBreastplate(0.68, 1.02, 0.84, 0.56));
  const gorgetCollar = t(new THREE.CylinderGeometry(0.42, 0.48, 0.26, 8));

  // Massive slab shoulder armor plates
  const slabPauldron = t(
    extrudeCenteredZ(
      (() => {
        const s = new THREE.Shape();
        s.moveTo(-0.22, -0.18);
        s.lineTo(0.22, -0.18);
        s.lineTo(0.28, 0.22);
        s.lineTo(0, 0.36);
        s.lineTo(-0.28, 0.22);
        s.closePath();
        return s;
      })(),
      0.46,
      0.03,
      0.03,
      2,
    ),
  );

  // Deeply recessed closed frog-mouth siege-helm
  const siegeHelm = t(new THREE.CylinderGeometry(0.21, 0.24, 0.38, 8));
  const visorPlate = t(new THREE.BoxGeometry(0.32, 0.22, 0.16));
  const helmRidge = t(new THREE.BoxGeometry(0.08, 0.20, 0.34));

  // Enormous full-body tower/pavise war-shield planted on the plinth
  const towerShieldShape = new THREE.Shape();
  towerShieldShape.moveTo(-0.38, 0);
  towerShieldShape.lineTo(0.38, 0);
  towerShieldShape.lineTo(0.42, 1.48);
  towerShieldShape.lineTo(0, 1.66);
  towerShieldShape.lineTo(-0.42, 1.48);
  towerShieldShape.closePath();
  const towerShield = t(extrudeCenteredZ(towerShieldShape, 0.10, 0.025, 0.025, 2));
  const shieldBoss = t(new THREE.BoxGeometry(0.18, 1.24, 0.06));

  // Heavy Flanged War-Maul / Siege Mace held in right gauntlet
  const arm = t(new THREE.CylinderGeometry(0.125, 0.135, 0.56, 8));
  const maulShaft = t(new THREE.CylinderGeometry(0.045, 0.052, 1.55, 8));
  const maulHead = t(new THREE.CylinderGeometry(0.16, 0.16, 0.36, 8));
  const maulFlange = t(new THREE.BoxGeometry(0.38, 0.30, 0.06));

  const parts: SculptPart[] = [
    { geometry: plinths.squarePlinth, role: 'primary' },
    { geometry: plinths.squareCollar, role: 'metal' },
    ...buildArmoredLegParts(-0.26, -0.02, 0.34, 1.08, 0.05, 0.06),
    ...buildArmoredLegParts(0.26, -0.02, 0.34, 1.08, 0.05, -0.06),
    { geometry: tassetApron, role: 'trim', position: [0, 1.32, 0] },
    { geometry: waistBelt, role: 'metal', position: [0, 1.46, 0] },
    { geometry: juggernautCuirass, role: 'primary', position: [0, 1.48, 0] },
    { geometry: gorgetCollar, role: 'metal', position: [0, 2.24, 0] },
    { geometry: slabPauldron, role: 'trim', position: [-0.54, 2.24, 0], rotation: [0, 0, 0.25] },
    { geometry: slabPauldron, role: 'trim', position: [0.54, 2.24, 0], rotation: [0, 0, -0.25] },
    // Closed Siege-Helm locked between massive shoulders
    { geometry: siegeHelm, role: 'primary', position: [0, 2.40, 0.02] },
    { geometry: visorPlate, role: 'metal', position: [0, 2.38, 0.18] },
    { geometry: helmRidge, role: 'metal', position: [0, 2.54, 0.02] },
    // Left Arm bracing massive Tower Shield
    { geometry: arm, role: 'primary', position: [-0.46, 1.84, 0.20], rotation: [-0.75, 0, -0.2] },
    { geometry: towerShield, role: 'metal', position: [-0.30, 0.38, 0.44], rotation: [-0.06, -0.30, 0] },
    { geometry: shieldBoss, role: 'trim', position: [-0.32, 1.20, 0.48], rotation: [-0.06, -0.30, 0] },
    // Right Arm & Heavy Siege War-Maul
    { geometry: arm, role: 'primary', position: [0.48, 1.86, 0.18], rotation: [-0.85, 0, 0.22] },
    { geometry: maulShaft, role: 'trim', position: [0.54, 1.82, 0.22], rotation: [-0.32, 0, -0.18] },
    { geometry: maulHead, role: 'metal', position: [0.64, 2.48, -0.02], rotation: [-0.32, 0, -0.18] },
    { geometry: maulFlange, role: 'metal', position: [0.64, 2.48, -0.02], rotation: [-0.32, 0, -0.18] },
    { geometry: maulFlange, role: 'metal', position: [0.64, 2.48, -0.02], rotation: [-0.32, Math.PI / 2, -0.18] },
  ];

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function buildPawnSculpt(): MergedBlueprint {
  const plinths = getPlinthGeometries();
  const tempGeos: THREE.BufferGeometry[] = [];
  const t = <T extends THREE.BufferGeometry>(g: T): T => {
    tempGeos.push(g);
    return g;
  };

  // Compact armored fantasy warrior statue
  const kilt = t(new THREE.CylinderGeometry(0.26, 0.34, 0.30, 8));
  const belt = t(new THREE.CylinderGeometry(0.28, 0.29, 0.10, 8));
  const cuirass = t(createBreastplate(0.48, 0.68, 0.56, 0.36));
  const pauldron = t(createPauldronDome(0.18));

  // Distinctive pointed Gothic sallet/barbute helmet with cheek plates & carved jaw
  const head = t(new THREE.CylinderGeometry(0.15, 0.15, 0.26, 8));
  const helmetBowl = t(new THREE.SphereGeometry(0.21, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55));
  const helmetBrim = t(new THREE.CylinderGeometry(0.22, 0.28, 0.12, 8));
  const noseGuard = t(new THREE.BoxGeometry(0.05, 0.18, 0.08));

  // Shield & heavy notched fantasy arming sword
  const arm = t(new THREE.CylinderGeometry(0.08, 0.09, 0.42, 8));
  const shield = t(createFantasyShield(0.56, 0.84, 0.055));
  const swordBlade = t(createFantasySwordBlade(0.13, 0.78, 0.04));
  const crossguard = t(new THREE.BoxGeometry(0.32, 0.06, 0.08));

  const parts: SculptPart[] = [
    { geometry: plinths.octagonalPlinth, role: 'primary' },
    { geometry: plinths.octagonalCollar, role: 'metal' },
    ...buildArmoredLegParts(-0.19, 0.0, 0.34, 0.76, 0.04, 0.05),
    ...buildArmoredLegParts(0.19, 0.0, 0.34, 0.76, 0.04, -0.05),
    { geometry: kilt, role: 'trim', position: [0, 1.06, 0] },
    { geometry: belt, role: 'metal', position: [0, 1.18, 0] },
    { geometry: cuirass, role: 'primary', position: [0, 1.20, 0.02] },
    { geometry: pauldron, role: 'metal', position: [-0.36, 1.66, 0], rotation: [0, 0, 0.28] },
    { geometry: pauldron, role: 'metal', position: [0.36, 1.66, 0], rotation: [0, 0, -0.28] },
    // Sallet / Barbute Helm & Carved Jaw
    { geometry: head, role: 'trim', position: [0, 1.82, 0.02] },
    { geometry: helmetBrim, role: 'metal', position: [0, 1.92, 0.0] },
    { geometry: helmetBowl, role: 'primary', position: [0, 1.94, 0.0] },
    { geometry: noseGuard, role: 'metal', position: [0, 1.82, 0.17] },
    // Left arm & heavy angled Heater Shield
    { geometry: arm, role: 'trim', position: [-0.34, 1.44, 0.16], rotation: [-0.75, 0, -0.2] },
    { geometry: shield, role: 'metal', position: [-0.34, 1.24, 0.36], rotation: [-0.12, -0.45, 0.06] },
    // Right arm & upright Arming Sword
    { geometry: arm, role: 'trim', position: [0.38, 1.44, 0.16], rotation: [-0.75, 0, 0.15] },
    { geometry: crossguard, role: 'metal', position: [0.40, 1.42, 0.36] },
    { geometry: swordBlade, role: 'metal', position: [0.40, 1.45, 0.36] },
  ];

  const merged = bakeMergedBlueprint(parts);
  tempGeos.forEach((g) => g.dispose());
  return merged;
}

function getMergedBlueprint(archetype: PieceArchetype): MergedBlueprint {
  const existing = mergedBlueprintCache.get(archetype);
  if (existing) return existing;

  let bp: MergedBlueprint;
  switch (archetype) {
    case 'king':
      bp = buildKingSculpt();
      break;
    case 'queen':
      bp = buildQueenSculpt();
      break;
    case 'bishop':
      bp = buildBishopSculpt();
      break;
    case 'knight':
      bp = buildKnightSculpt();
      break;
    case 'rook':
      bp = buildRookSculpt();
      break;
    case 'pawn':
      bp = buildPawnSculpt();
      break;
  }

  mergedBlueprintCache.set(archetype, bp);
  return bp;
}

function getHitboxGeometry(archetype: PieceArchetype): THREE.BufferGeometry {
  const existing = hitboxGeometryCache.get(archetype);
  if (existing) return existing;

  const heights: Record<PieceArchetype, number> = {
    king: 3.50,
    queen: 3.45,
    bishop: 3.05,
    knight: 2.95,
    rook: 2.70,
    pawn: 2.25,
  };
  const h = heights[archetype];
  const geo = new THREE.CylinderGeometry(0.70, 0.80, h, 8);
  geo.translate(0, h / 2, 0);
  hitboxGeometryCache.set(archetype, geo);
  return geo;
}

const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });

export function createChessPieceGroup(
  archetype: PieceArchetype,
  army: ArmyColor,
  materials: ArcaneMaterialLibrary,
  id: string,
  square: string,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `${army}-${archetype}-${square}`;
  group.userData = { id, archetype, army, square };

  const primaryMat =
    army === 'white' ? materials.whiteStonePrimary : materials.blackStonePrimary;
  const trimMat =
    army === 'white' ? materials.whiteStoneTrim : materials.blackStoneTrim;
  const metalMat =
    army === 'white' ? materials.whiteMetalAccent : materials.blackMetalAccent;

  const bp = getMergedBlueprint(archetype);

  // Only 3 merged draw-call meshes per piece for high performance on Intel i3 integrated graphics
  if (bp.primary) {
    const mesh = new THREE.Mesh(bp.primary, primaryMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (bp.trim) {
    const mesh = new THREE.Mesh(bp.trim, trimMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (bp.metal) {
    const mesh = new THREE.Mesh(bp.metal, metalMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Contact shadow disc grounded at y = 0.008
  const plinths = getPlinthGeometries();
  const shadowPlane = new THREE.Mesh(plinths.contactDisc, materials.contactShadow);
  shadowPlane.position.y = 0.008;
  shadowPlane.renderOrder = 1;
  group.add(shadowPlane);

  // Layer 1 invisible simplified collision proxy for fast desktop/mobile raycasting
  const hitbox = new THREE.Mesh(getHitboxGeometry(archetype), hitboxMat);
  hitbox.layers.set(1);
  hitbox.userData = { pieceGroup: group };
  group.add(hitbox);

  return group;
}

export function disposeArchetypeGeometries() {
  mergedBlueprintCache.forEach((bp) => {
    bp.primary?.dispose();
    bp.trim?.dispose();
    bp.metal?.dispose();
  });
  mergedBlueprintCache.clear();
  hitboxGeometryCache.forEach((g) => g.dispose());
  hitboxGeometryCache.clear();
  hitboxMat.dispose();
}
