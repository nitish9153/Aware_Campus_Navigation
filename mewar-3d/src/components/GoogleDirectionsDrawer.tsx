import React from 'react';
import { X, ArrowUpDown, Accessibility, Footprints, RotateCcw } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';
import type { GeoRouteResult } from '../utils/dijkstraGeo';

interface GoogleDirectionsDrawerProps {
  locations: GeoLocation[];
  startLocation: GeoLocation | null;
  destLocation: GeoLocation | null;
  onSelectStart: (loc: GeoLocation | null) => void;
  onSelectDest: (loc: GeoLocation | null) => void;
  onSwap: () => void;
  onClose: () => void;
  onClear: () => void;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  activeRoute: GeoRouteResult | null;
}

export const GoogleDirectionsDrawer: React.FC<GoogleDirectionsDrawerProps> = ({
  locations,
  startLocation,
  destLocation,
  onSelectStart,
  onSelectDest,
  onSwap,
  onClose,
  onClear,
  wheelchairOnly,
  onToggleWheelchair,
  activeRoute
}) => {
  return (
    <div className="absolute top-4 left-4 z-30 w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top duration-250">
      
      {/* Top Header & Mode Selectors */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleWheelchair(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              !wheelchairOnly
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Walking
          </button>
          <button
            onClick={() => onToggleWheelchair(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              wheelchairOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" /> Wheelchair
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Directions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Start & Destination Selectors */}
      <div className="p-4 border-b border-slate-100 space-y-2 relative">
        {/* Start Point */}
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500/30 shrink-0" />
          <select
            value={startLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectStart(found);
            }}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="">Choose starting point...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.category})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-end pr-2 -my-1">
          <button
            onClick={onSwap}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-sm"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Destination Point */}
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 text-red-500 font-bold shrink-0 flex items-center justify-center">
            📍
          </div>
          <select
            value={destLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectDest(found);
            }}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="">Choose destination...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route Results & Steps */}
      <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto space-y-3">
        {activeRoute ? (
          <>
            {/* Summary Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-extrabold text-blue-700">
                    {wheelchairOnly ? activeRoute.estimatedWheelchairMin : activeRoute.estimatedWalkingMin} min
                  </span>
                  <span className="text-xs text-slate-600 font-medium ml-1.5">
                    ({activeRoute.totalDistanceMeters} m)
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeRoute.isFullyAccessible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeRoute.isFullyAccessible ? '♿ 100% Step-Free' : '⚠️ Has Assistance Steps'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Fastest suitable route via campus internal walkways.
              </div>
            </div>

            {/* Warnings */}
            {activeRoute.warnings.length > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                {activeRoute.warnings.map((w, idx) => (
                  <div key={idx}>{w}</div>
                ))}
              </div>
            )}

            {/* Turn by Turn Directions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Directions ({activeRoute.steps.length} steps)</span>
                <button
                  onClick={onClear}
                  className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>

              <div className="space-y-1.5 divide-y divide-slate-100">
                {activeRoute.steps.map(step => (
                  <div key={step.stepNumber} className="pt-1.5 flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <div>{step.instruction}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{step.distanceMeters} meters</span>
                        {step.isAccessible && <span className="text-emerald-600">✓ Step-Free</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : startLocation && destLocation ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Calculating optimal pedestrian path...
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Select a starting location and destination above to see the route on the map.
          </div>
        )}
      </div>

    </div>
  );
};
