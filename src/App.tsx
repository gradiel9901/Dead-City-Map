import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { TacticalMapCanvas, PingData } from './components/TacticalMapCanvas';
import { InfoCardModal } from './components/InfoCardModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { HelpModal } from './components/HelpModal';
import { Minimap } from './components/Minimap';
import { WAVES, WaveConfig, OBJECTIVES, EXTRACTION_PAD } from './data/mapData';
import { playTacticalSound } from './utils/audio';

export const App: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [timeOfDay, setTimeOfDay] = useState<'DUSK' | 'NIGHT' | 'DAY'>('DUSK');
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Layers
  const [layers, setLayers] = useState<Record<string, boolean>>({
    playerSpawns: true,
    objectives: true,
    hordeEntries: true,
    chokepoints: true,
    contestedZone: true,
    safeZone: true,
    extractionPoint: true,
    playerRoutes: true,
    flankRoutes: true,
    extractionRoutes: true,
    buildings: true,
    streets: true,
    supplies: true,
    vehicles: true,
    vegetation: true
  });

  // Wave Simulator
  const [activeWave, setActiveWave] = useState<WaveConfig | null>(WAVES[0]);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simTime, setSimTime] = useState<number>(0);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Tools & Pings
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'sightline'>('none');
  const [pingOwner, setPingOwner] = useState<'P1' | 'P2'>('P1');
  const [pings, setPings] = useState<PingData[]>([]);

  // Selection & Inspector
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<[number, number][] | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ x: number; z: number } | null>(null);

  // Mission Playback
  const [collectedDrives, setCollectedDrives] = useState<boolean[]>([false, false, false]);
  const [isMissionPlaying, setIsMissionPlaying] = useState<boolean>(false);
  const [missionProgress, setMissionProgress] = useState<number>(0);
  const [missionCompleteStats, setMissionCompleteStats] = useState<{ time: string; distance: string } | null>(null);

  // Modals
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Mobile drawer states
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'left' | 'right'>('none');

  // Mission playback animation loop
  useEffect(() => {
    let animId: number;
    if (isMissionPlaying) {
      const startTime = performance.now();
      const missionDuration = 22000; // 22 seconds for full co-op run

      const stepMission = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / missionDuration);
        setMissionProgress(progress);

        // Update collected drives along path milestones
        if (progress >= 0.25 && !collectedDrives[0]) {
          setCollectedDrives(prev => [true, prev[1], prev[2]]);
          playTacticalSound('objective', soundEnabled);
        }
        if (progress >= 0.55 && !collectedDrives[1]) {
          setCollectedDrives(prev => [prev[0], true, prev[2]]);
          playTacticalSound('objective', soundEnabled);
        }
        if (progress >= 0.82 && !collectedDrives[2]) {
          setCollectedDrives([true, true, true]);
          playTacticalSound('exfil_ready', soundEnabled);
        }

        if (progress < 1) {
          animId = requestAnimationFrame(stepMission);
        } else {
          setIsMissionPlaying(false);
          setMissionCompleteStats({
            time: '04:12 (Simulated)',
            distance: '1,280 m (Combined Fireteam)'
          });
          playTacticalSound('exfil_ready', soundEnabled);
        }
      };

      animId = requestAnimationFrame(stepMission);
    }

    return () => cancelAnimationFrame(animId);
  }, [isMissionPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts if typing in input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case 't':
          setViewMode(prev => (prev === '2D' ? '3D' : '2D'));
          playTacticalSound('click', soundEnabled);
          break;
        case ' ':
          e.preventDefault();
          setIsSimPlaying(prev => !prev);
          playTacticalSound('wave_start', soundEnabled);
          break;
        case '1':
          setActiveWave(WAVES[0]);
          playTacticalSound('click', soundEnabled);
          break;
        case '2':
          setActiveWave(WAVES[1]);
          playTacticalSound('click', soundEnabled);
          break;
        case '3':
          setActiveWave(WAVES[2]);
          playTacticalSound('click', soundEnabled);
          break;
        case '4':
          setActiveWave(WAVES[3]);
          playTacticalSound('click', soundEnabled);
          break;
        case '5':
          setActiveWave(WAVES[4]);
          playTacticalSound('click', soundEnabled);
          break;
        case 'm':
          setActiveTool(prev => (prev === 'measure' ? 'none' : 'measure'));
          playTacticalSound('click', soundEnabled);
          break;
        case 'v':
          setActiveTool(prev => (prev === 'sightline' ? 'none' : 'sightline'));
          playTacticalSound('click', soundEnabled);
          break;
        case 'p':
          setPingOwner(prev => (prev === 'P1' ? 'P2' : 'P1'));
          playTacticalSound('click', soundEnabled);
          break;
        case 'g':
          setIsTourOpen(true);
          playTacticalSound('click', soundEnabled);
          break;
        case 'h':
        case '?':
          setIsHelpOpen(prev => !prev);
          playTacticalSound('click', soundEnabled);
          break;
        case 'r':
          setFocusTarget({ x: 150, z: 165 });
          playTacticalSound('click', soundEnabled);
          break;
        case 'escape':
          setSelectedEntity(null);
          setActiveTool('none');
          setIsTourOpen(false);
          setIsHelpOpen(false);
          setHighlightedPath(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled]);

  // Handlers
  const handleToggleDrive = (index: number) => {
    setCollectedDrives(prev => {
      const next = [...prev];
      next[index] = !next[index];
      if (next[index]) {
        playTacticalSound('objective', soundEnabled);
      }
      return next;
    });
  };

  const handleToggleLayer = (key: string) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
    playTacticalSound('click', soundEnabled);
  };

  const handleSoloLayer = (soloKey: string) => {
    setLayers(prev => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach(k => {
        next[k] = k === soloKey;
      });
      return next;
    });
    playTacticalSound('click', soundEnabled);
  };

  const handleResetLayers = () => {
    setLayers({
      playerSpawns: true,
      objectives: true,
      hordeEntries: true,
      chokepoints: true,
      contestedZone: true,
      safeZone: true,
      extractionPoint: true,
      playerRoutes: true,
      flankRoutes: true,
      extractionRoutes: true,
      buildings: true,
      streets: true,
      supplies: true,
      vehicles: true,
      vegetation: true
    });
    playTacticalSound('click', soundEnabled);
  };

  const handleTakeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `dead-city-map-${dateStr}-${timeStr}.png`;

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
    playTacticalSound('click', soundEnabled);
  };

  const handleExportPings = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pings, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `dead-city-pings-${Date.now()}.json`;
    a.click();
  };

  const collectedCount = collectedDrives.filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1424] text-[#E8EEF6]">
      {/* Header Bar */}
      <HeaderBar
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => (prev === '2D' ? '3D' : '2D'))}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        pingOwner={pingOwner}
        onTogglePingOwner={() => setPingOwner(prev => (prev === 'P1' ? 'P2' : 'P1'))}
        colorBlindMode={colorBlindMode}
        onToggleColorBlind={() => setColorBlindMode(prev => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        isMissionPlaying={isMissionPlaying}
        onToggleMission={() => {
          if (!isMissionPlaying) {
            setCollectedDrives([false, false, false]);
            setIsMissionPlaying(true);
            playTacticalSound('wave_start', soundEnabled);
          } else {
            setIsMissionPlaying(false);
          }
        }}
        onStartTour={() => setIsTourOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onTakeScreenshot={handleTakeScreenshot}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Objectives & Briefing Explanation */}
        <div className="hidden lg:block h-full">
          <LeftPanel
            collectedDrives={collectedDrives}
            onToggleDrive={handleToggleDrive}
            onFocus={setFocusTarget}
          />
        </div>

        {/* Center: Tactical Map Viewport */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#0B1424]">
          <TacticalMapCanvas
            viewMode={viewMode}
            timeOfDay={timeOfDay}
            colorBlindMode={colorBlindMode}
            layers={layers}
            activeWave={activeWave}
            isSimPlaying={isSimPlaying}
            simSpeed={simSpeed}
            simTime={simTime}
            showHeatmap={showHeatmap}
            activeTool={activeTool}
            pingOwner={pingOwner}
            pings={pings}
            onAddPing={p => {
              setPings(prev => [...prev, p]);
              playTacticalSound('ping', soundEnabled);
            }}
            onRemovePing={id => setPings(prev => prev.filter(p => p.id !== id))}
            onSelectEntity={ent => {
              setSelectedEntity(ent);
              if (ent) playTacticalSound('click', soundEnabled);
            }}
            onHoverEntity={setHoveredEntity}
            highlightedPath={highlightedPath}
            focusTarget={focusTarget}
            collectedDrivesCount={collectedCount}
            isMissionPlaying={isMissionPlaying}
            missionProgress={missionProgress}
          />

          {/* Minimap */}
          <Minimap onJumpTo={setFocusTarget} />

          {/* Info Card Modal for Clicked Entity */}
          <InfoCardModal
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onFocus={setFocusTarget}
          />

          {/* Mission Complete Overlay */}
          {missionCompleteStats && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0F1E33] border-2 border-[#2ECC40] rounded-xl p-6 max-w-md w-full shadow-2xl text-center">
                <div className="w-12 h-12 bg-[#2ECC40]/20 text-[#2ECC40] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-condensed font-extrabold text-2xl">✓</span>
                </div>
                <h2 className="font-condensed font-extrabold text-2xl text-[#E8EEF6] uppercase tracking-wider mb-1">
                  MISSION ACCOMPLISHED
                </h2>
                <p className="text-xs text-[#8FA3BC] mb-4">
                  All 3 encrypted Data Drives extracted successfully. Squad evacuated via LZ pad.
                </p>
                <div className="bg-[#14263F] border border-[#2A3F5C] rounded-lg p-3 mb-4 flex justify-around text-xs font-mono-numbers">
                  <div>
                    <div className="text-[10px] text-[#8FA3BC] uppercase">EXFIL TIME</div>
                    <div className="text-[#2ECC40] font-bold text-sm">{missionCompleteStats.time}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8FA3BC] uppercase">DISTANCE TRAVERSED</div>
                    <div className="text-[#1EAEEF] font-bold text-sm">{missionCompleteStats.distance}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMissionCompleteStats(null)}
                  className="w-full py-2 bg-[#2ECC40] hover:bg-[#25B236] text-[#0B1424] font-condensed font-bold text-sm uppercase rounded transition-colors"
                >
                  RETURN TO BRIEFING TABLE
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Column: Wave Simulator, Fairness Analyzer, Layers & Pings */}
        <div className="hidden md:block h-full">
          <RightPanel
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onSoloLayer={handleSoloLayer}
            onResetLayers={handleResetLayers}
            activeWave={activeWave}
            onSelectWave={w => {
              setActiveWave(w);
              playTacticalSound('click', soundEnabled);
            }}
            isSimPlaying={isSimPlaying}
            onTogglePlaySim={() => {
              setIsSimPlaying(prev => !prev);
              playTacticalSound('wave_start', soundEnabled);
            }}
            simSpeed={simSpeed}
            onChangeSpeed={setSimSpeed}
            onStepSim={() => {
              setSimTime(t => t + 0.1);
              playTacticalSound('click', soundEnabled);
            }}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => {
              setShowHeatmap(prev => !prev);
              playTacticalSound('click', soundEnabled);
            }}
            highlightedPath={highlightedPath}
            onSetHighlightedPath={setHighlightedPath}
            pings={pings}
            onClearPings={() => setPings([])}
            onExportPings={handleExportPings}
            onFocus={setFocusTarget}
            onStartTour={() => setIsTourOpen(true)}
          />
        </div>
      </div>

      {/* Footer Strip */}
      <footer className="h-7 bg-[#0B1424] border-t border-[#2A3F5C] px-4 flex items-center justify-between text-[11px] font-mono-numbers text-[#8FA3BC] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="font-condensed font-bold tracking-widest text-[#FFD21F]">
            TACTICAL PROTOCOL:
          </span>
          <span className="text-[#E8EEF6]">SURVIVE</span>
          <span className="text-[#2A3F5C]">/</span>
          <span className="text-[#E8EEF6]">COLLECT</span>
          <span className="text-[#2A3F5C]">/</span>
          <span className="text-[#E8EEF6]">EXTRACT</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">SCALE: 1 UNIT = 1 METER (300m × 330m)</span>
          <span className="text-[#1EAEEF] font-bold">READY FOR DEPLOYMENT</span>
        </div>
      </footer>

      {/* Modals */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onFocus={setFocusTarget}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
