import * as THREE from 'three';

export interface ProceduralTextureSet {
  whiteLimestoneMap: THREE.CanvasTexture;
  whiteLimestoneBump: THREE.CanvasTexture;
  blackGraniteMap: THREE.CanvasTexture;
  blackGraniteBump: THREE.CanvasTexture;
  flagstoneMap: THREE.CanvasTexture;
  flagstoneBump: THREE.CanvasTexture;
  metalBrushedBump: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  flameGlowMap: THREE.CanvasTexture;
  dustMoteMap: THREE.CanvasTexture;
  dispose: () => void;
}

// Deterministic pseudo-random generator for consistent procedural stone grain
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStoneTextures(
  size: number,
  seed: number,
  baseRgb: [number, number, number],
  veinRgb: [number, number, number],
  speckleContrast: number,
  repeat: number,
  maxAnisotropy: number,
): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const rand = mulberry32(seed);
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Base fill
  cCtx.fillStyle = `rgb(${baseRgb[0]}, ${baseRgb[1]}, ${baseRgb[2]})`;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = 'rgb(128, 128, 128)';
  bCtx.fillRect(0, 0, size, size);

  // Broad mineral weathering mottling
  for (let i = 0; i < 160; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 14 + rand() * 52;
    const delta = (rand() - 0.5) * 26;

    const grad = cCtx.createRadialGradient(x, y, 0, x, y, r);
    const rr = Math.min(255, Math.max(0, Math.round(baseRgb[0] + delta)));
    const gg = Math.min(255, Math.max(0, Math.round(baseRgb[1] + delta)));
    const bb = Math.min(255, Math.max(0, Math.round(baseRgb[2] + delta)));
    grad.addColorStop(0, `rgba(${rr}, ${gg}, ${bb}, 0.24)`);
    grad.addColorStop(1, `rgba(${rr}, ${gg}, ${bb}, 0)`);
    cCtx.fillStyle = grad;
    cCtx.fillRect(x - r, y - r, r * 2, r * 2);

    const bVal = Math.min(255, Math.max(0, Math.round(128 + delta * 1.4)));
    const bGrad = bCtx.createRadialGradient(x, y, 0, x, y, r);
    bGrad.addColorStop(0, `rgba(${bVal}, ${bVal}, ${bVal}, 0.28)`);
    bGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Subtle mineral veins and ancient chisel fractures
  for (let v = 0; v < 24; v++) {
    let px = rand() * size;
    let py = rand() * size;
    const steps = 12 + Math.floor(rand() * 14);
    const angleBase = rand() * Math.PI * 2;
    const alpha = 0.08 + rand() * 0.14;

    cCtx.strokeStyle = `rgba(${veinRgb[0]}, ${veinRgb[1]}, ${veinRgb[2]}, ${alpha})`;
    cCtx.lineWidth = 0.7 + rand() * 1.6;
    cCtx.beginPath();
    cCtx.moveTo(px, py);

    bCtx.strokeStyle = `rgba(72, 72, 72, ${alpha * 1.4})`;
    bCtx.lineWidth = cCtx.lineWidth;
    bCtx.beginPath();
    bCtx.moveTo(px, py);

    for (let s = 0; s < steps; s++) {
      const ang = angleBase + (rand() - 0.5) * 1.1;
      px += Math.cos(ang) * (8 + rand() * 14);
      py += Math.sin(ang) * (8 + rand() * 14);
      cCtx.lineTo(px, py);
      bCtx.lineTo(px, py);
    }
    cCtx.stroke();
    bCtx.stroke();
  }

  // Fine crystalline stone grain & pitting
  for (let p = 0; p < 2400; p++) {
    const x = rand() * size;
    const y = rand() * size;
    const sz = 1 + rand() * 1.6;
    const bright = rand() > 0.5;
    const shift = bright ? speckleContrast : -speckleContrast;
    const rr = Math.min(255, Math.max(0, Math.round(baseRgb[0] + shift)));
    const gg = Math.min(255, Math.max(0, Math.round(baseRgb[1] + shift)));
    const bb = Math.min(255, Math.max(0, Math.round(baseRgb[2] + shift)));
    cCtx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, 0.28)`;
    cCtx.fillRect(x, y, sz, sz);

    const bShift = bright ? 165 : 85;
    bCtx.fillStyle = `rgba(${bShift}, ${bShift}, ${bShift}, 0.25)`;
    bCtx.fillRect(x, y, sz, sz);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeat, repeat);
  map.anisotropy = maxAnisotropy;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(repeat, repeat);
  bump.anisotropy = maxAnisotropy;

  return { map, bump };
}

function createFlagstoneTextures(
  size: number,
  maxAnisotropy: number,
): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const rand = mulberry32(9104);
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  cCtx.fillStyle = '#181a1f';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = 'rgb(60, 60, 60)';
  bCtx.fillRect(0, 0, size, size);

  const rows = 4;
  const rowH = size / rows;

  for (let r = 0; r < rows; r++) {
    const cols = r % 2 === 0 ? 4 : 3;
    const colW = size / cols;
    const offset = (r % 2) * (colW * 0.42);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      const pad = 4;
      const shade = 26 + Math.floor(rand() * 14);
      const blueTint = shade + 4;
      cCtx.fillStyle = `rgb(${shade}, ${shade + 1}, ${blueTint})`;
      cCtx.fillRect(x + pad, y + pad, colW - pad * 2, rowH - pad * 2);

      const bShade = 135 + Math.floor(rand() * 35);
      bCtx.fillStyle = `rgb(${bShade}, ${bShade}, ${bShade})`;
      bCtx.fillRect(x + pad, y + pad, colW - pad * 2, rowH - pad * 2);

      // Stone surface mottling inside slab
      for (let m = 0; m < 10; m++) {
        const mx = x + pad + rand() * (colW - pad * 2);
        const my = y + pad + rand() * (rowH - pad * 2);
        const mr = 8 + rand() * 24;
        const delta = (rand() - 0.5) * 14;
        const s = Math.max(10, Math.min(60, Math.round(shade + delta)));
        const grad = cCtx.createRadialGradient(mx, my, 0, mx, my, mr);
        grad.addColorStop(0, `rgba(${s}, ${s + 1}, ${s + 3}, 0.35)`);
        grad.addColorStop(1, `rgba(${s}, ${s + 1}, ${s + 3}, 0)`);
        cCtx.fillStyle = grad;
        cCtx.fillRect(x + pad, y + pad, colW - pad * 2, rowH - pad * 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(cCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(9, 9);
  map.anisotropy = maxAnisotropy;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(9, 9);
  bump.anisotropy = maxAnisotropy;

  return { map, bump };
}

function createBrushedMetalBump(size: number, maxAnisotropy: number): THREE.CanvasTexture {
  const rand = mulberry32(4421);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 18 + rand() * 75;
    const v = 90 + Math.floor(rand() * 75);
    ctx.strokeStyle = `rgba(${v},${v},${v},0.22)`;
    ctx.lineWidth = 0.8 + rand() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rand() - 0.5) * 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRadialTexture(
  size: number,
  stops: Array<[number, string]>,
  isColor: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, color] of stops) {
    grad.addColorStop(offset, color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.min(maxAnisotropy || 4, 8);

  const whiteLimestone = createStoneTextures(
    512,
    1021,
    [216, 213, 206],
    [164, 159, 150],
    20,
    1,
    aniso,
  );

  const blackGranite = createStoneTextures(
    512,
    2087,
    [45, 48, 55],
    [22, 24, 29],
    18,
    1,
    aniso,
  );

  const flagstone = createFlagstoneTextures(512, aniso);
  const metalBrushedBump = createBrushedMetalBump(256, aniso);

  const contactShadowMap = createRadialTexture(
    128,
    [
      [0, 'rgba(0, 0, 0, 0.72)'],
      [0.45, 'rgba(0, 0, 0, 0.36)'],
      [0.8, 'rgba(0, 0, 0, 0.08)'],
      [1, 'rgba(0, 0, 0, 0)'],
    ],
    false,
  );

  const flameGlowMap = createRadialTexture(
    128,
    [
      [0, 'rgba(255, 232, 178, 1)'],
      [0.28, 'rgba(255, 160, 58, 0.78)'],
      [0.65, 'rgba(210, 72, 18, 0.25)'],
      [1, 'rgba(120, 20, 0, 0)'],
    ],
    true,
  );

  const dustMoteMap = createRadialTexture(
    64,
    [
      [0, 'rgba(255, 242, 214, 0.95)'],
      [0.45, 'rgba(220, 206, 185, 0.35)'],
      [1, 'rgba(180, 175, 165, 0)'],
    ],
    true,
  );

  return {
    whiteLimestoneMap: whiteLimestone.map,
    whiteLimestoneBump: whiteLimestone.bump,
    blackGraniteMap: blackGranite.map,
    blackGraniteBump: blackGranite.bump,
    flagstoneMap: flagstone.map,
    flagstoneBump: flagstone.bump,
    metalBrushedBump,
    contactShadowMap,
    flameGlowMap,
    dustMoteMap,
    dispose: () => {
      whiteLimestone.map.dispose();
      whiteLimestone.bump.dispose();
      blackGranite.map.dispose();
      blackGranite.bump.dispose();
      flagstone.map.dispose();
      flagstone.bump.dispose();
      metalBrushedBump.dispose();
      contactShadowMap.dispose();
      flameGlowMap.dispose();
      dustMoteMap.dispose();
    },
  };
}
