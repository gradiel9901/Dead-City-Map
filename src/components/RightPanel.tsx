import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Compass,
  Play,
  Pause,
  SkipForward,
  Flame,
  Scale,
  MapPin,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Crosshair
} from 'lucide-react';
import { WAVES, WaveConfig, CHOKEPOINTS } from '../data/mapData';
import { navGraph, FairnessMetric } from '../utils/navGraph';
import { PingData } from './TacticalMapCanvas';

interface RightPanelProps {
  layers: Record<string, boolean>;
  onToggleLayer: (key: string) => void;
  onSoloLayer: (key: string) => void;
  onResetLayers: () => void;
  activeWave: WaveConfig | null;
  onSelectWave: (wave: WaveConfig) => void;
  isSimPlaying: boolean;
  onTogglePlaySim: () => void;
  simSpeed: number;
  onChangeSpeed: (spd: number) => void;
  onStepSim: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  highlightedPath: [number, number][] | null;
  onSetHighlightedPath: (path: [number, number][] | null) => void;
  pings: PingData[];
  onClearPings: () => void;
  onExportPings: () => void;
  onFocus: (point: { x: number; z: number }) => void;
  onStartTour: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  layers,
  onToggleLayer,
  onSoloLayer,
  onResetLayers,
  activeWave,
  onSelectWave,
  isSimPlaying,
  onTogglePlaySim,
  simSpeed,
  onChangeSpeed,
  onStepSim,
  showHeatmap,
  onToggleHeatmap,
  highlightedPath,
  onSetHighlightedPath,
  pings,
  onClearPings,
  onExportPings,
  onFocus,
  onStartTour
}) => {
  const [activeTab, setActiveTab] = useState<'sim' | 'fairness' | 'layers' | 'pings'>('sim');

  const fairnessReport = navGraph.computeFairnessReport();

  const layerDefinitions = [
    { key: 'playerSpawns', label: 'Player Spawns (S1, S2)', color: '#1EAEEF' },
    { key: 'objectives', label: 'Objectives (Data Drives)', color: '#FFD21F' },
    { key: 'hordeEntries', label: 'Horde Entries (H1–H4)', color: '#E5202A' },
    { key: 'chokepoints', label: 'Chokepoints (CP1–CP3)', color: '#E5202A' },
    { key: 'contestedZone', label: 'Contested Zone (Plaza)', color: '#E5202A' },
    { key: 'safeZone', label: 'Safe Zone (Bus Depot)', color: '#2ECC40' },
    { key: 'extractionPoint', label: 'Extraction LZ Pad', color: '#1EAEEF' },
    { key: 'playerRoutes', label: 'Player Routes (Cyan)', color: '#1EAEEF' },
    { key: 'flankRoutes', label: 'Flank Routes (Yellow)', color: '#FFD21F' },
    { key: 'extractionRoutes', label: 'Extraction Routes (Green)', color: '#2ECC40' },
    { key: 'buildings', label: 'Buildings & Structures', color: '#8FA3BC' },
    { key: 'streets', label: 'Streets & Overpass', color: '#2A3F5C' },
    { key: 'supplies', label: 'Ammo / Medical Caches', color: '#2ECC40' },
    { key: 'vehicles', label: 'Vehicle Wrecks', color: '#4A5D78' },
    { key: 'vegetation', label: 'Vegetation & Trees', color: '#246342' }
  ];

  return (
    <aside className="w-88 h-full overflow-y-auto bg-[#0F1E33] border-l border-[#2A3F5C] flex flex-col shrink-0 text-sm">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[#2A3F5C] bg-[#0B1424]">
        <button
          onClick={() => setActiveTab('sim')}
          className={`flex-1 py-2.5 text-center font-condensed font-bold text-xs tracking-wider transition-colors border-b-2 ${
            activeTab === 'sim'
              ? 'border-[#1EAEEF] text-[#1EAEEF] bg-[#0F1E33]'
              : 'border-transparent text-[#8FA3BC] hover:text-[#E8EEF6]'
          }`}
        >
          WAVE SIM
        </button>
        <button
          onClick={() => setActiveTab('fairness')}
          className={`flex-1 py-2.5 text-center font-condensed font-bold text-xs tracking-wider transition-colors border-b-2 ${
            activeTab === 'fairness'
              ? 'border-[#FFD21F] text-[#FFD21F] bg-[#0F1E33]'
              : 'border-transparent text-[#8FA3BC] hover:text-[#E8EEF6]'
          }`}
        >
          FAIRNESS
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 text-center font-condensed font-bold text-xs tracking-wider transition-colors border-b-2 ${
            activeTab === 'layers'
              ? 'border-[#2ECC40] text-[#2ECC40] bg-[#0F1E33]'
              : 'border-transparent text-[#8FA3BC] hover:text-[#E8EEF6]'
          }`}
        >
          LAYERS
        </button>
        <button
          onClick={() => setActiveTab('pings')}
          className={`flex-1 py-2.5 text-center font-condensed font-bold text-xs tracking-wider transition-colors border-b-2 ${
            activeTab === 'pings'
              ? 'border-[#1EAEEF] text-[#1EAEEF] bg-[#0F1E33]'
              : 'border-transparent text-[#8FA3BC] hover:text-[#E8EEF6]'
          }`}
        >
          PINGS ({pings.length})
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* TAB 1: WAVE SIMULATOR */}
        {activeTab === 'sim' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5202A] animate-pulse"></span>
                <h3 className="font-condensed font-bold text-xs uppercase tracking-widest text-[#E8EEF6]">
                  Horde Wave Flow Simulator
                </h3>
              </div>
              <button
                onClick={onToggleHeatmap}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-condensed font-bold border transition-colors ${
                  showHeatmap
                    ? 'bg-[#E5202A]/20 border-[#E5202A] text-[#FF6B72]'
                    : 'bg-[#14263F] border-[#2A3F5C] text-[#8FA3BC] hover:text-[#E8EEF6]'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>HEATMAP: {showHeatmap ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Wave Selector Cards */}
            <div className="flex flex-col gap-1.5">
              {WAVES.map((w) => {
                const isSelected = activeWave?.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => onSelectWave(w)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#14263F] border-[#E5202A] shadow-md shadow-red-950/30'
                        : 'bg-[#0B1424]/60 border-[#2A3F5C] hover:border-[#3B557C]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-condensed font-bold text-xs uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#E5202A] text-white' : 'bg-[#2A3F5C] text-[#8FA3BC]'
                          }`}
                        >
                          {w.name}
                        </span>
                        <span className="font-condensed font-semibold text-xs text-[#E8EEF6]">
                          {w.subtitle}
                        </span>
                      </div>
                      <span className="font-mono-numbers text-[11px] text-[#8FA3BC]">
                        {w.totalAgents} AGENTS
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8FA3BC] mt-1 leading-snug">
                      {w.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Simulator Controls */}
            <div className="bg-[#14263F] border border-[#2A3F5C] rounded-lg p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-condensed font-bold text-xs uppercase text-[#8FA3BC]">
                  Simulation Playback
                </span>
                <span className="font-mono-numbers text-xs text-[#1EAEEF]">
                  ACTIVE WAVE: {activeWave ? activeWave.name : 'NONE'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePlaySim}
                  className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 text-xs font-condensed font-bold transition-colors ${
                    isSimPlaying
                      ? 'bg-[#E5202A] text-white'
                      : 'bg-[#1EAEEF] hover:bg-[#1694CD] text-[#0B1424]'
                  }`}
                >
                  {isSimPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE SIM</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>START WAVE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onStepSim}
                  title="Step 1 Frame"
                  className="p-1.5 bg-[#0B1424] hover:bg-[#1C3558] text-[#8FA3BC] hover:text-[#E8EEF6] border border-[#2A3F5C] rounded transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed Multiplier */}
                <div className="flex bg-[#0B1424] p-0.5 rounded border border-[#2A3F5C]">
                  {[0.5, 1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onChangeSpeed(spd)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono-numbers rounded ${
                        simSpeed === spd
                          ? 'bg-[#2A3F5C] text-[#E8EEF6] font-bold'
                          : 'text-[#8FA3BC] hover:text-[#E8EEF6]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FAIRNESS & PACING ANALYZER */}
        {activeTab === 'fairness' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#FFD21F]" />
                <h3 className="font-condensed font-bold text-xs uppercase tracking-widest text-[#E8EEF6]">
                  Fairness & Pacing Analyzer
                </h3>
              </div>
              <span className="text-[10px] font-mono-numbers text-[#8FA3BC]">
                DIJKSTRA GRAPH
              </span>
            </div>

            <p className="text-xs text-[#8FA3BC] leading-relaxed">
              Analyzes shortest-path traversal distances between Spawn 1 (West) and Spawn 2 (East) toward mission objectives.
              Click any row to draw the exact path in the viewport.
            </p>

            {/* Metrics Table */}
            <div className="flex flex-col gap-2">
              {fairnessReport.metrics.map((m) => {
                const isSelected = highlightedPath === m.s1Path || highlightedPath === m.s2Path;
                return (
                  <div
                    key={m.targetId}
                    onClick={() => {
                      if (highlightedPath === m.s1Path) {
                        onSetHighlightedPath(null);
                      } else {
                        onSetHighlightedPath(m.s1Path);
                      }
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#14263F] border-[#FFD21F]'
                        : 'bg-[#0B1424]/60 border-[#2A3F5C] hover:border-[#3B557C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-condensed font-bold text-xs uppercase text-[#E8EEF6]">
                        {m.targetName}
                      </span>
                      <span
                        className={`text-[10px] font-mono-numbers font-bold px-1.5 py-0.5 rounded ${
                          m.verdict === 'BALANCED'
                            ? 'bg-[#2ECC40]/20 text-[#2ECC40] border border-[#2ECC40]/40'
                            : 'bg-[#FFD21F]/20 text-[#FFD21F] border border-[#FFD21F]/40'
                        }`}
                      >
                        {m.verdict} (Δ{m.deltaPercent}%)
                      </span>
                    </div>

                    {/* S1 vs S2 Bars */}
                    <div className="flex flex-col gap-1 text-[11px] font-mono-numbers">
                      <div className="flex items-center justify-between text-[#1EAEEF]">
                        <span>S1 (West):</span>
                        <span>{m.s1Distance} m</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0F1E33] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#1EAEEF]"
                          style={{ width: `${Math.min(100, (m.s1Distance / 350) * 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[#FFD21F] mt-0.5">
                        <span>S2 (East):</span>
                        <span>{m.s2Distance} m</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0F1E33] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#FFD21F]"
                          style={{ width: `${Math.min(100, (m.s2Distance / 350) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chokepoint Exposure Statistics */}
            <div className="bg-[#14263F] border border-[#2A3F5C] rounded-lg p-3 flex flex-col gap-2">
              <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#8FA3BC]">
                Chokepoint Traffic Exposure
              </span>
              <div className="grid grid-cols-3 gap-2">
                {CHOKEPOINTS.map((cp) => {
                  const exposure = fairnessReport.cpExposure[cp.code] || 0;
                  return (
                    <div key={cp.id} className="bg-[#0B1424] p-2 rounded border border-[#2A3F5C] text-center">
                      <div className="font-condensed font-bold text-xs text-[#E5202A]">{cp.code}</div>
                      <div className="font-mono-numbers text-xs text-[#E8EEF6] mt-0.5">{exposure} PATHS</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LAYER MANAGER */}
        {activeTab === 'layers' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2ECC40]" />
                <h3 className="font-condensed font-bold text-xs uppercase tracking-widest text-[#E8EEF6]">
                  Tactical Layer Manager
                </h3>
              </div>
              <button
                onClick={onResetLayers}
                className="text-[11px] font-condensed font-bold text-[#8FA3BC] hover:text-[#E8EEF6] underline"
              >
                RESET ALL
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {layerDefinitions.map((l) => {
                const isVisible = layers[l.key] ?? true;
                return (
                  <div
                    key={l.key}
                    className="flex items-center justify-between p-2 rounded bg-[#14263F] border border-[#2A3F5C] hover:border-[#3B557C] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: l.color }}
                      ></span>
                      <span className="font-condensed font-semibold text-xs text-[#E8EEF6]">
                        {l.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          if (e.altKey) {
                            onSoloLayer(l.key);
                          } else {
                            onToggleLayer(l.key);
                          }
                        }}
                        className={`p-1 rounded transition-colors ${
                          isVisible
                            ? 'text-[#2ECC40] hover:bg-[#2ECC40]/10'
                            : 'text-[#64748B] hover:bg-[#64748B]/10'
                        }`}
                        title="Toggle Visibility (Alt+Click to Solo)"
                      >
                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CO-OP PINGS */}
        {activeTab === 'pings' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1EAEEF]" />
                <h3 className="font-condensed font-bold text-xs uppercase tracking-widest text-[#E8EEF6]">
                  Tactical Ping Register
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onExportPings}
                  title="Export Pings as JSON"
                  className="p-1 text-[#8FA3BC] hover:text-[#E8EEF6] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClearPings}
                  title="Clear All Pings"
                  className="p-1 text-[#8FA3BC] hover:text-[#E5202A] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-[#8FA3BC] leading-relaxed">
              Use <strong>Shift + Click</strong> anywhere on the map to place numbered tactical pings.
            </p>

            {pings.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B] bg-[#0B1424] rounded-lg border border-[#2A3F5C]">
                No pings placed yet. Hold Shift and click the map.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {pings.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded bg-[#14263F] border border-[#2A3F5C] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-mono-numbers font-bold text-xs ${
                          p.owner === 'P1'
                            ? 'bg-[#1EAEEF] text-[#0B1424]'
                            : 'bg-[#FFD21F] text-[#0B1424]'
                        }`}
                      >
                        #{p.number}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-condensed font-bold text-xs text-[#E8EEF6]">
                          {p.owner} Ping at ({p.x}, {p.z})
                        </span>
                        <span className="text-[10px] text-[#8FA3BC] font-mono-numbers">
                          {p.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onFocus({ x: p.x, z: p.z })}
                      className="p-1 text-[#8FA3BC] hover:text-[#E8EEF6]"
                      title="Fly camera to ping"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
