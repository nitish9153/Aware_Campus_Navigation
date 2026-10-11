import React from 'react';
import { Target, Navigation } from 'lucide-react';

interface MapControlsProps {
  azimuthDeg: number;
  onResetView: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  azimuthDeg,
  onResetView
}) => {
  return (
    <>
      {/* Top-Right North Compass Arrow (matching reference image) */}
      <div className="fixed top-20 right-4 md:right-8 z-20 pointer-events-none">
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          <div
            className="w-10 h-10 flex items-center justify-center transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${-azimuthDeg}deg)` }}
          >
            <Navigation className="w-8 h-8 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
          <span className="text-[11px] font-extrabold text-cyan-400 tracking-wider mt-0.5">
            N
          </span>
        </div>
      </div>

      {/* Floating Camera Control Buttons (Zoom / Rotate) */}
      <div className="fixed bottom-28 left-4 z-20 flex flex-col gap-1.5 pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-1.5 shadow-2xl shadow-cyan-950/40">
        <button
          onClick={onResetView}
          className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all border border-slate-800"
          title="Reset Full Campus View"
        >
          <Target className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom-Left Motto Banner matching reference map image */}
      <div className="fixed bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-950/85 backdrop-blur-md border-2 border-cyan-400/80 rounded-2xl px-5 py-3 shadow-2xl shadow-cyan-950/60 max-w-xs">
          <div className="text-sm font-extrabold text-white tracking-wide">
            Inclusive Campus
          </div>
          <div className="text-xs text-cyan-300 font-medium">
            for a Brighter Future
          </div>
        </div>
      </div>

      {/* Bottom-Right Scale Indicator (0, 25, 50, 100 m matching reference map image) */}
      <div className="fixed bottom-4 right-4 z-20 pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-2xl shadow-cyan-950/40">
          <div className="flex justify-between text-[10px] font-extrabold text-cyan-300 mb-1 px-0.5">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>100 m</span>
          </div>
          {/* Scale Bar Graphic */}
          <div className="w-36 h-2 bg-slate-800 rounded-full flex border border-cyan-500/40 overflow-hidden">
            <div className="w-1/4 h-full bg-cyan-400"></div>
            <div className="w-1/4 h-full bg-slate-900"></div>
            <div className="w-1/4 h-full bg-cyan-400"></div>
            <div className="w-1/4 h-full bg-slate-900"></div>
          </div>
        </div>
      </div>
    </>
  );
};
