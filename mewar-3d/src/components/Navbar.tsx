import React from 'react';
import { Compass, Eye, RotateCcw, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onSetCameraPreset: (preset: 'isometric' | 'top_down' | 'reset') => void;
  activePreset: 'isometric' | 'top_down' | 'reset' | null;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSetCameraPreset,
  activePreset,
  wheelchairOnly,
  onToggleWheelchair
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-2xl shadow-cyan-950/40">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 font-bold text-xl">
            ♿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-wide">AccessPath</span>
              <span className="text-[10px] uppercase tracking-wider bg-cyan-950/80 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
                3D Interactive
              </span>
            </div>
            <div className="text-xs text-cyan-300 font-medium tracking-tight">
              MEWAR UNIVERSITY CAMPUS MAP • <span className="text-slate-400">Navigate • Access • Belong</span>
            </div>
          </div>
        </div>

        {/* View Controls & Accessibility Status */}
        <div className="hidden md:flex items-center gap-2">
          {/* View Mode Presets */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 gap-1">
            <button
              onClick={() => onSetCameraPreset('isometric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePreset === 'isometric'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 3D Isometric
            </button>
            <button
              onClick={() => onSetCameraPreset('top_down')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePreset === 'top_down'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> 2D Top-Down
            </button>
            <button
              onClick={() => onSetCameraPreset('reset')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Accessible Routing Pill */}
          <button
            onClick={() => onToggleWheelchair(!wheelchairOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              wheelchairOnly
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{wheelchairOnly ? 'Step-Free Mode: ON' : 'All Routes (Standard)'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
