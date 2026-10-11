import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Navigation, Accessibility } from 'lucide-react';
import type { CampusLocation, LocationCategory } from '../types/campus';

interface SearchPanelProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  onSetAsStart: (loc: CampusLocation) => void;
  onSetAsDest: (loc: CampusLocation) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CATEGORIES: (LocationCategory | 'All')[] = [
  'All',
  'Hostel',
  'Academic',
  'Dining',
  'Sports',
  'Medical',
  'Worship',
  'Green Area'
];

export const SearchPanel: React.FC<SearchPanelProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onSetAsStart,
  onSetAsDest,
  isOpen,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'All'>('All');

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || loc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchTerm, activeCategory]);

  return (
    <div className="pointer-events-auto">
      {/* Toggle button when closed on small screens */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 left-4 z-20 flex items-center gap-2 bg-slate-900/90 text-cyan-400 border border-cyan-500/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl shadow-cyan-950/40 backdrop-blur-md hover:bg-slate-800 transition-all"
        >
          <Search className="w-4 h-4" /> Explore Locations ({locations.length})
        </button>
      )}

      {/* Main Drawer Panel */}
      {isOpen && (
        <div className="fixed top-20 left-4 bottom-20 z-20 w-84 md:w-96 flex flex-col bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden transition-all animate-in fade-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Campus Directory</h2>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                {filteredLocations.length}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close directory"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search buildings, hostels, sports..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar mt-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLocations.map(loc => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: loc.color }}
                      >
                        {loc.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {loc.name}
                        </h3>
                        <span className="text-[10px] font-medium text-slate-400">
                          {loc.category}
                        </span>
                      </div>
                    </div>

                    {loc.wheelchairAccessible && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 rounded-md" title="Wheelchair Accessible">
                        <Accessibility className="w-3 h-3" /> Step-Free
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsStart(loc);
                      }}
                      className="flex-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-1.5 rounded-lg border border-slate-700 transition-all text-center flex items-center justify-center gap-1"
                    >
                      <span>📍</span> Start
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsDest(loc);
                      }}
                      className="flex-1 text-[10px] font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 py-1.5 rounded-lg border border-cyan-500/40 transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-2.5 h-2.5" /> Destination
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No campus locations found matching "{searchTerm}".
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
