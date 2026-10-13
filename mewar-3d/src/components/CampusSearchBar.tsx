import React, { useState, useMemo } from 'react';
import { X, Navigation, MapPin, Building } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';
import type { IndoorBuilding, BuildingFloor, FloorRoom } from '../types/indoor';

interface CampusSearchBarProps {
  locations: GeoLocation[];
  indoorBuildings?: IndoorBuilding[];
  onSelectLocation: (loc: GeoLocation) => void;
  onOpenDirections: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onSelectRoomHierarchy?: (hierarchy: {
    building: IndoorBuilding;
    floor: BuildingFloor;
    room: FloorRoom;
  }) => void;
}

const CATEGORIES = [
  { label: 'Hostels', key: 'Hostel', icon: '🛏️' },
  { label: 'Academic', key: 'Academic', icon: '🏛️' },
  { label: 'Library', key: 'Library', icon: '📚' },
  { label: 'Dining / Mess', key: 'Dining', icon: '🍴' },
  { label: 'Gates', key: 'Gate', icon: '🚪' },
  { label: 'Medical', key: 'Medical', icon: '➕' },
  { label: 'Sports', key: 'Sports', icon: '⚽' },
  { label: 'Worship', key: 'Worship', icon: '🙏' },
  { label: 'Green Areas', key: 'Green Area', icon: '🌲' }
];

export const CampusSearchBar: React.FC<CampusSearchBarProps> = ({
  locations,
  indoorBuildings = [],
  onSelectLocation,
  onOpenDirections,
  selectedCategory,
  onSelectCategory,
  onSelectRoomHierarchy
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Suggestions for outdoor buildings and landmarks
  const locationSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q) ||
      loc.code.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [locations, query]);

  // Suggestions for indoor rooms
  const roomSuggestions = useMemo(() => {
    if (!query.trim() || !indoorBuildings.length) return [];
    const q = query.toLowerCase().trim();
    const results: Array<{
      building: IndoorBuilding;
      floor: BuildingFloor;
      room: FloorRoom;
    }> = [];

    for (const b of indoorBuildings) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          if (
            r.roomNumber.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q)
          ) {
            results.push({ building: b, floor: f, room: r });
            if (results.length >= 4) return results;
          }
        }
      }
    }
    return results;
  }, [indoorBuildings, query]);

  const handleSelectSuggestion = (loc: GeoLocation) => {
    setQuery(loc.name);
    setIsFocused(false);
    onSelectLocation(loc);
  };

  const handleSelectRoom = (item: { building: IndoorBuilding; floor: BuildingFloor; room: FloorRoom }) => {
    setQuery(`Room ${item.room.roomNumber} - ${item.room.name}`);
    setIsFocused(false);
    if (onSelectRoomHierarchy) {
      onSelectRoomHierarchy(item);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-sm pointer-events-auto">
      {/* Search Input Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center px-3.5 py-2.5 gap-2.5 text-slate-800 dark:text-slate-100 transition-all focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/20">
        
        {/* Brand Icon */}
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30 shrink-0" title="Mewar University AccessPath">
          MU
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search campus buildings, hostels, rooms..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="flex-1 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700" />

        <button
          onClick={onOpenDirections}
          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors"
          title="Open Directions"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-suggest dropdown */}
      {isFocused && query.trim() && (
        <div className="mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Outdoor Landmark Results */}
          {locationSuggestions.length > 0 && (
            <div>
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                Campus Buildings &amp; Landmarks
              </div>
              {locationSuggestions.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{loc.name}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 ml-1.5">({loc.category})</span>
                    </div>
                  </div>
                  {loc.wheelchairAccessible && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      ♿ Accessible
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Indoor Room Results */}
          {roomSuggestions.length > 0 && (
            <div>
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20">
                Indoor Rooms (Floors &amp; Hostels)
              </div>
              {roomSuggestions.map((item, idx) => (
                <button
                  key={`${item.building.id}_${item.floor.id}_${item.room.id}_${idx}`}
                  onClick={() => handleSelectRoom(item)}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        Room {item.room.roomNumber} - {item.room.name}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300">
                        {item.building.name} • {item.floor.floorName}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                    Indoor
                  </span>
                </button>
              ))}
            </div>
          )}

          {locationSuggestions.length === 0 && roomSuggestions.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              No matching campus places or rooms found for "{query}".
            </div>
          )}
        </div>
      )}

      {/* Horizontal Category Chips */}
      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
            selectedCategory === null
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          All Places
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(selectedCategory === cat.key ? null : cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampusSearchBar;
