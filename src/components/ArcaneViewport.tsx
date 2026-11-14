import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { ArcaneSceneManager } from '../three/ArcaneSceneManager';
import {
  ArmyColor,
  CameraPresetId,
  PieceArchetype,
  QualityTier,
  SceneMetrics,
  SelectedPieceInfo,
} from '../types/arcane';

export interface ArcaneViewportHandle {
  setCameraPreset: (preset: CameraPresetId) => void;
  focusArchetype: (archetype: PieceArchetype, army: ArmyColor) => void;
}

interface ArcaneViewportProps {
  qualityTier: QualityTier;
  flamesEnabled: boolean;
  dustEnabled: boolean;
  onSelectPiece: (piece: SelectedPieceInfo | null) => void;
  onMetricsUpdate: (metrics: SceneMetrics) => void;
}

export const ArcaneViewport = forwardRef<ArcaneViewportHandle, ArcaneViewportProps>(
  function ArcaneViewport(
    { qualityTier, flamesEnabled, dustEnabled, onSelectPiece, onMetricsUpdate },
    ref,
  ) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const managerRef = useRef<ArcaneSceneManager | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [webglUnavailable, setWebglUnavailable] = useState(false);

    const callbacksRef = useRef({ onSelectPiece, onMetricsUpdate });
    callbacksRef.current = { onSelectPiece, onMetricsUpdate };

    const initialPropsRef = useRef({ qualityTier, flamesEnabled, dustEnabled });

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      // Verify WebGL2 availability before initializing renderer
      const testCanvas = document.createElement('canvas');
      const gl2 = testCanvas.getContext('webgl2');
      if (!gl2) {
        setWebglUnavailable(true);
        return;
      }
      gl2.getExtension('WEBGL_lose_context')?.loseContext();

      const manager = new ArcaneSceneManager(
        container,
        initialPropsRef.current.qualityTier,
        {
          onSelectPiece: (piece) => callbacksRef.current.onSelectPiece(piece),
          onMetricsUpdate: (metrics) => callbacksRef.current.onMetricsUpdate(metrics),
          onContextLost: (lost) => setContextLost(lost),
        },
      );
      manager.setFlamesEnabled(initialPropsRef.current.flamesEnabled);
      manager.setDustEnabled(initialPropsRef.current.dustEnabled);
      managerRef.current = manager;

      return () => {
        manager.dispose();
        managerRef.current = null;
      };
    }, []);

    useEffect(() => {
      managerRef.current?.setQualityTier(qualityTier);
    }, [qualityTier]);

    useEffect(() => {
      managerRef.current?.setFlamesEnabled(flamesEnabled);
    }, [flamesEnabled]);

    useEffect(() => {
      managerRef.current?.setDustEnabled(dustEnabled);
    }, [dustEnabled]);

    useImperativeHandle(
      ref,
      () => ({
        setCameraPreset: (preset) => managerRef.current?.setCameraPreset(preset),
        focusArchetype: (archetype, army) =>
          managerRef.current?.focusArchetype(archetype, army),
      }),
      [],
    );

    return (
      <div className="relative w-full h-full select-none">
        <div
          ref={mountRef}
          className="w-full h-full touch-none"
          aria-label="ARCANE 3D Gothic Chess Arena"
        />

        {(webglUnavailable || contextLost) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#090a0d] p-6 text-center">
            <div className="max-w-md border border-[#c5934b]/25 bg-[#11131a] p-6 rounded-lg">
              <h2 className="font-display text-lg text-[#e7dcc8] mb-2">
                {webglUnavailable ? 'WebGL 2 Required' : 'Graphics Context Interrupted'}
              </h2>
              <p className="text-sm text-[#9e988e] leading-relaxed">
                {webglUnavailable
                  ? 'This 3D Gothic chess arena requires a WebGL 2 compatible browser and GPU driver.'
                  : 'The WebGL rendering context was paused by the device. Restoring the arena automatically.'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
