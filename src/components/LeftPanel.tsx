import React from 'react';
import {
  PANEL_COPY,
  OBJECTIVES,
  EXTRACTION_PAD,
  SPAWNS,
  CHOKEPOINTS
} from '../data/mapData';
import { CheckCircle2, Circle, Lock, Unlock, Crosshair, ChevronRight } from 'lucide-react';

interface LeftPanelProps {
  collectedDrives: boolean[];
  onToggleDrive: (index: number) => void;
  onFocus: (point: { x: number; z: number }) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  collectedDrives,
  onToggleDrive,
  onFocus
}) => {
  const collectedCount = collectedDrives.filter(Boolean).length;
  const isUnlocked = collectedCount >= 3;

  return (
    <aside className="w-80 h-full overflow-y-auto bg-[#0F1E33] border-r border-[#2A3F5C] flex flex-col gap-4 p-4 shrink-0 text-sm">
      {/* 1. OBJECTIVES CARD (Poster-inspired high-contrast tactical card) */}
      <div className="bg-[#E9EDF2] text-[#0F1E33] rounded-lg p-3.5 shadow-lg border border-[#CBD5E1]">
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1EAEEF]"></span>
            <h2 className="font-condensed font-extrabold text-sm tracking-wider uppercase">
              Mission Objectives
            </h2>
          </div>
          <span className="font-mono-numbers font-bold text-xs bg-[#0F1E33] text-[#E8EEF6] px-2 py-0.5 rounded">
            {collectedCount}/3 DRIVES
          </span>
        </div>

        <p className="text-xs text-[#334155] leading-relaxed mb-3 font-medium">
          <strong>MAIN OBJECTIVE:</strong> Collect all 3 encrypted Data Drives scattered across Dead City and transport them to the Extraction LZ.
        </p>

        {/* Drives checklist */}
        <div className="flex flex-col gap-2">
          {OBJECTIVES.map((obj, idx) => {
            const isCollected = collectedDrives[idx];
            return (
              <div
                key={obj.id}
                className={`flex items-start gap-2.5 p-2 rounded transition-all border ${
                  isCollected
                    ? 'bg-[#2ECC40]/15 border-[#2ECC40]/50'
                    : 'bg-white border-[#E2E8F0] hover:border-[#1EAEEF]'
                }`}
              >
                <button
                  onClick={() => onToggleDrive(idx)}
                  className="mt-0.5 text-[#0F1E33] hover:text-[#1EAEEF] transition-colors"
                  title="Click to toggle collected state"
                >
                  {isCollected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC40] fill-[#2ECC40]/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>

                <div className="flex-1 cursor-pointer" onClick={() => onFocus({ x: obj.x, z: obj.z })}>
                  <div className="flex items-center justify-between">
                    <span className="font-condensed font-bold text-xs uppercase tracking-wide">
                      {obj.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocus({ x: obj.x, z: obj.z });
                      }}
                      className="text-[#64748B] hover:text-[#0F1E33]"
                      title="Fly camera to objective"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#475569] leading-tight mt-0.5">
                    {obj.desc}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Extraction Pad Status */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded border mt-1 transition-all ${
              isUnlocked
                ? 'bg-[#2ECC40]/20 border-[#2ECC40] text-[#14532D]'
                : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
            }`}
          >
            <div className="p-1 rounded bg-white/60">
              {isUnlocked ? (
                <Unlock className="w-4 h-4 text-[#2ECC40]" />
              ) : (
                <Lock className="w-4 h-4 text-[#E5202A]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-condensed font-bold text-xs uppercase tracking-wider">
                  {EXTRACTION_PAD.name}
                </span>
                <span
                  className={`text-[10px] font-mono-numbers font-bold px-1.5 py-0.5 rounded ${
                    isUnlocked
                      ? 'bg-[#2ECC40] text-[#0B1424] animate-pulse'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  {isUnlocked ? 'LZ UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="text-[10px] leading-tight mt-0.5">
                {isUnlocked
                  ? 'All drives secured. Extraction helicopter inbound!'
                  : 'Locked until all 3 Data Drives are retrieved.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHORT EXPLANATION (Poster-style Q&A cards 1 to 5) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded bg-[#FFD21F]"></span>
          <h3 className="font-condensed font-bold text-xs uppercase tracking-widest text-[#8FA3BC]">
            Level Design Briefing (1–5)
          </h3>
        </div>

        {PANEL_COPY.shortExplanation.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#14263F] border border-[#2A3F5C] rounded-lg p-3 transition-colors hover:border-[#3B557C]"
          >
            <div className="font-condensed font-bold text-xs text-[#FFD21F] mb-1 leading-snug">
              {item.q}
            </div>
            <p className="text-xs text-[#E8EEF6]/85 leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
};
