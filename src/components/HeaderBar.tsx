import React from 'react';
import {
  Layers,
  Sun,
  Moon,
  CloudSun,
  Eye,
  Camera,
  Compass,
  Play,
  RotateCcw,
  Ruler,
  HelpCircle,
  Volume2,
  VolumeX,
  Crosshair,
  MapPin
} from 'lucide-react';

interface HeaderBarProps {
  viewMode: '2D' | '3D';
  onToggleViewMode: () => void;
  timeOfDay: 'DUSK' | 'NIGHT' | 'DAY';
  onChangeTimeOfDay: (tod: 'DUSK' | 'NIGHT' | 'DAY') => void;
  activeTool: 'none' | 'measure' | 'sightline';
  onSelectTool: (tool: 'none' | 'measure' | 'sightline') => void;
  pingOwner: 'P1' | 'P2';
  onTogglePingOwner: () => void;
  colorBlindMode: boolean;
  onToggleColorBlind: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMissionPlaying: boolean;
  onToggleMission: () => void;
  onStartTour: () => void;
  onOpenHelp: () => void;
  onTakeScreenshot: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  viewMode,
  onToggleViewMode,
  timeOfDay,
  onChangeTimeOfDay,
  activeTool,
  onSelectTool,
  pingOwner,
  onTogglePingOwner,
  colorBlindMode,
  onToggleColorBlind,
  soundEnabled,
  onToggleSound,
  isMissionPlaying,
  onToggleMission,
  onStartTour,
  onOpenHelp,
  onTakeScreenshot
}) => {
  return (
    <header className="h-14 bg-[#0F1E33] border-b border-[#2A3F5C] px-4 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left: Branding & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E5202A] rounded flex items-center justify-center font-condensed font-black text-lg text-white shadow-md shadow-red-900/40">
            DC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-condensed font-extrabold text-lg tracking-wider text-[#E8EEF6]">
                DEAD CITY
              </span>
              <span className="text-[#2A3F5C] font-bold">|</span>
              <span className="font-condensed font-bold text-xs tracking-widest text-[#FFD21F] bg-[#FFD21F]/10 px-1.5 py-0.5 rounded border border-[#FFD21F]/30">
                HORDE MODE
              </span>
            </div>
            <span className="text-[10px] text-[#8FA3BC] tracking-wider font-mono-numbers -mt-0.5">
              TACTICAL LEVEL BRIEFING & BALANCING ENGINE
            </span>
          </div>
        </div>
      </div>

      {/* Center: Primary Controls */}
      <div className="hidden lg:flex items-center gap-3">
        {/* 2D / 3D Toggle */}
        <div className="flex bg-[#0B1424] p-0.5 rounded border border-[#2A3F5C]">
          <button
            onClick={() => viewMode !== '2D' && onToggleViewMode()}
            className={`px-3 py-1 rounded text-xs font-condensed font-bold tracking-wider transition-colors ${
              viewMode === '2D'
                ? 'bg-[#1EAEEF] text-[#0B1424] shadow-sm'
                : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            2D TACTICAL
          </button>
          <button
            onClick={() => viewMode !== '3D' && onToggleViewMode()}
            className={`px-3 py-1 rounded text-xs font-condensed font-bold tracking-wider transition-colors ${
              viewMode === '3D'
                ? 'bg-[#1EAEEF] text-[#0B1424] shadow-sm'
                : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            3D RECON
          </button>
        </div>

        {/* Time of Day */}
        <div className="flex bg-[#0B1424] p-0.5 rounded border border-[#2A3F5C]">
          <button
            title="Dusk Lighting"
            onClick={() => onChangeTimeOfDay('DUSK')}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              timeOfDay === 'DUSK' ? 'bg-[#2A3F5C] text-[#FFB885]' : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span className="font-condensed text-[11px] font-bold">DUSK</span>
          </button>
          <button
            title="Night Vision & Beacons"
            onClick={() => onChangeTimeOfDay('NIGHT')}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              timeOfDay === 'NIGHT' ? 'bg-[#2A3F5C] text-[#1EAEEF]' : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="font-condensed text-[11px] font-bold">NIGHT</span>
          </button>
          <button
            title="Overcast Daylight"
            onClick={() => onChangeTimeOfDay('DAY')}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              timeOfDay === 'DAY' ? 'bg-[#2A3F5C] text-[#FFD21F]' : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="font-condensed text-[11px] font-bold">DAY</span>
          </button>
        </div>

        {/* Tactical Tools: Measure, Sightline, Ping */}
        <div className="flex items-center gap-1 bg-[#0B1424] px-1 py-0.5 rounded border border-[#2A3F5C]">
          <button
            onClick={() => onSelectTool(activeTool === 'sightline' ? 'none' : 'sightline')}
            title="Sightline Visibility Probe (V)"
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeTool === 'sightline'
                ? 'bg-[#1EAEEF] text-[#0B1424] font-bold'
                : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-condensed text-[11px]">SIGHTLINE (V)</span>
          </button>
          <button
            onClick={() => onSelectTool(activeTool === 'measure' ? 'none' : 'measure')}
            title="Distance Measurement Tool (M)"
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeTool === 'measure'
                ? 'bg-[#FFD21F] text-[#0B1424] font-bold'
                : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="font-condensed text-[11px]">MEASURE (M)</span>
          </button>
          <button
            onClick={onTogglePingOwner}
            title="Shift+Click to Ping (P to toggle P1/P2)"
            className="px-2 py-1 rounded text-xs flex items-center gap-1 text-[#8FA3BC] hover:text-[#E8EEF6]"
          >
            <MapPin className={`w-3.5 h-3.5 ${pingOwner === 'P1' ? 'text-[#1EAEEF]' : 'text-[#FFD21F]'}`} />
            <span className="font-condensed text-[11px]">PING: {pingOwner}</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Mission Playback Button */}
        <button
          onClick={onToggleMission}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-condensed font-bold tracking-wider transition-all shadow-md ${
            isMissionPlaying
              ? 'bg-[#E5202A] text-white animate-pulse'
              : 'bg-[#2ECC40] hover:bg-[#25B236] text-[#0B1424]'
          }`}
        >
          {isMissionPlaying ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>STOP RUN</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN MISSION</span>
            </>
          )}
        </button>

        {/* Guided Tour Button */}
        <button
          onClick={onStartTour}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#14263F] hover:bg-[#1C3558] text-[#1EAEEF] border border-[#2A3F5C] rounded text-xs font-condensed font-bold tracking-wider transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>DESIGN INTENT TOUR</span>
        </button>

        {/* Screenshot */}
        <button
          onClick={onTakeScreenshot}
          title="Export 2x Tactical Screenshot"
          className="p-1.5 bg-[#0B1424] hover:bg-[#14263F] text-[#8FA3BC] hover:text-[#E8EEF6] border border-[#2A3F5C] rounded transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title="Tactical Audio SFX"
          className="p-1.5 bg-[#0B1424] hover:bg-[#14263F] text-[#8FA3BC] hover:text-[#E8EEF6] border border-[#2A3F5C] rounded transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2ECC40]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Help Modal */}
        <button
          onClick={onOpenHelp}
          title="Keyboard Shortcuts & Briefing Help (?)"
          className="p-1.5 bg-[#0B1424] hover:bg-[#14263F] text-[#8FA3BC] hover:text-[#E8EEF6] border border-[#2A3F5C] rounded transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
