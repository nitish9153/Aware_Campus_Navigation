import React from 'react';
import { X, Navigation, Accessibility, CheckCircle2, AlertCircle, Building, ChevronRight, MapPin } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';

interface CampusPlaceCardProps {
  location: GeoLocation | null;
  onClose: () => void;
  onGetDirectionsTo: (loc: GeoLocation) => void;
  onSetAsStart: (loc: GeoLocation) => void;
  onExploreIndoor?: (buildingId: string) => void;
}

export const CampusPlaceCard: React.FC<CampusPlaceCardProps> = ({
  location,
  onClose,
  onGetDirectionsTo,
  onSetAsStart,
  onExploreIndoor
}) => {
  if (!location) return null;

  const hasIndoor = location.id === 'kumbah_hostel' || location.id === 'engineering_block';

  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-left duration-250 text-slate-800 dark:text-slate-100">
      
      {/* Header Banner */}
      <div
        className="h-28 relative flex items-end p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${location.color} 0%, #0f172a 100%)`
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {location.category}
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">{location.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
        
        {/* Address & Code */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>Mewar University • Gangrar, Chittorgarh</span>
          <span className="font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
            {location.code}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onGetDirectionsTo(location)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Directions</span>
          </button>
          
          <button
            onClick={() => onSetAsStart(location)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Set as Start</span>
          </button>
        </div>

        {/* Indoor Floor Plan & Rooms Button */}
        {hasIndoor && onExploreIndoor && (
          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-extrabold text-xs">
                <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Multi-Floor Indoor Navigation</span>
              </div>
              <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                Floors &amp; Rooms
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Interactive floor plans, room search, corridors, ramps, and elevators inside {location.name}.
            </p>
            <button
              onClick={() => onExploreIndoor(location.id)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Explore Indoor Floor Plans</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Overview
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {location.description}
          </p>
        </div>

        {/* Accessibility Features */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Accessibility className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mobility &amp; Accessibility</span>
          </h3>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className={`p-2 rounded-lg flex items-center gap-1.5 font-medium ${
              location.wheelchairAccessible
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
            }`}>
              {location.wheelchairAccessible ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>Step-Free Entry</span>
            </div>

            <div className={`p-2 rounded-lg flex items-center gap-1.5 font-medium ${
              location.rampAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
            }`}>
              {location.rampAvailable ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>Certified Ramp</span>
            </div>

            <div className={`p-2 rounded-lg flex items-center gap-1.5 font-medium ${
              location.elevatorAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
            }`}>
              {location.elevatorAvailable ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>Elevator Access</span>
            </div>

            <div className={`p-2 rounded-lg flex items-center gap-1.5 font-medium ${
              location.brailleSignage
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
            }`}>
              {location.brailleSignage ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>Braille Signs</span>
            </div>
          </div>
        </div>

        {/* Facilities & Amenities */}
        {location.facilities && location.facilities.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Key Facilities
            </h3>
            <div className="flex flex-wrap gap-1">
              {location.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default CampusPlaceCard;
