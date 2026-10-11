import React, { useState, useMemo } from 'react';
import { X, Navigation, Search, Building, Layers, DoorOpen } from 'lucide-react';
import type { SatelliteLocation } from '../data/mewarSatelliteData';
import type { IndoorBuilding, BuildingFloor, FloorRoom } from '../types/indoor';

interface SatelliteSearchBarProps {
  locations: SatelliteLocation[];
  onSelectLocation: (loc: SatelliteLocation) => void;
  onOpenDirections: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  indoorBuildings?: IndoorBuilding[];
  onSelectRoomDestination?: (building: IndoorBuilding, floor: BuildingFloor, room: FloorRoom) => void;
  onSelectRoomHierarchy?: (building: IndoorBuilding, floor: BuildingFloor, room: FloorRoom) => void;
  onOpenIndoorExplorer?: () => void;
}

const CATEGORIES = [
  { label: 'All', key: null, icon: '🏛️' },
  { label: 'Hostels', key: 'Hostel', icon: '🛏️' },
  { label: 'Academic', key: 'Academic', icon: '🎓' },
  { label: 'Dining', key: 'Dining', icon: '🍴' },
  { label: 'Sports', key: 'Sports', icon: '⚽' },
  { label: 'Medical', key: 'Medical', icon: '➕' },
  { label: 'Worship', key: 'Worship', icon: '🛕' },
  { label: 'Gates', key: 'Gate', icon: '🚪' },
  { label: 'Green Areas', key: 'Green Area', icon: '🌳' }
];

export const SatelliteSearchBar: React.FC<SatelliteSearchBarProps> = ({
  locations,
  onSelectLocation,
  onOpenDirections,
  selectedCategory,
  onSelectCategory,
  indoorBuildings = [],
  onSelectRoomDestination,
  onSelectRoomHierarchy
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showRoomHierarchyPicker, setShowRoomHierarchyPicker] = useState(false);

  // Hierarchy Picker state: Building -> Floor -> Room
  const [pickerBuildingId, setPickerBuildingId] = useState<string>(
    indoorBuildings[0]?.id || ''
  );
  const [pickerFloorId, setPickerFloorId] = useState<string>(
    indoorBuildings[0]?.floors[0]?.id || ''
  );

  const activePickerBuilding = indoorBuildings.find(b => b.id === pickerBuildingId) || indoorBuildings[0];
  const activePickerFloor =
    activePickerBuilding?.floors.find(f => f.id === pickerFloorId) ||
    activePickerBuilding?.floors[0];

  // Suggestions: Outdoor Landmarks + Indoor Rooms
  const suggestions = useMemo(() => {
    if (!query.trim()) return { locMatches: [], roomMatches: [] };
    const q = query.toLowerCase().trim();

    // 1. Outdoor locations
    const locMatches = locations.filter(loc => {
      const matchName = loc.name.toLowerCase().includes(q);
      const matchHindi = loc.hindiName?.toLowerCase().includes(q);
      const matchCat = loc.category.toLowerCase().includes(q);
      const matchCode = loc.code.toLowerCase().includes(q);
      const matchDesc = loc.description.toLowerCase().includes(q);
      const matchAliases = loc.aliases?.some(a => a.toLowerCase().includes(q));
      return matchName || matchHindi || matchCat || matchCode || matchDesc || matchAliases;
    }).slice(0, 5);

    // 2. Indoor rooms across all buildings and floors
    const roomMatches: {
      building: IndoorBuilding;
      floor: BuildingFloor;
      room: FloorRoom;
    }[] = [];

    for (const b of indoorBuildings) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          const matchNum = r.roomNumber.toLowerCase().includes(q);
          const matchName = r.name.toLowerCase().includes(q);
          const matchType = r.type.toLowerCase().includes(q);
          if (matchNum || matchName || matchType) {
            roomMatches.push({ building: b, floor: f, room: r });
            if (roomMatches.length >= 5) break;
          }
        }
        if (roomMatches.length >= 5) break;
      }
      if (roomMatches.length >= 5) break;
    }

    return { locMatches, roomMatches };
  }, [locations, indoorBuildings, query]);

  const handleSelectOutdoor = (loc: SatelliteLocation) => {
    setQuery(loc.name);
    setIsFocused(false);
    onSelectLocation(loc);
  };

  const handleSelectRoom = (building: IndoorBuilding, floor: BuildingFloor, room: FloorRoom) => {
    setQuery(`${building.name} → ${floor.floorName} → Room ${room.roomNumber}`);
    setIsFocused(false);
    setShowRoomHierarchyPicker(false);
    if (onSelectRoomHierarchy) {
      onSelectRoomHierarchy(building, floor, room);
    } else if (onSelectRoomDestination) {
      onSelectRoomDestination(building, floor, room);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="absolute top-20 left-4 z-20 w-full max-w-sm sm:max-w-md pointer-events-auto">
      
      {/* Floating White Google Maps-Style Search Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/90 flex items-center px-3.5 py-2.5 gap-2.5 text-slate-800 transition-all focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/25">
        
        {/* Search Icon */}
        <Search className="w-5 h-5 text-slate-400 shrink-0" />

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search campus or room (e.g. 105, Lab, Sanga, Law...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Room Hierarchy Quick Button */}
        <button
          onClick={() => setShowRoomHierarchyPicker(!showRoomHierarchyPicker)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
            showRoomHierarchyPicker
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Browse Building → Floor → Room Number"
        >
          <Layers className="w-3 h-3" />
          <span className="hidden sm:inline">Rooms</span>
        </button>

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-[1px] h-6 bg-slate-200 mx-0.5" />

        {/* Blue Directions Button */}
        <button
          onClick={onOpenDirections}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all shrink-0 hover:scale-105"
          title="Get Directions"
        >
          <Navigation className="w-4 h-4 fill-white" />
        </button>
      </div>

      {/* Building → Floor → Room Number Hierarchical Picker Card */}
      {showRoomHierarchyPicker && activePickerBuilding && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Destination: Building → Floor → Room</span>
            </div>
            <button
              onClick={() => setShowRoomHierarchyPicker(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* 1. Select Building */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Step 1: Choose Campus Building
            </label>
            <select
              value={pickerBuildingId}
              onChange={e => {
                setPickerBuildingId(e.target.value);
                const b = indoorBuildings.find(x => x.id === e.target.value);
                if (b && b.floors.length > 0) {
                  setPickerFloorId(b.floors[0].id);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {indoorBuildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.floors.length} Floors)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Floor */}
          {activePickerBuilding && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 2: Choose Floor
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activePickerBuilding.floors.map(floor => (
                  <button
                    key={floor.id}
                    onClick={() => setPickerFloorId(floor.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      floor.id === activePickerFloor?.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {floor.floorName} ({floor.code})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Select Room Number */}
          {activePickerFloor && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 3: Choose Destination Room Number ({activePickerFloor.rooms.length} Rooms)
              </label>
              {activePickerFloor.rooms.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">
                  No rooms mapped on this floor yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pt-1">
                  {activePickerFloor.rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(activePickerBuilding, activePickerFloor, room)}
                      className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-blue-700 group-hover:text-blue-800">
                          Room {room.roomNumber}
                        </span>
                        {room.isAccessible && (
                          <span className="text-[10px]" title="Accessible Entrance">
                            ♿
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800 leading-tight truncate mt-0.5">
                        {room.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {room.type}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Autocomplete Suggestions Card (Shows on search focus) */}
      {isFocused && query.trim() && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          
          {/* Indoor Rooms Section */}
          {suggestions.roomMatches.length > 0 && (
            <div className="p-2 bg-blue-50/50">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-700 px-2 py-1 flex items-center gap-1.5">
                <DoorOpen className="w-3 h-3" /> Indoor Rooms & Labs ({suggestions.roomMatches.length})
              </div>
              {suggestions.roomMatches.map(({ building, floor, room }) => (
                <button
                  key={room.id}
                  onMouseDown={() => handleSelectRoom(building, floor, room)}
                  className="w-full text-left p-2.5 hover:bg-blue-100/70 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm">
                    {room.roomNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {room.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <span className="font-bold text-blue-700">{building.name}</span>
                      <span>•</span>
                      <span>{floor.floorName}</span>
                      {room.isAccessible && (
                        <span className="text-emerald-600 font-bold ml-1">♿ Step-Free</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Outdoor Landmarks Section */}
          {suggestions.locMatches.length > 0 && (
            <div className="p-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
                <Building className="w-3 h-3" /> Campus Landmarks
              </div>
              {suggestions.locMatches.map(loc => (
                <button
                  key={loc.id}
                  onMouseDown={() => handleSelectOutdoor(loc)}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <div
                    style={{ backgroundColor: loc.color }}
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs shrink-0 shadow-sm"
                  >
                    📍
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {loc.category} • {loc.code}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {suggestions.roomMatches.length === 0 && suggestions.locMatches.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching locations or rooms found for "{query}".
            </div>
          )}

        </div>
      )}

      {/* Category Pills (Horizontal Scrollbar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.label}
              onClick={() => onSelectCategory(isSelected ? null : cat.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400 shadow-blue-500/25'
                  : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white border-slate-200/90 hover:shadow-lg'
              }`}
            >
              <span className="text-[11px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
