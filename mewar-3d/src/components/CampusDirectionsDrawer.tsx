import React from 'react';
import { X, ArrowUpDown, Accessibility, Footprints, RotateCcw, AlertTriangle, Building, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';
import type { RoutingResult } from '../services/osmRoutingService';

export interface RouteCalculatedData {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  steps: Array<{ instruction: string; distanceText: string }>;
  isOsmRoute?: boolean;
  sourceLabel?: string;
  notice?: string;
}

interface CampusDirectionsDrawerProps {
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
  routingResult?: RoutingResult | null;
  isCalculating?: boolean;
  onOpenIndoorModal?: (buildingId: string) => void;
}

export const CampusDirectionsDrawer: React.FC<CampusDirectionsDrawerProps> = ({
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
  routingResult,
  isCalculating = false,
  onOpenIndoorModal
}) => {
  const hasIndoorAtDest = destLocation?.id === 'kumbah_hostel' || destLocation?.id === 'engineering_block';

  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top duration-200 text-slate-800 dark:text-slate-100">
      
      {/* Header & Mode Selectors */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Walking Mode Button */}
          <button
            onClick={() => onToggleWheelchair(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              !wheelchairOnly
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Walking
          </button>

          {/* Accessible Mode Button */}
          <button
            onClick={() => onToggleWheelchair(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              wheelchairOnly
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" /> Step-Free (♿)
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Directions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 relative bg-slate-50/70 dark:bg-slate-900/60">
        {/* Start Point */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-500/30 flex items-center justify-center text-[9px] font-black text-white shrink-0">
            A
          </div>
          <select
            value={startLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectStart(found);
            }}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
            className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Point */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white ring-2 ring-red-500/30 flex items-center justify-center text-[9px] font-black text-white shrink-0">
            B
          </div>
          <select
            value={destLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectDest(found);
            }}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

      {/* Indoor Transit Link (When destination has indoor floor plans) */}
      {hasIndoorAtDest && onOpenIndoorModal && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/90 dark:border-blue-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-extrabold text-xs">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Hostel / Building Indoor Navigation</span>
            </div>
            <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
              Floors &amp; Rooms
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Navigate inside {destLocation.name}: Ground, 1st &amp; 2nd Floors, room numbers, elevators, and corridors.
          </p>
          <button
            onClick={() => onOpenIndoorModal(destLocation.id)}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Open {destLocation.name} Floor Plan &amp; Rooms</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Route Results & Steps */}
      <div className="p-4 max-h-[calc(100vh-340px)] overflow-y-auto space-y-3">
        {isCalculating ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
            Calculating pedestrian route via OpenStreetMap &amp; campus network...
          </div>
        ) : routingResult && routingResult.success ? (
          <>
            {/* Route Summary Card */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                    {routingResult.durationText}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold ml-1.5">
                    ({routingResult.distanceText})
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  routingResult.source === 'osrm'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                }`}>
                  {routingResult.sourceLabel || 'Pedestrian Walkway'}
                </span>
              </div>

              {routingResult.notice && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/50 p-2 rounded-lg font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{routingResult.notice}</span>
                </div>
              )}
            </div>

            {/* Turn-by-Turn Instruction Steps */}
            {routingResult.steps.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Turn-by-Turn Directions ({routingResult.steps.length} steps)</span>
                  <button
                    onClick={onClear}
                    className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                  {routingResult.steps.map((step, idx) => (
                    <div key={idx} className="pt-2 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium leading-relaxed">{step.instruction}</div>
                        {step.distanceText && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                            {step.distanceText}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : routingResult && !routingResult.success ? (
          /* Graceful error handling: Helpful message when route cannot be found */
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2">
            <div className="flex items-start gap-2 text-amber-500 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>No Direct Pedestrian Route Found</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {routingResult.errorMessage || 'No valid pedestrian walking route found between these locations without passing through restricted or unmapped areas.'}
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              💡 Tip: Try choosing an adjacent campus landmark or the verified Main Gate / Central Library entrance node.
            </div>
          </div>
        ) : startLocation && destLocation ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Select origin and destination to calculate route.
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Select a starting location and destination above to see the walking route on OpenStreetMap.
          </div>
        )}
      </div>

    </div>
  );
};

export default CampusDirectionsDrawer;
