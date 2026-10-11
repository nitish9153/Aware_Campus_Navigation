import React from 'react';
import { X, Navigation, Accessibility, Share2, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';

interface GooglePlaceCardProps {
  location: GeoLocation | null;
  onClose: () => void;
  onGetDirectionsTo: (loc: GeoLocation) => void;
  onSetAsStart: (loc: GeoLocation) => void;
}

export const GooglePlaceCard: React.FC<GooglePlaceCardProps> = ({
  location,
  onClose,
  onGetDirectionsTo,
  onSetAsStart
}) => {
  if (!location) return null;

  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-left duration-250">
      
      {/* Header Banner */}
      <div
        className="h-28 relative flex items-end p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${location.color} 0%, #1e293b 100%)`
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
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {location.category}
          </span>
          <h2 className="text-lg font-extrabold tracking-tight mt-1">{location.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
        
        {/* Address & Verified Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Mewar University Campus • Gangrar</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {location.code}
          </span>
        </div>

        {/* Action Buttons Row (Google Maps style) */}
        <div className="flex items-center gap-2 pt-1 border-b border-slate-100 pb-3">
          <button
            onClick={() => onGetDirectionsTo(location)}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" /> Directions
          </button>
          <button
            onClick={() => onSetAsStart(location)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title="Set as Starting Point"
          >
            <span>📍</span> Start Here
          </button>
          <button
            onClick={() => alert(`Saved ${location.name} to your campus favorites.`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Save"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert(`Location: ${location.name}\nLat: ${location.lat}\nLng: ${location.lng}`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Accessibility Profile Card */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-emerald-600" /> Accessibility Profile
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              location.wheelchairAccessible
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {location.wheelchairAccessible ? 'Step-Free Access' : 'Assistance Needed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              {location.rampAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>Ramp: {location.rampAvailable ? 'Installed' : 'None'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {location.elevatorAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>Elevator: {location.elevatorAvailable ? 'Available' : 'N/A'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {location.brailleSignage ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>Braille: {location.brailleSignage ? 'Installed' : 'Standard'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Entrance: Wide Door</span>
            </div>
          </div>
        </div>

        {/* Overview Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-1">About this Location</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {location.description}
          </p>
        </div>

        {/* Facilities Chips */}
        {location.facilities.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-1.5">Facilities & Highlights</h3>
            <div className="flex flex-wrap gap-1.5">
              {location.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                >
                  ✓ {fac}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
