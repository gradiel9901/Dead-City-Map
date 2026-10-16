import React from 'react';
import { X, Navigation, AlertTriangle, ShieldCheck, Crosshair, MapPin } from 'lucide-react';
import { navGraph } from '../utils/navGraph';

interface InfoCardModalProps {
  entity: any | null;
  onClose: () => void;
  onFocus: (point: { x: number; z: number }) => void;
}

export const InfoCardModal: React.FC<InfoCardModalProps> = ({
  entity,
  onClose,
  onFocus
}) => {
  if (!entity) return null;

  // Compute live nav distances to S1 and S2 if coordinates are available
  let s1Dist: number | null = null;
  let s2Dist: number | null = null;

  if (entity.id) {
    const s1Res = navGraph.findShortestPath('s1', entity.id);
    const s2Res = navGraph.findShortestPath('s2', entity.id);
    if (s1Res.distance !== Infinity && s1Res.distance > 0) s1Dist = s1Res.distance;
    if (s2Res.distance !== Infinity && s2Res.distance > 0) s2Dist = s2Res.distance;
  }

  const coords = entity.x !== undefined && entity.z !== undefined
    ? `(${entity.x}m, ${entity.z}m)`
    : entity.footprint
    ? `x: ${entity.footprint[0]}–${entity.footprint[2]}m, z: ${entity.footprint[1]}–${entity.footprint[3]}m`
    : null;

  const focusPt = entity.x !== undefined && entity.z !== undefined
    ? { x: entity.x, z: entity.z }
    : entity.footprint
    ? { x: (entity.footprint[0] + entity.footprint[2]) / 2, z: (entity.footprint[1] + entity.footprint[3]) / 2 }
    : entity.center
    ? entity.center
    : null;

  return (
    <div className="absolute top-16 left-84 z-30 w-80 bg-[#0F1E33]/95 backdrop-blur-md border border-[#2A3F5C] rounded-lg shadow-2xl p-4 text-[#E8EEF6]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#2A3F5C] pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          {entity.code && (
            <span className="font-condensed font-black text-xs px-2 py-0.5 rounded bg-[#1EAEEF] text-[#0B1424]">
              {entity.code}
            </span>
          )}
          <h3 className="font-condensed font-extrabold text-base tracking-wide text-[#E8EEF6] uppercase">
            {entity.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-[#8FA3BC] hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="font-mono-numbers text-[10px] bg-[#14263F] border border-[#2A3F5C] px-2 py-0.5 rounded text-[#8FA3BC] uppercase">
          TYPE: {entity.type || 'SECTOR'}
        </span>
        {coords && (
          <span className="font-mono-numbers text-[10px] bg-[#14263F] border border-[#2A3F5C] px-2 py-0.5 rounded text-[#1EAEEF]">
            {coords}
          </span>
        )}
        {entity.height && (
          <span className="font-mono-numbers text-[10px] bg-[#14263F] border border-[#2A3F5C] px-2 py-0.5 rounded text-[#FFD21F]">
            H: {entity.height}m
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-[#CBD5E1] leading-relaxed mb-3">
        {entity.desc}
      </p>

      {/* Tactical distances */}
      {(s1Dist !== null || s2Dist !== null) && (
        <div className="bg-[#0B1424] p-2 rounded border border-[#2A3F5C] mb-3 flex flex-col gap-1 text-[11px] font-mono-numbers">
          <div className="text-[10px] font-condensed font-bold text-[#8FA3BC] uppercase">
            Nav-Graph Distance from Spawns:
          </div>
          {s1Dist !== null && (
            <div className="flex justify-between text-[#1EAEEF]">
              <span>Spawn 1 (West):</span>
              <span>{s1Dist} m</span>
            </div>
          )}
          {s2Dist !== null && (
            <div className="flex justify-between text-[#FFD21F]">
              <span>Spawn 2 (East):</span>
              <span>{s2Dist} m</span>
            </div>
          )}
        </div>
      )}

      {/* Action: Focus Camera */}
      {focusPt && (
        <button
          onClick={() => onFocus(focusPt)}
          className="w-full py-1.5 bg-[#14263F] hover:bg-[#1E3A63] border border-[#2A3F5C] rounded font-condensed font-bold text-xs tracking-wider text-[#1EAEEF] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>FLY CAMERA TO TARGET</span>
        </button>
      )}
    </div>
  );
};
