import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const Legend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 md:bottom-28 z-20 pointer-events-auto">
      <div className="bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden w-56 transition-all">
        
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 border-b border-slate-800 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide">Campus Legend</span>
          </div>
          {isCollapsed ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Legend Items (matching reference map image) */}
        {!isCollapsed && (
          <div className="p-3 space-y-2 text-[11px] animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-[10px]">
                🏛️
              </span>
              <span>Building</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-2 rounded-full bg-slate-300"></span>
              <span>Walking Path</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-2 rounded-full bg-emerald-500"></span>
              <span>Green Area</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-purple-500 flex items-center justify-center text-[10px] text-white">
                🛏️
              </span>
              <span>Hostel</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-[10px] text-white">
                🍴
              </span>
              <span>Dining / Mess</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-[10px] text-white">
                ⚽
              </span>
              <span>Sports Ground</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center text-[10px] text-white">
                ➕
              </span>
              <span>Medical</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center text-[10px] text-white">
                🏛️
              </span>
              <span>Worship</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
