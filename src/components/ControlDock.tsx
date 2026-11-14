import {
  Camera,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  X,
} from 'lucide-react';
import { ARCHETYPE_ORDER, ARCHETYPE_SPECS } from '../data/archetypes';
import {
  ArmyColor,
  CameraPresetId,
  PieceArchetype,
  QualityTier,
  SelectedPieceInfo,
} from '../types/arcane';

interface ControlDockProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePreset: CameraPresetId | null;
  onSelectPreset: (preset: CameraPresetId) => void;
  selectedPiece: SelectedPieceInfo | null;
  showcaseArmy: ArmyColor;
  onChangeShowcaseArmy: (army: ArmyColor) => void;
  onInspectArchetype: (archetype: PieceArchetype, army: ArmyColor) => void;
  onClearSelection: () => void;
  qualityTier: QualityTier;
  onChangeQuality: (tier: QualityTier) => void;
  flamesEnabled: boolean;
  onToggleFlames: () => void;
  dustEnabled: boolean;
  onToggleDust: () => void;
}

const CAMERA_OPTIONS: Array<{ id: CameraPresetId; label: string }> = [
  { id: 'grand-hall', label: 'Grand Hall' },
  { id: 'white-vanguard', label: 'White Side' },
  { id: 'black-citadel', label: 'Black Side' },
  { id: 'overhead', label: 'Overhead' },
  { id: 'side-profile', label: 'Flank' },
];

const QUALITY_OPTIONS: Array<{ id: QualityTier; label: string }> = [
  { id: 'mobile', label: '30fps Low' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'cinematic', label: 'High' },
];

export function ControlDock({
  collapsed,
  onToggleCollapse,
  activePreset,
  onSelectPreset,
  selectedPiece,
  showcaseArmy,
  onChangeShowcaseArmy,
  onInspectArchetype,
  onClearSelection,
  qualityTier,
  onChangeQuality,
  flamesEnabled,
  onToggleFlames,
  dustEnabled,
  onToggleDust,
}: ControlDockProps) {
  const activeSpec = selectedPiece ? ARCHETYPE_SPECS[selectedPiece.archetype] : null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(960px,95vw)] pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: collapsed ? 'translate(-50%, calc(100% - 34px))' : 'translate(-50%, 0)',
      }}
    >
      {/* Collapse / Expand Toggle Handle */}
      <div className="flex justify-center mb-1.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#d8cfc0] bg-[#101218]/95 border border-[#c5934b]/25 rounded-md hover:border-[#c5934b]/55 hover:text-[#f5efe4] transition-colors cursor-pointer whitespace-nowrap"
          aria-expanded={!collapsed}
          title="Toggle Controls (H)"
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{collapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>
      </div>

      {/* Main Unified Bottom Control Dock (solid dark obsidian surface, zero backdrop-blur) */}
      <div className="pointer-events-auto bg-[#0d0f14]/95 border border-[#c5934b]/22 rounded-lg shadow-2xl overflow-hidden">
        {/* Selected Statue Specimen Bar (when inspecting a piece) */}
        {selectedPiece && activeSpec && (
          <div className="px-4 py-2.5 border-b border-white/10 bg-[#13161e] flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-display text-sm font-semibold text-[#efe6d6]">
                  {activeSpec.monumentName}
                </span>
                <span className="text-[#78736a]" aria-hidden="true">·</span>
                <span className="text-[#c5934b] font-medium">
                  {selectedPiece.army === 'white' ? 'White Carved Stone' : 'Black Charcoal Stone'} {activeSpec.title}
                </span>
                <span className="text-[#78736a]" aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#a9a296] uppercase">
                  Square {selectedPiece.square}
                </span>
                <span className="text-[#78736a]" aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#a9a296]">
                  {activeSpec.heightMeters}
                </span>
              </div>
              <p className="text-xs text-[#9c9589] mt-0.5 line-clamp-1">
                {activeSpec.sculptDetails}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#c8bfb0] hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>
          </div>
        )}

        {/* Controls Grid */}
        <div className="px-3.5 py-2.5 flex flex-col gap-2">
          {/* Row 1: Camera Presets + Environment + Quality */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Camera Angles */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8d867c] mr-1 whitespace-nowrap shrink-0">
                <Camera className="w-3.5 h-3.5 text-[#c5934b]" />
                <span>Camera</span>
              </span>
              <div className="flex items-center gap-1 bg-[#161922] p-0.5 rounded-md border border-white/8">
                {CAMERA_OPTIONS.map((cam) => {
                  const active = activePreset === cam.id;
                  return (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => onSelectPreset(cam.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#c5934b] text-[#0c0d11]'
                          : 'text-[#b7b0a3] hover:text-[#f2ece1] hover:bg-white/5'
                      }`}
                    >
                      {cam.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atmosphere & Performance Tier */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onToggleFlames}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  flamesEnabled
                    ? 'bg-[#2a1a10] border-[#c5934b]/45 text-[#f2be7a]'
                    : 'bg-[#161922] border-white/10 text-[#8b857b] hover:text-[#d5cdc0]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Torches</span>
              </button>

              <button
                type="button"
                onClick={onToggleDust}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  dustEnabled
                    ? 'bg-[#1a1d26] border-[#7ea2c9]/40 text-[#bfd5ee]'
                    : 'bg-[#161922] border-white/10 text-[#8b857b] hover:text-[#d5cdc0]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dust</span>
              </button>

              <div className="flex items-center gap-1 bg-[#161922] p-0.5 rounded-md border border-white/8">
                {QUALITY_OPTIONS.map((q) => {
                  const active = qualityTier === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onChangeQuality(q.id)}
                      className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#2a2f3d] text-[#f2ece1]'
                          : 'text-[#8b857b] hover:text-[#d8d0c4]'
                      }`}
                    >
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Piece Sculpt Showcase Inspector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/8">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              <span className="text-[11px] font-medium text-[#8d867c] mr-1 whitespace-nowrap shrink-0">
                Inspect Piece
              </span>
              <div className="flex items-center gap-1">
                {ARCHETYPE_ORDER.map((arch) => {
                  const isFocused = selectedPiece?.archetype === arch;
                  return (
                    <button
                      key={arch}
                      type="button"
                      onClick={() => onInspectArchetype(arch, showcaseArmy)}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isFocused
                          ? 'bg-[#c5934b]/20 border-[#c5934b] text-[#f5dfb8]'
                          : 'bg-[#151821] border-white/10 text-[#beb7aa] hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {ARCHETYPE_SPECS[arch].title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* White Stone / Black Stone Army Selector */}
            <div className="flex items-center gap-1 bg-[#161922] p-0.5 rounded-md border border-white/8 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onChangeShowcaseArmy('white');
                  if (selectedPiece) {
                    onInspectArchetype(selectedPiece.archetype, 'white');
                  }
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  showcaseArmy === 'white'
                    ? 'bg-[#dbd8d1] text-[#141518]'
                    : 'text-[#9d968a] hover:text-white'
                }`}
              >
                White Stone
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeShowcaseArmy('black');
                  if (selectedPiece) {
                    onInspectArchetype(selectedPiece.archetype, 'black');
                  }
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  showcaseArmy === 'black'
                    ? 'bg-[#30343c] text-[#f2ece1]'
                    : 'text-[#9d968a] hover:text-white'
                }`}
              >
                Black Stone
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
