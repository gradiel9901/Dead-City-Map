import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Compass, Crosshair } from 'lucide-react';
import { SPAWNS, OBJECTIVES, CHOKEPOINTS, EXTRACTION_PAD } from '../data/mapData';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocus: (point: { x: number; z: number }) => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: '2-Player Co-op Spawns',
    subtitle: 'Separate Starts, Shared Destination',
    desc: 'Player 1 spawns at S1 west of West Block, while Player 2 spawns at S2 east near East Towers. This forces immediate communication to coordinate meeting up rather than clustering.',
    target: { x: 150, z: 99 }
  },
  {
    step: 2,
    title: 'Three Main Tactical Lanes',
    subtitle: 'North Alley, Central Overpass, South Highway',
    desc: 'The city layout provides three distinct parallel east-west corridors. Players can split to cover multiple angles or push down a single lane together depending on wave intensity.',
    target: { x: 150, z: 183 }
  },
  {
    step: 3,
    title: 'Rotating Horde Pressure',
    subtitle: 'H1–H4 Strategic Entrances',
    desc: 'Infected hordes do not strike from a single direction. They rotate across four perimeter breaches: North West, North Highway, South West Park, and South East Depot.',
    target: { x: 136, z: 20 }
  },
  {
    step: 4,
    title: 'Exposed Central Objective',
    subtitle: 'Central Plaza (Data Drive 1)',
    desc: 'Data Drive 1 sits exposed in the open plaza beside the fountain. The lack of interior walls demands a 360-degree perimeter defense while securing the terminal.',
    target: { x: 150, z: 99 }
  },
  {
    step: 5,
    title: 'Risk-Reward Chokepoints',
    subtitle: 'CP1 North Alley, CP2 Central Bridge, CP3 South Gate',
    desc: 'Chokepoints allow small fireteams to mow down concentrated hordes. However, getting overwhelmed or flanked inside a chokepoint is instant squad wipe.',
    target: { x: 150, z: 78 }
  },
  {
    step: 6,
    title: 'Anti-Camping Flank Routes',
    subtitle: 'Park Trails & Catwalks (FL1–FL4)',
    desc: 'Four dedicated yellow flank routes ensure players are never trapped. Overgrown park ruins and back service alleys provide crucial escape options when primaries collapse.',
    target: { x: 80, z: 240 }
  },
  {
    step: 7,
    title: 'Extraction LZ Lockdown',
    subtitle: 'Bus Depot Evacuation Lawn',
    desc: 'The extraction pad remains LOCKED until all 3 Data Drives are retrieved. Once unlocked, a 45-second siege defense must be held against converging Wave 5 swarms.',
    target: { x: 262, z: 279 }
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onFocus
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onFocus(TOUR_STEPS[nextIdx].target);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onFocus(TOUR_STEPS[prevIdx].target);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F1E33] border border-[#2A3F5C] rounded-xl shadow-2xl p-6 text-[#E8EEF6]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3F5C] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#1EAEEF]/20 text-[#1EAEEF]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-condensed font-extrabold text-lg uppercase tracking-wider text-[#E8EEF6]">
                Design Intent Guided Tour
              </h2>
              <span className="text-[11px] font-mono-numbers text-[#8FA3BC]">
                STEP {currentStep.step} OF {TOUR_STEPS.length}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8FA3BC] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          <span className="font-mono-numbers text-[11px] font-bold text-[#FFD21F] bg-[#FFD21F]/10 px-2 py-0.5 rounded border border-[#FFD21F]/30 uppercase">
            {currentStep.subtitle}
          </span>
          <h3 className="font-condensed font-extrabold text-xl uppercase tracking-wide text-white mt-2 mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-[#CBD5E1] leading-relaxed">
            {currentStep.desc}
          </p>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A3F5C]">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded font-condensed font-bold text-xs uppercase transition-colors ${
              currentStepIdx === 0
                ? 'opacity-30 cursor-not-allowed text-[#8FA3BC]'
                : 'bg-[#14263F] hover:bg-[#1E3A63] text-[#E8EEF6]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <span
                key={s.step}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-6 bg-[#1EAEEF]'
                    : 'bg-[#2A3F5C]'
                }`}
              ></span>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#1EAEEF] hover:bg-[#189CD6] text-[#0B1424] font-condensed font-bold text-xs uppercase rounded transition-colors shadow-md"
          >
            <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'FINISH' : 'NEXT'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
