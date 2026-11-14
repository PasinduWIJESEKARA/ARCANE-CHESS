import * as THREE from 'three';

export interface PlinthGeometrySet {
  octagonalPlinth: THREE.LatheGeometry;
  octagonalCollar: THREE.LatheGeometry;
  squarePlinth: THREE.ExtrudeGeometry;
  squareCollar: THREE.ExtrudeGeometry;
  knightPlinth: THREE.ExtrudeGeometry;
  knightCollar: THREE.ExtrudeGeometry;
  contactDisc: THREE.PlaneGeometry;
}

let cachedPlinths: PlinthGeometrySet | null = null;

function createBeveledRectShape(halfW: number, halfD: number, chamfer: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-halfW + chamfer, -halfD);
  s.lineTo(halfW - chamfer, -halfD);
  s.lineTo(halfW, -halfD + chamfer);
  s.lineTo(halfW, halfD - chamfer);
  s.lineTo(halfW - chamfer, halfD);
  s.lineTo(-halfW + chamfer, halfD);
  s.lineTo(-halfW, halfD - chamfer);
  s.lineTo(-halfW, -halfD + chamfer);
  s.closePath();
  return s;
}

export function getPlinthGeometries(): PlinthGeometrySet {
  if (cachedPlinths) return cachedPlinths;

  // Stepped octagonal stone pedestal (grounded at y = 0, top at y = 0.34)
  const octPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.76, 0.0),
    new THREE.Vector2(0.76, 0.10),
    new THREE.Vector2(0.71, 0.14),
    new THREE.Vector2(0.66, 0.14),
    new THREE.Vector2(0.64, 0.25),
    new THREE.Vector2(0.56, 0.30),
    new THREE.Vector2(0.54, 0.34),
    new THREE.Vector2(0.0, 0.34),
  ];
  const octagonalPlinth = new THREE.LatheGeometry(octPts, 8);
  octagonalPlinth.rotateY(Math.PI / 8);
  octagonalPlinth.computeVertexNormals();

  // Metallic/stone accent collar ring sitting at y = 0.34..0.41
  const collarPts = [
    new THREE.Vector2(0.0, 0.33),
    new THREE.Vector2(0.57, 0.33),
    new THREE.Vector2(0.59, 0.37),
    new THREE.Vector2(0.53, 0.41),
    new THREE.Vector2(0.0, 0.41),
  ];
  const octagonalCollar = new THREE.LatheGeometry(collarPts, 8);
  octagonalCollar.rotateY(Math.PI / 8);
  octagonalCollar.computeVertexNormals();

  // Square-chamfered fortress plinth for Rook
  const sqBaseShape = createBeveledRectShape(0.74, 0.74, 0.18);
  const squarePlinth = new THREE.ExtrudeGeometry(sqBaseShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  squarePlinth.rotateX(-Math.PI / 2);
  squarePlinth.translate(0, 0.04, 0);
  squarePlinth.computeVertexNormals();

  const sqCollarShape = createBeveledRectShape(0.63, 0.63, 0.15);
  const squareCollar = new THREE.ExtrudeGeometry(sqCollarShape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 1,
  });
  squareCollar.rotateX(-Math.PI / 2);
  squareCollar.translate(0, 0.30, 0);
  squareCollar.computeVertexNormals();

  // Elongated chamfered pedestal for Knight's steed
  const knBaseShape = createBeveledRectShape(0.66, 0.82, 0.22);
  const knightPlinth = new THREE.ExtrudeGeometry(knBaseShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  knightPlinth.rotateX(-Math.PI / 2);
  knightPlinth.translate(0, 0.04, 0);
  knightPlinth.computeVertexNormals();

  const knCollarShape = createBeveledRectShape(0.56, 0.72, 0.18);
  const knightCollar = new THREE.ExtrudeGeometry(knCollarShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 1,
  });
  knightCollar.rotateX(-Math.PI / 2);
  knightCollar.translate(0, 0.28, 0);
  knightCollar.computeVertexNormals();

  const contactDisc = new THREE.PlaneGeometry(2.15, 2.15);
  contactDisc.rotateX(-Math.PI / 2);

  cachedPlinths = {
    octagonalPlinth,
    octagonalCollar,
    squarePlinth,
    squareCollar,
    knightPlinth,
    knightCollar,
    contactDisc,
  };
  return cachedPlinths;
}

export function disposePlinthGeometries() {
  if (!cachedPlinths) return;
  Object.values(cachedPlinths).forEach((g) => g.dispose());
  cachedPlinths = null;
}
