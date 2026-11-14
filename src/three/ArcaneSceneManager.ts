import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  ArmyColor,
  CameraPresetId,
  PieceArchetype,
  QualityTier,
  SceneMetrics,
  SelectedPieceInfo,
} from '../types/arcane';
import { BoardAssembly, createMonumentalBoard } from './arena/board';
import { createAtmosphericDust, DustMotesSystem } from './arena/dust';
import { createGothicHall, GothicHallAssembly } from './arena/hall';
import { ArenaLightingRig, createArenaLighting } from './arena/lighting';
import { ArcaneMaterialLibrary, createArcaneMaterials } from './materials';
import { disposeArchetypeGeometries } from './pieces/archetypes';
import { disposePlinthGeometries } from './pieces/plinth';
import { createProceduralTextures, ProceduralTextureSet } from './textures';

interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPresetId, CameraPose> = {
  'grand-hall': {
    position: [15.8, 12.8, 19.6],
    target: [0, 1.0, 0],
  },
  'white-vanguard': {
    position: [4.2, 5.6, 15.8],
    target: [0, 1.35, -2.5],
  },
  'black-citadel': {
    position: [-4.2, 5.6, -15.8],
    target: [0, 1.35, 2.5],
  },
  overhead: {
    position: [0.01, 23.2, 9.2],
    target: [0, 0, 0],
  },
  'side-profile': {
    position: [19.4, 7.0, 0.2],
    target: [0, 1.4, 0],
  },
};

// Pre-allocated math helpers (zero per-frame GC)
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface ArcaneSceneCallbacks {
  onSelectPiece: (piece: SelectedPieceInfo | null) => void;
  onMetricsUpdate: (metrics: SceneMetrics) => void;
  onContextLost: (lost: boolean) => void;
}

export class ArcaneSceneManager {
  private container: HTMLElement;
  private callbacks: ArcaneSceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;

  private textures: ProceduralTextureSet;
  private materials: ArcaneMaterialLibrary;
  private board: BoardAssembly;
  private hall: GothicHallAssembly;
  private lighting: ArenaLightingRig;
  private dust: DustMotesSystem;

  private isSoftwareGl: boolean;
  private qualityTier: QualityTier;
  private flamesEnabled = true;
  private dustEnabled = true;

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;

  // Camera transition state
  private transitioning = false;
  private transitionPos = new THREE.Vector3(...CAMERA_PRESETS['grand-hall'].position);
  private transitionLook = new THREE.Vector3(...CAMERA_PRESETS['grand-hall'].target);

  // Pointer interaction state
  private pointerDownPos = { x: 0, y: 0 };
  private lastHoverCheck = 0;

  // FPS sampling
  private fpsFrames = 0;
  private fpsTimer = 0;
  private currentFps = 60;

  // Bound event listeners
  private onResizeBound: () => void;
  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;
  private onPointerMoveBound: (e: PointerEvent) => void;
  private onContextLostBound: (e: Event) => void;
  private onContextRestoredBound: () => void;

  constructor(
    container: HTMLElement,
    initialQuality: QualityTier,
    callbacks: ArcaneSceneCallbacks,
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.qualityTier = initialQuality;
    this.isSoftwareGl = detectSoftwareGl();

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(width, height);
    this.applyPixelRatio();

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.25, 130);
    this.camera.position.set(...CAMERA_PRESETS['grand-hall'].position);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...CAMERA_PRESETS['grand-hall'].target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 36;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.475; // Never clip below floor
    this.controls.panSpeed = 0.75;
    this.controls.rotateSpeed = 0.72;
    this.controls.zoomSpeed = 0.9;
    this.controls.update();

    this.controls.addEventListener('start', () => {
      // Cancel scripted transition immediately when user interacts
      this.transitioning = false;
    });

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(1);

    // Build procedural textures, materials, board, hall, lighting, dust
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);
    this.materials = createArcaneMaterials(this.textures);
    this.lighting = createArenaLighting(this.scene, this.renderer, this.isSoftwareGl);

    this.board = createMonumentalBoard(this.materials);
    this.scene.add(this.board.group);

    this.hall = createGothicHall(this.materials, this.textures);
    this.scene.add(this.hall.group);

    this.dust = createAtmosphericDust(this.textures);
    this.scene.add(this.dust.points);

    // Apply initial quality tier settings
    this.setQualityTier(initialQuality);

    // Pre-compile shaders on hardware GPU
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Bind DOM events
    this.onResizeBound = this.handleResize.bind(this);
    this.onPointerDownBound = this.handlePointerDown.bind(this);
    this.onPointerUpBound = this.handlePointerUp.bind(this);
    this.onPointerMoveBound = this.handlePointerMove.bind(this);
    this.onContextLostBound = (e: Event) => {
      e.preventDefault();
      this.callbacks.onContextLost(true);
    };
    this.onContextRestoredBound = () => {
      this.callbacks.onContextLost(false);
    };

    window.addEventListener('resize', this.onResizeBound);
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDownBound);
    canvas.addEventListener('pointerup', this.onPointerUpBound);
    canvas.addEventListener('pointermove', this.onPointerMoveBound);
    canvas.addEventListener('webglcontextlost', this.onContextLostBound);
    canvas.addEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.emitMetrics();
    this.startLoop();
  }

  private applyPixelRatio() {
    if (this.isSoftwareGl) {
      this.renderer.setPixelRatio(1);
      return;
    }
    const maxDpr =
      this.qualityTier === 'mobile' ? 1.0 : this.qualityTier === 'balanced' ? 1.5 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  }

  public setQualityTier(tier: QualityTier) {
    this.qualityTier = tier;
    this.applyPixelRatio();

    if (tier === 'mobile') {
      this.lighting.setShadowResolution(512, true);
    } else if (tier === 'balanced') {
      this.lighting.setShadowResolution(1024, true);
    } else {
      this.lighting.setShadowResolution(2048, true);
    }
  }

  public setFlamesEnabled(enabled: boolean) {
    this.flamesEnabled = enabled;
    this.hall.setFlamesVisible(enabled);
  }

  public setDustEnabled(enabled: boolean) {
    this.dustEnabled = enabled;
    this.dust.setEnabled(enabled);
  }

  public setCameraPreset(presetId: CameraPresetId) {
    const pose = CAMERA_PRESETS[presetId];
    this.transitionPos.set(...pose.position);
    this.transitionLook.set(...pose.target);
    this.transitioning = true;
    // Clear piece selection halo when returning to broad arena presets
    if (presetId !== 'side-profile') {
      this.board.selectionHalo.visible = false;
      this.callbacks.onSelectPiece(null);
    }
  }

  public focusArchetype(archetype: PieceArchetype, army: ArmyColor) {
    // Prefer a royal or central piece of that archetype
    const candidates = this.board.pieces.filter(
      (p) => p.userData.archetype === archetype && p.userData.army === army,
    );
    if (candidates.length === 0) return;

    // Pick a visually prominent candidate (e.g. inner pawn/knight/bishop/rook on kingside/queen's side)
    const chosen = candidates[Math.floor(candidates.length / 2)];
    this.focusPieceGroup(chosen);
  }

  private focusPieceGroup(piece: THREE.Group) {
    const { id, archetype, army, square } = piece.userData as {
      id: string;
      archetype: PieceArchetype;
      army: ArmyColor;
      square: string;
    };

    const px = piece.position.x;
    const pz = piece.position.z;

    // Place selection halo cleanly under piece
    this.board.selectionHalo.position.set(px, 0.016, pz);
    this.board.selectionHalo.visible = true;

    const pieceHeights: Record<PieceArchetype, number> = {
      king: 1.7,
      queen: 1.55,
      bishop: 1.4,
      knight: 1.35,
      rook: 1.25,
      pawn: 1.0,
    };
    const focusY = pieceHeights[archetype];

    // Frame piece from its front-3/4 angle so its carved face, shield, weapon, and armor read heroically
    const forwardZ = army === 'white' ? -1 : 1;
    const offsetX = px >= 0 ? -3.1 : 3.1;
    const camX = THREE.MathUtils.clamp(px + offsetX, -15, 15);
    const camZ = THREE.MathUtils.clamp(pz + forwardZ * 4.4, -18, 18);

    this.transitionPos.set(camX, focusY + 1.55, camZ);
    this.transitionLook.set(px, focusY, pz);
    this.transitioning = true;

    this.callbacks.onSelectPiece({
      id,
      archetype,
      army,
      square,
      worldX: px,
      worldY: piece.position.y,
      worldZ: pz,
    });
  }

  private handleResize() {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.applyPixelRatio();
  }

  private updatePointerNdc(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handlePointerDown(e: PointerEvent) {
    this.pointerDownPos.x = e.clientX;
    this.pointerDownPos.y = e.clientY;
  }

  private handlePointerMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - this.lastHoverCheck < 50) return;
    this.lastHoverCheck = now;

    this.updatePointerNdc(e);
    this.raycaster.setFromCamera(_pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.board.piecesGroup.children, true);
    this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  }

  private handlePointerUp(e: PointerEvent) {
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    if (dx * dx + dy * dy > 36) return; // Dragged, not clicked/tapped

    this.updatePointerNdc(e);
    this.raycaster.setFromCamera(_pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.board.piecesGroup.children, true);
    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      const pieceGroup = hitMesh.userData?.pieceGroup as THREE.Group | undefined;
      if (pieceGroup) {
        this.focusPieceGroup(pieceGroup);
      }
    }
  }

  private emitMetrics() {
    this.callbacks.onMetricsUpdate({
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      fps: this.currentFps,
      isSoftwareGl: this.isSoftwareGl,
    });
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.disposed) return;

      const rawDelta = this.clock.getDelta();
      const delta = Math.min(rawDelta, 0.1);
      const elapsed = this.clock.elapsedTime;

      // Smooth damped camera preset / focus glide
      if (this.transitioning) {
        _camTargetPos.copy(this.transitionPos);
        _camTargetLook.copy(this.transitionLook);

        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camTargetPos.x, 5.2, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camTargetPos.y, 5.2, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camTargetPos.z, 5.2, delta);

        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, _camTargetLook.x, 5.8, delta);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, _camTargetLook.y, 5.8, delta);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, _camTargetLook.z, 5.8, delta);

        if (
          this.camera.position.distanceToSquared(_camTargetPos) < 0.002 &&
          this.controls.target.distanceToSquared(_camTargetLook) < 0.002
        ) {
          this.camera.position.copy(_camTargetPos);
          this.controls.target.copy(_camTargetLook);
          this.transitioning = false;
        }
      }

      this.controls.update();

      // Environmental atmosphere updates
      if (this.flamesEnabled) {
        this.hall.updateFlames(elapsed);
      }
      this.lighting.updateTorchFlicker(elapsed, this.flamesEnabled);

      if (this.dustEnabled) {
        this.dust.update(delta, elapsed);
      }

      this.renderer.render(this.scene, this.camera);

      // Update performance telemetry every ~0.8s
      this.fpsFrames++;
      this.fpsTimer += rawDelta;
      if (this.fpsTimer >= 0.8) {
        this.currentFps = Math.round(this.fpsFrames / this.fpsTimer);
        this.fpsFrames = 0;
        this.fpsTimer = 0;
        this.emitMetrics();
      }

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = requestAnimationFrame(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResizeBound);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDownBound);
    canvas.removeEventListener('pointerup', this.onPointerUpBound);
    canvas.removeEventListener('pointermove', this.onPointerMoveBound);
    canvas.removeEventListener('webglcontextlost', this.onContextLostBound);
    canvas.removeEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.controls.dispose();
    this.board.dispose();
    this.hall.dispose();
    this.dust.dispose();
    this.lighting.dispose();
    this.materials.dispose();
    this.textures.dispose();
    disposeArchetypeGeometries();
    disposePlinthGeometries();

    this.renderer.dispose();
    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
