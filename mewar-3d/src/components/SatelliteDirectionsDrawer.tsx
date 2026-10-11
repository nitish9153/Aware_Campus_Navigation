import React from 'react';
import { X, ArrowUpDown, Accessibility, Footprints, RotateCcw, AlertTriangle, Navigation, MapPin, Building, ChevronRight } from 'lucide-react';
import type { SatelliteLocation } from '../data/mewarSatelliteData';
import type { SatelliteRouteResult } from '../utils/satelliteDijkstra';
import type { IndoorBuilding, BuildingFloor, FloorRoom } from '../types/indoor';

interface SatelliteDirectionsDrawerProps {
  locations: SatelliteLocation[];
  startLocation: SatelliteLocation | null;
  destLocation: SatelliteLocation | null;
  onSelectStart: (loc: SatelliteLocation | null) => void;
  onSelectDest: (loc: SatelliteLocation | null) => void;
  onSwap: () => void;
  onClose: () => void;
  onClear: () => void;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  activeRoute: SatelliteRouteResult | null;
  selectedRoomInfo?: { building: IndoorBuilding; floor: BuildingFloor; room: FloorRoom } | null;
  onOpenIndoorModal?: () => void;
}

export const SatelliteDirectionsDrawer: React.FC<SatelliteDirectionsDrawerProps> = ({
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
  activeRoute,
  selectedRoomInfo,
  onOpenIndoorModal
}) => {
  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top duration-200">
      
      {/* Dark Navy-Blue Header & Mode Selectors */}
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

          {/* Wheelchair Accessible Mode Button */}
          <button
            onClick={() => onToggleWheelchair(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              wheelchairOnly
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" /> Accessible
          </button>
        </div>

        {/* Close Drawer Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Directions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="p-4 border-b border-slate-100 space-y-2.5 relative bg-slate-50/50">
        {/* Start Point */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-500/30 flex items-center justify-center text-[8px] font-black text-white shrink-0">
            A
          </div>
          <select
            value={startLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectStart(found);
            }}
            className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Choose starting point...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.category})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Locations Button */}
        <div className="flex justify-end pr-2 -my-1">
          <button
            onClick={onSwap}
            className="w-7 h-7 rounded-full bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Swap Starting Point and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Point */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white ring-2 ring-red-500/30 flex items-center justify-center text-[8px] font-black text-white shrink-0">
            B
          </div>
          <select
            value={destLocation?.id || ''}
            onChange={e => {
              const found = locations.find(l => l.id === e.target.value) || null;
              onSelectDest(found);
            }}
            className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Choose destination...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.category})
              </option>
            ))}
          </select>
        </div>

        {/* Route Action Buttons (Show Route / Clear Route) */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              const sanga = locations.find(l => l.id === 'sanga_hostel') || locations[0];
              const kumba = locations.find(l => l.id === 'kumba_hostel') || locations[1];
              if (!startLocation && sanga) onSelectStart(sanga);
              if (!destLocation && kumba) onSelectDest(kumba);
            }}
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Show Route</span>
          </button>
          
          <button
            onClick={onClear}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Indoor Room Target Card */}
      {selectedRoomInfo && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Indoor Destination</span>
            </div>
            <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
              Room {selectedRoomInfo.room.roomNumber}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-800">
              {selectedRoomInfo.room.name}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {selectedRoomInfo.building.name} • {selectedRoomInfo.floor.floorName}
            </div>
          </div>

          {onOpenIndoorModal && (
            <button
              onClick={onOpenIndoorModal}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>View Indoor Floor Plan & Route</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Route Results & Step-by-Step Directions */}
      <div className="p-4 max-h-[calc(100vh-340px)] overflow-y-auto space-y-3">
        {activeRoute && !activeRoute.isVerified ? (
          /* REQUIREMENT 8: If no verified path exists, show "Route needs verification" */
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Route needs verification</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              No verified walkable road or pedestrian path currently connects these two locations.
              The navigation system avoids inventing straight lines across buildings, private blocks, or unpaved land.
            </p>
            {wheelchairOnly && (
              <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg font-semibold">
                💡 Tip: Try switching to "Standard Walking" mode in case non-step-free paths exist.
              </div>
            )}
            <div className="text-[11px] text-slate-600 pt-1 font-medium">
              Use the <span className="font-bold text-slate-800">Admin Road Network Editor</span> above to map or verify connecting paths between these locations.
            </div>
          </div>
        ) : activeRoute && activeRoute.isVerified ? (
          <>
            {/* Calibrated Route Banner */}
            <div className="p-3.5 bg-blue-50 border border-blue-200/90 rounded-xl space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-blue-700">
                    {wheelchairOnly ? activeRoute.estimatedWheelchairMin : activeRoute.estimatedWalkingMin} min
                  </span>
                  <span className="text-xs text-slate-600 font-bold ml-2">
                    ({activeRoute.totalDistanceMeters} meters)
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeRoute.isFullyAccessible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeRoute.isFullyAccessible ? '♿ Step-Free Route' : '⚠️ Has Assistance Steps'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Verified road & pedestrian network path strictly following visible campus walkways.
              </div>
            </div>

            {/* Warnings if any */}
            {activeRoute.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5" /> Notice
                </div>
                {activeRoute.warnings.map((w, idx) => (
                  <div key={idx}>{w}</div>
                ))}
              </div>
            )}

            {/* Turn by Turn Directions */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>Turn-by-Turn Steps ({activeRoute.steps.length})</span>
                <span className="text-[10px] text-slate-400">Campus Walkway Network</span>
              </div>

              <div className="space-y-2 divide-y divide-slate-100">
                {activeRoute.steps.map(step => (
                  <div key={step.stepNumber} className="pt-2 flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-slate-200">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 leading-snug">{step.instruction}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        {step.distanceMeters > 0 && <span>{step.distanceMeters} m</span>}
                        {step.isAccessible && <span className="text-emerald-600 font-medium">✓ Step-Free</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : startLocation && destLocation ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            Calculating verified pedestrian path along campus roads...
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <MapPin className="w-6 h-6 mx-auto text-slate-300" />
            <div>Select a starting location and destination above to compute directions.</div>
          </div>
        )}
      </div>

    </div>
  );
};
