/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcaneViewport, ArcaneViewportHandle } from './components/ArcaneViewport';
import { ArtDirectionModal } from './components/ArtDirectionModal';
import { ControlDock } from './components/ControlDock';
import {
  ArmyColor,
  CameraPresetId,
  PieceArchetype,
  QualityTier,
  SceneMetrics,
  SelectedPieceInfo,
} from './types/arcane';

const INITIAL_METRICS: SceneMetrics = {
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  fps: 60,
  isSoftwareGl: false,
};

export default function App() {
  const viewportRef = useRef<ArcaneViewportHandle | null>(null);

  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activePreset, setActivePreset] = useState<CameraPresetId | null>('grand-hall');
  const [selectedPiece, setSelectedPiece] = useState<SelectedPieceInfo | null>(null);
  const [showcaseArmy, setShowcaseArmy] = useState<ArmyColor>('white');
  const [qualityTier, setQualityTier] = useState<QualityTier>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'balanced',
  );
  const [flamesEnabled, setFlamesEnabled] = useState(true);
  const [dustEnabled, setDustEnabled] = useState(true);
  const [briefOpen, setBriefOpen] = useState(false);
  const [metrics, setMetrics] = useState<SceneMetrics>(INITIAL_METRICS);

  const handleSelectPreset = useCallback((preset: CameraPresetId) => {
    setActivePreset(preset);
    if (preset !== 'side-profile') {
      setSelectedPiece(null);
    }
    viewportRef.current?.setCameraPreset(preset);
  }, []);

  const handleInspectArchetype = useCallback(
    (archetype: PieceArchetype, army: ArmyColor) => {
      setActivePreset(null);
      setShowcaseArmy(army);
      viewportRef.current?.focusArchetype(archetype, army);
    },
    [],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedPiece(null);
    setActivePreset('grand-hall');
    viewportRef.current?.setCameraPreset('grand-hall');
  }, []);

  const handlePiecePickedFromScene = useCallback((piece: SelectedPieceInfo | null) => {
    setSelectedPiece(piece);
    if (piece) {
      setActivePreset(null);
      setShowcaseArmy(piece.army);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (briefOpen) {
          setBriefOpen(false);
        } else if (selectedPiece) {
          handleClearSelection();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [briefOpen, selectedPiece, handleClearSelection]);

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#090a0d]">
      {/* Full-Viewport 3D Gothic Chess Arena */}
      <ArcaneViewport
        ref={viewportRef}
        qualityTier={qualityTier}
        flamesEnabled={flamesEnabled}
        dustEnabled={dustEnabled}
        onSelectPiece={handlePiecePickedFromScene}
        onMetricsUpdate={setMetrics}
      />

      {/* Minimal Top Bar Overlay (unobstructed center, zero pill clutter) */}
      <header className="fixed top-0 left-0 right-0 z-20 px-4 sm:px-6 py-3.5 flex items-start justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="font-display text-lg sm:text-xl font-semibold tracking-wider text-[#efe7d8] whitespace-nowrap">
            ARCANE
          </h1>
          <p className="text-[11px] sm:text-xs text-[#9c9589] mt-0.5 whitespace-nowrap">
            Stage 01 · Enchanted Stone Arena · Drag to Orbit · Click Statue to Inspect
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBriefOpen(true)}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#e4dac7] bg-[#101218]/90 border border-[#c5934b]/30 hover:border-[#c5934b]/65 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#c5934b]" />
          <span>Stage 01 Brief</span>
        </button>
      </header>

      {/* Collapsible Bottom Control Dock */}
      <ControlDock
        collapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((v) => !v)}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        selectedPiece={selectedPiece}
        showcaseArmy={showcaseArmy}
        onChangeShowcaseArmy={setShowcaseArmy}
        onInspectArchetype={handleInspectArchetype}
        onClearSelection={handleClearSelection}
        qualityTier={qualityTier}
        onChangeQuality={setQualityTier}
        flamesEnabled={flamesEnabled}
        onToggleFlames={() => setFlamesEnabled((v) => !v)}
        dustEnabled={dustEnabled}
        onToggleDust={() => setDustEnabled((v) => !v)}
      />

      {/* On-Demand Stage 01 Art Direction & Technical Brief Modal */}
      <ArtDirectionModal
        open={briefOpen}
        onClose={() => setBriefOpen(false)}
        metrics={metrics}
      />
    </main>
  );
}
