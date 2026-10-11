import React from 'react';
import { X, Navigation, Accessibility } from 'lucide-react';
import type { CampusLocation } from '../types/campus';

interface LocationDetailsModalProps {
  location: CampusLocation | null;
  onClose: () => void;
  onSetAsStart: (loc: CampusLocation) => void;
  onSetAsDest: (loc: CampusLocation) => void;
}

export const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  location,
  onClose,
  onSetAsStart,
  onSetAsDest
}) => {
  if (!location) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-lg bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-5 shadow-2xl shadow-cyan-950/60 pointer-events-auto animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md"
            style={{ backgroundColor: location.color }}
          >
            {location.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">{location.name}</h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                {location.code}
              </span>
            </div>
            <span className="text-xs font-semibold text-cyan-400">
              {location.category} • {location.stories} {location.stories === 1 ? 'Level' : 'Stories'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {location.description}
      </p>

      {/* Accessibility Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Accessibility className="w-3 h-3 text-emerald-400" /> Accessibility Profile
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className={location.rampAvailable ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {location.rampAvailable ? '✓' : '✗'}
            </span>
            <span>Ramp Access: {location.rampAvailable ? 'Yes' : 'None'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className={location.elevatorAvailable ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {location.elevatorAvailable ? '✓' : '✗'}
            </span>
            <span>Elevator: {location.elevatorAvailable ? 'Available' : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className={location.wheelchairAccessible ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {location.wheelchairAccessible ? '✓' : '✗'}
            </span>
            <span>Step-Free Entry: {location.wheelchairAccessible ? 'Certified' : 'Assistance Needed'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className={location.brailleSignage ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {location.brailleSignage ? '✓' : '✗'}
            </span>
            <span>Braille Signage: {location.brailleSignage ? 'Installed' : 'Standard'}</span>
          </div>
        </div>

        {/* Facilities list */}
        {location.facilities.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
            {location.facilities.map((fac, idx) => (
              <span key={idx} className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                • {fac}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            onSetAsStart(location);
            onClose();
          }}
          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <span>📍</span> Set as Start
        </button>
        <button
          onClick={() => {
            onSetAsDest(location);
            onClose();
          }}
          className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" /> Navigate Here
        </button>
      </div>

    </div>
  );
};
