export type ArmyColor = 'white' | 'black';

export type PieceArchetype =
  | 'king'
  | 'queen'
  | 'bishop'
  | 'knight'
  | 'rook'
  | 'pawn';

export type CameraPresetId =
  | 'grand-hall'
  | 'white-vanguard'
  | 'black-citadel'
  | 'overhead'
  | 'side-profile';

export type QualityTier = 'mobile' | 'balanced' | 'cinematic';

export interface SelectedPieceInfo {
  id: string;
  archetype: PieceArchetype;
  army: ArmyColor;
  square: string;
  worldX: number;
  worldY: number;
  worldZ: number;
}

export interface ArchetypeSpec {
  id: PieceArchetype;
  title: string;
  monumentName: string;
  heightMeters: string;
  silhouetteNote: string;
  sculptDetails: string;
  subPartsCount: number;
}

export interface SceneMetrics {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  fps: number;
  isSoftwareGl: boolean;
}
