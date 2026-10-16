import React from 'react';
import { MAP_DIMENSIONS, BUILDINGS, SPAWNS, OBJECTIVES, EXTRACTION_PAD } from '../data/mapData';

interface MinimapProps {
  onJumpTo: (point: { x: number; z: number }) => void;
  playerPos?: { p1?: { x: number; z: number }; p2?: { x: number; z: number } };
}

export const Minimap: React.FC<MinimapProps> = ({ onJumpTo, playerPos }) => {
  const mapWidth = 140;
  const mapHeight = Math.round((mapWidth * MAP_DIMENSIONS.depth) / MAP_DIMENSIONS.width); // ~154px

  const scaleX = mapWidth / MAP_DIMENSIONS.width;
  const scaleZ = mapHeight / MAP_DIMENSIONS.depth;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = Math.round(clickX / scaleX);
    const worldZ = Math.round(clickY / scaleZ);

    onJumpTo({ x: worldX, z: worldZ });
  };

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-4 right-4 z-10 bg-[#0F1E33]/90 border border-[#2A3F5C] rounded-lg p-1.5 shadow-2xl backdrop-blur-md cursor-pointer hover:border-[#1EAEEF] transition-all select-none"
      title="Minimap — Click to jump camera"
    >
      <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-[#2A3F5C]/60 text-[9px] font-mono-numbers text-[#8FA3BC]">
        <span>MINIMAP</span>
        <span className="text-[#1EAEEF]">TACTICAL RADAR</span>
      </div>

      <div
        style={{ width: mapWidth, height: mapHeight }}
        className="relative bg-[#0B1424] border border-[#14263F] overflow-hidden rounded"
      >
        {/* Central Avenue & Cross Street */}
        <div
          className="absolute bg-[#14263F]"
          style={{
            left: 140 * scaleX,
            top: 0,
            width: 20 * scaleX,
            height: mapHeight
          }}
        />
        <div
          className="absolute bg-[#14263F]"
          style={{
            left: 0,
            top: 176 * scaleZ,
            width: mapWidth,
            height: 16 * scaleZ
          }}
        />

        {/* Buildings */}
        {BUILDINGS.map(b => (
          <div
            key={b.id}
            className="absolute bg-[#2A3F5C]/70 border border-[#3B557C]/40"
            style={{
              left: b.footprint[0] * scaleX,
              top: b.footprint[1] * scaleZ,
              width: (b.footprint[2] - b.footprint[0]) * scaleX,
              height: (b.footprint[3] - b.footprint[1]) * scaleZ
            }}
          />
        ))}

        {/* Spawns */}
        {SPAWNS.map(s => (
          <div
            key={s.id}
            className="absolute w-2 h-2 rounded-full bg-[#1EAEEF] border border-white -translate-x-1/2 -translate-y-1/2"
            style={{ left: s.x * scaleX, top: s.z * scaleZ }}
          />
        ))}

        {/* Objectives */}
        {OBJECTIVES.map(obj => (
          <div
            key={obj.id}
            className="absolute w-2 h-2 rotate-45 bg-[#FFD21F] border border-black -translate-x-1/2 -translate-y-1/2"
            style={{ left: obj.x * scaleX, top: obj.z * scaleZ }}
          />
        ))}

        {/* Extraction Pad */}
        <div
          className="absolute bg-[#2ECC40]/40 border border-[#2ECC40]"
          style={{
            left: EXTRACTION_PAD.bounds.x0 * scaleX,
            top: EXTRACTION_PAD.bounds.z0 * scaleZ,
            width: (EXTRACTION_PAD.bounds.x1 - EXTRACTION_PAD.bounds.x0) * scaleX,
            height: (EXTRACTION_PAD.bounds.z1 - EXTRACTION_PAD.bounds.z0) * scaleZ
          }}
        />

        {/* Dynamic Players */}
        {playerPos?.p1 && (
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-[#1EAEEF] ring-2 ring-[#1EAEEF]/50 animate-ping -translate-x-1/2 -translate-y-1/2"
            style={{ left: playerPos.p1.x * scaleX, top: playerPos.p1.z * scaleZ }}
          />
        )}
      </div>
    </div>
  );
};
