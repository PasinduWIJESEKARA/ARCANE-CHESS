import { X } from 'lucide-react';
import { ARCHETYPE_ORDER, ARCHETYPE_SPECS } from '../data/archetypes';
import { SceneMetrics } from '../types/arcane';

interface ArtDirectionModalProps {
  open: boolean;
  onClose: () => void;
  metrics: SceneMetrics;
}

export function ArtDirectionModal({ open, onClose, metrics }: ArtDirectionModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-heading"
    >
      <div className="w-full max-w-4xl max-h-[86vh] flex flex-col bg-[#101218] border border-[#c5934b]/25 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#141720]">
          <div>
            <h2 id="brief-heading" className="font-display text-lg sm:text-xl text-[#f0e7d6]">
              ARCANE — Stage 01 Visual Development Brief
            </h2>
            <p className="text-xs text-[#9c9589] mt-0.5">
              Art Direction · Monumental Stone Armies · Gothic Underground Arena · WebGL 2 Architecture
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#a8a094] hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            aria-label="Close Stage 01 Brief"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto arcane-scroll space-y-6 text-sm text-[#cfc7b8] leading-relaxed">
          {/* 1. Art Direction & Design Language */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#c5934b] mb-2">
                01. Cinematic Fantasy Warrior Direction
              </h3>
              <p className="text-[#b8b0a2]">
                Enormous full-body medieval fantasy warrior statues brought onto an enchanted stone battlefield. Each piece features articulated greaves, plated cuirasses, heavy visored helmets, sculpted faces, shields, weapons, and—for the Queen—a towering Gothic war-throne for future combat choreography.
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#c5934b] mb-2">
                02. Opposing Stone & Metal Materials
              </h3>
              <ul className="space-y-2 text-[#b8b0a2]">
                <li>
                  <strong className="text-[#e7decb]">White Legion:</strong> Pale grey-white carved stone with subtle aged ivory highlights (<span className="font-mono-tabular">roughness 0.80</span>) and restrained pewter-bronze metallic ornamentation.
                </li>
                <li>
                  <strong className="text-[#e7decb]">Black Legion:</strong> Dark charcoal carved stone, deep slate-grey surfaces (<span className="font-mono-tabular">roughness 0.76</span>), and subtle blackened forged-iron details.
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Six Original Chess Piece Archetypes */}
          <section className="pt-4 border-t border-white/10">
            <h3 className="font-display text-sm font-semibold text-[#c5934b] mb-3">
              03. Six Sculpted Fantasy Chess Warriors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARCHETYPE_ORDER.map((id) => {
                const spec = ARCHETYPE_SPECS[id];
                return (
                  <div
                    key={id}
                    className="p-3.5 bg-[#151821] border border-white/8 rounded-md"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-display text-sm font-semibold text-[#efe6d6]">
                        {spec.title} · {spec.monumentName}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#c5934b]">
                        {spec.heightMeters}
                      </span>
                    </div>
                    <p className="text-xs text-[#a59d90] leading-relaxed">
                      {spec.sculptDetails}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Arena & Optimization Architecture */}
          <section className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#c5934b] mb-2">
                04. Gothic Underground Arena & Lighting
              </h3>
              <p className="text-[#b8b0a2]">
                The 8x8 chessboard sits atop a two-tier stone dais at the hall center, framed by 12 clustered Gothic piers, pointed overhead vault arches, recessed cavern walls, and 8 wrought-iron fire braziers. Cool moonlit cavern key lighting contrasts against warm flickering torchlight without heavy post-processing.
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#c5934b] mb-2">
                05. Integrated-GPU Performance Architecture
              </h3>
              <p className="text-[#b8b0a2] mb-2">
                Engineered for 2nd-gen Intel i3 / 4 GB RAM integrated graphics and mobile WebGL 2: each 24–36 part warrior statue is merged by material role into just 3 shared draw-call meshes, paired with <span className="font-mono-tabular">InstancedMesh</span> tiles & pillars, single shadow caster, and scalable DPR/shadow quality tiers.
              </p>
              <div className="text-xs font-mono-tabular text-[#9b9488] flex flex-wrap gap-x-4 gap-y-1">
                <span>Draw Calls: {metrics.drawCalls}</span>
                <span>Triangles: {metrics.triangles.toLocaleString()}</span>
                <span>Cached Geometries: {metrics.geometries}</span>
                <span>Textures: {metrics.textures}</span>
                <span>FPS: {metrics.fps}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
