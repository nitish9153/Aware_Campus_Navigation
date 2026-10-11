import React from 'react';
import { Navigation, ArrowUpDown, Accessibility, RotateCcw, Clock, Footprints } from 'lucide-react';
import type { CampusLocation, RouteResult } from '../types/campus';

interface DirectionsPanelProps {
  locations: CampusLocation[];
  startLocation: CampusLocation | null;
  destLocation: CampusLocation | null;
  onSetStart: (loc: CampusLocation | null) => void;
  onSetDest: (loc: CampusLocation | null) => void;
  onSwap: () => void;
  onClearRoute: () => void;
  activeRoute: RouteResult | null;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  locations,
  startLocation,
  destLocation,
  onSetStart,
  onSetDest,
  onSwap,
  onClearRoute,
  activeRoute,
  wheelchairOnly,
  onToggleWheelchair,
  isOpen,
  onToggle
}) => {
  return (
    <div className="pointer-events-auto">
      {/* Closed Button on Right */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 right-4 z-20 flex items-center gap-2 bg-slate-900/90 text-cyan-400 border border-cyan-500/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl shadow-cyan-950/40 backdrop-blur-md hover:bg-slate-800 transition-all"
        >
          <Navigation className="w-4 h-4" /> Get Directions
        </button>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div className="fixed top-20 right-4 z-20 w-84 md:w-96 max-h-[calc(100vh-140px)] flex flex-col bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden transition-all animate-in fade-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Campus Route Finder</h2>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            
            {/* Origin & Destination Selectors */}
            <div className="space-y-2 relative">
              
              {/* Start Location */}
              <div>
                <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <span>🟢 Starting Point</span>
                </label>
                <select
                  value={startLocation?.id || ''}
                  onChange={e => {
                    const found = locations.find(l => l.id === e.target.value) || null;
                    onSetStart(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose Starting Point --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  onClick={onSwap}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all z-10 shadow-md"
                  title="Swap Start and Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination Location */}
              <div>
                <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <span>🎯 Destination</span>
                </label>
                <select
                  value={destLocation?.id || ''}
                  onChange={e => {
                    const found = locations.find(l => l.id === e.target.value) || null;
                    onSetDest(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose Destination --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.category})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Accessibility Filter Checkbox */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wheelchairOnly}
                  onChange={e => onToggleWheelchair(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
                    Wheelchair-Accessible Route
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Strictly limits paths to certified ramps, zero-curb sidewalks, and step-free doors.
                  </div>
                </div>
              </label>
            </div>

            {/* Active Route Summary Card */}
            {activeRoute && (
              <div className="p-3.5 bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border border-cyan-500/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-cyan-300">Suggested Route Details</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeRoute.isFullyAccessible
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}>
                    {activeRoute.isFullyAccessible ? '♿ 100% Step-Free' : '⚠️ Requires Assistance'}
                  </span>
                </div>

                {/* Distance & Time Stats */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-sm font-extrabold text-white">{activeRoute.totalDistance}m</div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                      <Footprints className="w-2.5 h-2.5" /> Distance
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-cyan-400">{activeRoute.estimatedWalkingMin} min</div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> Walking
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-emerald-400">{activeRoute.estimatedWheelchairMin} min</div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                      <Accessibility className="w-2.5 h-2.5" /> Wheelchair
                    </div>
                  </div>
                </div>

                {/* Warnings if any */}
                {activeRoute.warnings.length > 0 && (
                  <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 space-y-1">
                    {activeRoute.warnings.map((w, idx) => (
                      <div key={idx}>{w}</div>
                    ))}
                  </div>
                )}

                {/* Turn-by-Turn Steps */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Directions ({activeRoute.steps.length} segments):
                  </div>
                  {activeRoute.steps.map(step => (
                    <div key={step.stepNumber} className="flex gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-[9px] shrink-0 border border-cyan-500/40">
                        {step.stepNumber}
                      </span>
                      <span className="text-slate-300 leading-snug">
                        {step.instruction}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Clear Route Button */}
                <button
                  onClick={onClearRoute}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Route
                </button>
              </div>
            )}

            {!activeRoute && startLocation && destLocation && (
              <div className="text-center py-4 text-xs text-slate-400">
                Calculating shortest accessible path...
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};
