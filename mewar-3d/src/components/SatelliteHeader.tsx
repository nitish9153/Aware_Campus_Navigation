import React from 'react';
import { Navigation, Layers, ShieldCheck, Wrench, Building, Settings, Map as MapIcon } from 'lucide-react';

interface SatelliteHeaderProps {
  onOpenDirections: () => void;
  isDirectionsOpen: boolean;
  onToggleLegend: () => void;
  isLegendOpen: boolean;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  totalLocationsCount: number;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenIndoorNavigator?: () => void;
  onOpenIndoorAdmin?: () => void;
  onOpenAdminLocationModal?: () => void;
  mapMode?: 'satellite' | 'osm';
  onToggleMapMode?: (mode: 'satellite' | 'osm') => void;
}

export const SatelliteHeader: React.FC<SatelliteHeaderProps> = ({
  onOpenDirections,
  isDirectionsOpen,
  onToggleLegend,
  isLegendOpen,
  wheelchairOnly,
  onToggleWheelchair,
  totalLocationsCount,
  isAdminMode,
  onToggleAdminMode,
  onOpenIndoorNavigator,
  onOpenIndoorAdmin,
  onOpenAdminLocationModal,
  mapMode = 'satellite',
  onToggleMapMode
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shadow-xl">
      
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        {/* AccessPath Logo & Accessibility Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-xl select-none">
          ♿
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white tracking-wide">
              AccessPath
            </span>
            <span className="text-xs sm:text-sm font-bold text-cyan-300">
              — Mewar University Campus Map
            </span>
            <span className="hidden lg:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-blue-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {totalLocationsCount} Locations
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-semibold tracking-tight">
            Chittorgarh, Rajasthan • <span className="text-cyan-400 font-bold">Calibrated Red-Line Walking Network</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Map View Switcher (Satellite Primary vs OSM) */}
        {onToggleMapMode && (
          <button
            onClick={() => onToggleMapMode(mapMode === 'satellite' ? 'osm' : 'satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              mapMode === 'satellite'
                ? 'bg-blue-950/80 border-cyan-500/50 text-cyan-300 hover:text-white hover:bg-blue-900/80'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:text-white hover:bg-emerald-900/80'
            }`}
            title="Switch Between Official Satellite Map and OpenStreetMap View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {mapMode === 'satellite' ? 'Satellite (Primary)' : 'Vector Map'}
            </span>
          </button>
        )}

        {/* Kumbah Hostel Ground Floor Navigation Trigger */}
        {onOpenIndoorNavigator && (
          <button
            onClick={onOpenIndoorNavigator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-blue-900/90 to-cyan-950/90 text-cyan-200 hover:text-white hover:border-cyan-400 text-xs font-black transition-all shadow-md shadow-cyan-900/30"
            title="Open Kumbah Hostel Ground Floor Indoor Room Navigation"
          >
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kumbah Hostel – Ground Floor</span>
            <span className="sm:hidden">Kumbah Rooms</span>
          </button>
        )}

        {/* Admin Marker Editor Button */}
        {onOpenAdminLocationModal && (
          <button
            onClick={onOpenAdminLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/70 text-amber-300 hover:text-white hover:bg-amber-900/80 text-xs font-bold transition-all shadow-sm"
            title="Add or Edit Campus Building Markers"
          >
            <span>📍</span>
            <span className="hidden lg:inline">Edit Markers</span>
          </button>
        )}

        {/* Indoor Floor/Room Admin Editor */}
        {onOpenIndoorAdmin && (
          <button
            onClick={onOpenIndoorAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/70 text-purple-300 hover:text-white hover:bg-purple-900/80 text-xs font-bold transition-all shadow-sm"
            title="Manage Floors, Rooms, and Indoor Corridors"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Floor Admin</span>
          </button>
        )}
        
        {/* Admin Map Drag / Edit Mode Toggle */}
        <button
          onClick={onToggleAdminMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
            isAdminMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Admin Mode (Drag markers & click to add)"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isAdminMode ? 'Admin: ON' : 'Admin'}
          </span>
          <span className="md:hidden">
            {isAdminMode ? '🛠️ ON' : '🛠️'}
          </span>
        </button>

        {/* Accessible Mode Quick Switch */}
        <button
          onClick={() => onToggleWheelchair(!wheelchairOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            wheelchairOnly
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-sm'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle Wheelchair / Step-Free Accessible Routing"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">
            {wheelchairOnly ? 'Step-Free: ON' : 'Standard Walking'}
          </span>
          <span className="md:hidden">
            {wheelchairOnly ? '♿ ON' : '♿ OFF'}
          </span>
        </button>

        {/* Legend Button */}
        <button
          onClick={onToggleLegend}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isLegendOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Campus Legend"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Legend</span>
        </button>

        {/* Directions Drawer Trigger Button */}
        <button
          onClick={onOpenDirections}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            isDirectionsOpen
              ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
          }`}
          title="Directions"
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>Directions</span>
        </button>

      </div>

    </header>
  );
};
