import React from 'react';
import { X, Navigation, Accessibility, Share2, Bookmark, CheckCircle2, AlertCircle, MapPin, Building } from 'lucide-react';
import type { SatelliteLocation } from '../data/mewarSatelliteData';

interface SatellitePlaceCardProps {
  location: SatelliteLocation | null;
  onClose: () => void;
  onGetDirectionsTo: (loc: SatelliteLocation) => void;
  onSetAsStart: (loc: SatelliteLocation) => void;
  onExploreIndoor?: (loc: SatelliteLocation) => void;
}

export const SatellitePlaceCard: React.FC<SatellitePlaceCardProps> = ({
  location,
  onClose,
  onGetDirectionsTo,
  onSetAsStart,
  onExploreIndoor
}) => {
  if (!location) return null;

  return (
    <div className="absolute top-36 left-4 z-20 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-left duration-200">
      
      {/* Top Banner */}
      <div
        className="h-28 relative flex items-end p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${location.color || '#2563eb'} 0%, #0f172a 100%)`
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label="Close card"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {location.category}
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1 flex items-center gap-2">
            <span>{location.name}</span>
            {location.hindiName && (
              <span className="text-xs font-normal text-slate-300">({location.hindiName})</span>
            )}
          </h2>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto">
        
        {/* Subhead info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Mewar University Campus • NH 79 Gangrar
          </span>
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {location.code}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1 border-b border-slate-100 pb-3">
          <button
            onClick={() => onGetDirectionsTo(location)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4 fill-white" /> Get Directions
          </button>
          <button
            onClick={() => onSetAsStart(location)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            title="Set as Starting Location"
          >
            <span>📍</span> Start Here
          </button>
          <button
            onClick={() => alert(`Saved "${location.name}" to your campus favorites.`)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Save to Favorites"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert(`Link to ${location.name} copied to clipboard!`);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Share Location"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Indoor Floor Plan & Rooms Explorer button if indoor handler provided */}
        {onExploreIndoor && (
          <button
            onClick={() => onExploreIndoor(location)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Building className="w-4 h-4" />
            <span>View Indoor Floors, Rooms & Corridors</span>
          </button>
        )}

        {/* Accessibility Profile */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-emerald-600" /> Accessibility Profile
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              location.wheelchairAccessible
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {location.wheelchairAccessible ? '♿ Step-Free Access' : '⚠️ Assistance Suggested'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              {location.rampAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span>Entrance Ramp</span>
            </div>
            <div className="flex items-center gap-1.5">
              {location.elevatorAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span>Elevator Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              {location.brailleSignage ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span>Braille / Tactile Signs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ground Floor Entry</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs font-bold text-slate-800 mb-1">About</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {location.description}
          </p>
        </div>

        {/* Facilities Chips */}
        {location.facilities && location.facilities.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-800 mb-1.5">Key Features</div>
            <div className="flex flex-wrap gap-1.5">
              {location.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md font-medium border border-slate-200/80"
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
