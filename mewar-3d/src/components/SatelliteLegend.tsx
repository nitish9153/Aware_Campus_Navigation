import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { SatelliteLocation } from '../data/mewarSatelliteData';

interface SatelliteLegendProps {
  locations: SatelliteLocation[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ITEMS: {
  key: string;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'Hostel', label: 'Hostels', icon: '🛏️', color: '#a855f7' },
  { key: 'Medical', label: 'Medical Facilities', icon: '➕', color: '#ef4444' },
  { key: 'Academic', label: 'Academic Buildings', icon: '🏛️', color: '#0284c7' },
  { key: 'Administration', label: 'Administration', icon: '🎓', color: '#2563eb' },
  { key: 'Dining', label: 'Dining Facilities', icon: '🍴', color: '#f97316' },
  { key: 'Sports', label: 'Sports Grounds', icon: '⚽', color: '#10b981' },
  { key: 'Green Area', label: 'Parks & Lawns', icon: '🌳', color: '#22c55e' },
  { key: 'Gate', label: 'Gates & Portals', icon: '🚪', color: '#64748b' },
  { key: 'Worship', label: 'Places of Worship', icon: '🛕', color: '#3b82f6' }
];

export const SatelliteLegend: React.FC<SatelliteLegendProps> = ({
  locations,
  selectedCategory,
  onSelectCategory,
  isOpen,
  onClose
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-4 z-20 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-right duration-200">
      
      {/* Legend Header */}
      <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wide">Campus Legend</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title={isMinimized ? "Expand" : "Collapse"}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded text-xs"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Legend Categories List */}
      {!isMinimized && (
        <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Filter Markers</span>
            {selectedCategory && (
              <button
                onClick={() => onSelectCategory(null)}
                className="text-blue-600 hover:underline font-bold"
              >
                Reset
              </button>
            )}
          </div>

          {CATEGORY_ITEMS.map(cat => {
            const count = locations.filter(l => l.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(isSelected ? null : cat.key)}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-all text-xs ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-300 font-bold text-blue-900'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: cat.color }}
                    className="w-5 h-5 rounded-md text-white flex items-center justify-center text-[10px] shadow-sm shrink-0"
                  >
                    {cat.icon}
                  </span>
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}

          {/* Pathway Network Legends */}
          <div className="pt-2.5 border-t border-slate-200 mt-2 space-y-1.5">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Path & Route Network
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-red-50/70 border border-red-200/80 flex items-center justify-between text-xs text-red-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 bg-red-500 rounded-full shadow-sm"></div>
                <span className="text-[11px] font-bold">Allowed Walking Paths</span>
              </div>
              <span className="text-[10px] text-red-700 font-extrabold uppercase">Red Line</span>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-sky-50/70 border border-sky-200/80 flex items-center justify-between text-xs text-sky-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-sm ring-1 ring-cyan-400"></div>
                <span className="text-[11px] font-bold">Active Selected Route</span>
              </div>
              <span className="text-[10px] text-blue-700 font-extrabold uppercase">Cyan / Blue</span>
            </div>
            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-medium text-slate-500">Accessible Mode</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">♿ Step-Free Certified</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
