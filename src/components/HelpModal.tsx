import React from 'react';
import { X, Keyboard, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'T', action: 'Toggle between 2D Tactical View and 3D Recon View' },
  { key: '1 – 5', action: 'Direct jump to Horde Wave 1 through Wave 5 (Extraction)' },
  { key: 'Space', action: 'Play / Pause Horde Wave simulation' },
  { key: 'V', action: 'Activate Sightline Visibility Probe (casts 80m radial ray polygon)' },
  { key: 'M', action: 'Activate Distance Measurement Tool (click 2 points)' },
  { key: 'P', action: 'Toggle Ping placer ownership between Player 1 and Player 2' },
  { key: 'Shift + Click', action: 'Drop a tactical numbered ping on the map' },
  { key: 'G', action: 'Open Design Intent Guided Tour (7-step walkthrough)' },
  { key: 'H / ?', action: 'Open / Close this tactical keyboard shortcuts reference' },
  { key: 'Esc', action: 'Deselect active tool, entity or close open modals' },
  { key: 'WASD / Arrows', action: 'Pan map camera viewport' },
  { key: '+ / -', action: 'Zoom in / Zoom out' },
  { key: 'R', action: 'Reset camera position to map center' }
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F1E33] border border-[#2A3F5C] rounded-xl shadow-2xl p-6 text-[#E8EEF6]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3F5C] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#1EAEEF]/20 text-[#1EAEEF]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-condensed font-extrabold text-lg uppercase tracking-wider text-[#E8EEF6]">
                Tactical Operator Controls
              </h2>
              <span className="text-[11px] font-mono-numbers text-[#8FA3BC]">
                KEYBOARD SHORTCUTS & BRIEFING GUIDE
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

        {/* Shortcuts list */}
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-[#14263F] border border-[#2A3F5C]"
            >
              <kbd className="font-mono-numbers font-bold text-xs bg-[#0B1424] text-[#1EAEEF] px-2.5 py-1 rounded border border-[#2A3F5C] shadow-sm">
                {s.key}
              </kbd>
              <span className="text-xs text-[#CBD5E1] text-right ml-4">
                {s.action}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#2A3F5C] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1EAEEF] hover:bg-[#189CD6] text-[#0B1424] font-condensed font-bold text-xs uppercase rounded transition-colors shadow-md"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
