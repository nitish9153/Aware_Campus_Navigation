import React, { useState, useMemo } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';

interface GoogleSearchBarProps {
  locations: GeoLocation[];
  onSelectLocation: (loc: GeoLocation) => void;
  onOpenDirections: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CATEGORIES = [
  { label: 'Hostels', key: 'Hostel', icon: '🛏️' },
  { label: 'Dining / Mess', key: 'Dining', icon: '🍴' },
  { label: 'Academic', key: 'Academic', icon: '🏛️' },
  { label: 'Sports', key: 'Sports', icon: '⚽' },
  { label: 'Medical', key: 'Medical', icon: '➕' },
  { label: 'Worship', key: 'Worship', icon: '🙏' },
  { label: 'Green Areas', key: 'Green Area', icon: '🌲' }
];

export const GoogleSearchBar: React.FC<GoogleSearchBarProps> = ({
  locations,
  onSelectLocation,
  onOpenDirections,
  selectedCategory,
  onSelectCategory
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [locations, query]);

  const handleSelectSuggestion = (loc: GeoLocation) => {
    setQuery(loc.name);
    setIsFocused(false);
    onSelectLocation(loc);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="absolute top-4 left-4 z-30 w-full max-w-sm pointer-events-auto">
      {/* Floating Google Maps-Style White Search Card */}
      <div className="relative bg-white rounded-lg shadow-md border border-slate-200/90 flex items-center px-3 py-2 gap-2 text-slate-800 transition-all focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500/20">
        
        {/* Mewar Brand Icon */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0" title="Mewar University AccessPath">
          MU
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search Mewar University..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-[1px] h-6 bg-slate-200 mx-0.5" />

        {/* Directions Action Button (Blue Google Maps Navigation Circle) */}
        <button
          onClick={onOpenDirections}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all shrink-0"
          title="Get Directions"
        >
          <Navigation className="w-4 h-4 fill-white" />
        </button>

      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150">
          {suggestions.map(loc => (
            <div
              key={loc.id}
              onMouseDown={() => handleSelectSuggestion(loc)}
              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: loc.color }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{loc.name}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{loc.category} • Mewar University</div>
                </div>
              </div>

              {loc.wheelchairAccessible && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ♿ Step-Free
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(isSelected ? null : cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
