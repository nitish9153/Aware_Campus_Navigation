import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2, Download, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import type { SatelliteLocation } from '../data/mewarSatelliteData';

interface AdminSatelliteLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: SatelliteLocation[];
  selectedLocation: SatelliteLocation | null;
  onSaveLocation: (loc: SatelliteLocation) => void;
  onDeleteLocation: (id: string) => void;
  onResetAll: () => void;
  onImportJson: (imported: SatelliteLocation[]) => void;
}

const CATEGORIES: SatelliteLocation['category'][] = [
  'Hostel',
  'Academic',
  'Dining',
  'Sports',
  'Medical',
  'Worship',
  'Green Area',
  'Administration',
  'Gate'
];

export const AdminSatelliteLocationModal: React.FC<AdminSatelliteLocationModalProps> = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onSaveLocation,
  onDeleteLocation,
  onResetAll,
  onImportJson
}) => {
  const [editingLoc, setEditingLoc] = useState<SatelliteLocation | null>(selectedLocation || locations[0] || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields
  const [name, setName] = useState(editingLoc?.name || '');
  const [hindiName, setHindiName] = useState(editingLoc?.hindiName || '');
  const [code, setCode] = useState(editingLoc?.code || '');
  const [category, setCategory] = useState<SatelliteLocation['category']>(editingLoc?.category || 'Academic');
  const [description, setDescription] = useState(editingLoc?.description || '');
  const [lat, setLat] = useState(editingLoc?.position[0] ?? 1000);
  const [lng, setLng] = useState(editingLoc?.position[1] ?? 500);
  const [color, setColor] = useState(editingLoc?.color || '#2563eb');
  const [entranceNodeId, setEntranceNodeId] = useState(editingLoc?.entranceNodeId || '');
  const [wheelchairAccessible, setWheelchairAccessible] = useState(editingLoc?.wheelchairAccessible ?? true);
  const [rampAvailable, setRampAvailable] = useState(editingLoc?.rampAvailable ?? true);
  const [elevatorAvailable, setElevatorAvailable] = useState(editingLoc?.elevatorAvailable ?? false);
  const [brailleSignage, setBrailleSignage] = useState(editingLoc?.brailleSignage ?? false);
  const [facilitiesStr, setFacilitiesStr] = useState(editingLoc?.facilities.join(', ') || '');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedLocation) {
      loadIntoForm(selectedLocation);
    } else if (locations.length > 0 && !editingLoc) {
      loadIntoForm(locations[0]);
    }
  }, [selectedLocation, locations]);

  if (!isOpen) return null;

  function loadIntoForm(loc: SatelliteLocation) {
    setEditingLoc(loc);
    setIsCreatingNew(false);
    setName(loc.name);
    setHindiName(loc.hindiName || '');
    setCode(loc.code);
    setCategory(loc.category);
    setDescription(loc.description);
    setLat(loc.position[0]);
    setLng(loc.position[1]);
    setColor(loc.color || '#2563eb');
    setEntranceNodeId(loc.entranceNodeId || '');
    setWheelchairAccessible(loc.wheelchairAccessible);
    setRampAvailable(loc.rampAvailable);
    setElevatorAvailable(loc.elevatorAvailable);
    setBrailleSignage(loc.brailleSignage);
    setFacilitiesStr(loc.facilities.join(', '));
  }

  const handleStartNew = () => {
    setIsCreatingNew(true);
    setEditingLoc(null);
    setName('');
    setHindiName('');
    setCode('');
    setCategory('Academic');
    setDescription('');
    setLat(900);
    setLng(500);
    setColor('#2563eb');
    setEntranceNodeId('');
    setWheelchairAccessible(true);
    setRampAvailable(true);
    setElevatorAvailable(false);
    setBrailleSignage(false);
    setFacilitiesStr('Accessible Entrance, Ramp');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const facilities = facilitiesStr.split(',').map(s => s.trim()).filter(Boolean);
    const id = isCreatingNew || !editingLoc ? `loc_${Date.now()}` : editingLoc.id;

    const updated: SatelliteLocation = {
      id,
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      code: (code || name.slice(0, 4).toUpperCase()).trim(),
      category,
      description: description.trim() || `${name} on Mewar University campus.`,
      position: [Number(lat), Number(lng)],
      color,
      iconType: category === 'Hostel' ? 'bed' : category === 'Dining' ? 'utensils' : category === 'Gate' ? 'gate' : category === 'Medical' ? 'cross' : category === 'Sports' ? 'ball' : category === 'Green Area' ? 'tree' : 'building',
      wheelchairAccessible,
      rampAvailable,
      elevatorAvailable,
      brailleSignage,
      facilities,
      entranceNodeId: entranceNodeId.trim() || `node_ent_${id}`,
      aliases: [name.trim(), code.trim()].filter(Boolean)
    };

    onSaveLocation(updated);
    setIsCreatingNew(false);
    setEditingLoc(updated);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ locations }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `mewar_satellite_locations_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const imported = json.locations || json;
        if (Array.isArray(imported) && imported.length > 0) {
          onImportJson(imported);
          alert(`Successfully imported ${imported.length} satellite campus locations.`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Campus Landmark &amp; Building Marker Calibration
              </h2>
              <p className="text-xs text-slate-400">
                Leaflet CRS.Simple Satellite Map • Y: 0 (bottom) to 1536 (top), X: 0 (left) to 1024 (right)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Export Locations JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer" title="Import Locations JSON">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={onResetAll}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 transition-colors"
              title="Reset All Markers to Calibrated Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar list + Form */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar List */}
          <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/30">
            <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search landmarks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleStartNew}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                title="Add New Landmark"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredLocations.map(loc => {
                const isActive = editingLoc?.id === loc.id && !isCreatingNew;
                return (
                  <button
                    key={loc.id}
                    onClick={() => loadIntoForm(loc)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-sm'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: loc.color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <span>[{loc.position[0]}, {loc.position[1]}]</span>
                        <span>•</span>
                        <span>{loc.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isCreatingNew ? 'Create New Landmark Marker' : 'Edit Landmark Marker'}</span>
                {editingLoc && (
                  <span className="text-[11px] font-mono text-slate-400">({editingLoc.id})</span>
                )}
              </h3>
              {!isCreatingNew && editingLoc && (
                <button
                  onClick={() => {
                    if (confirm(`Delete '${editingLoc.name}'?`)) {
                      onDeleteLocation(editingLoc.id);
                      setEditingLoc(locations[0] || null);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/50 hover:bg-red-900 text-red-300 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sanga Hostel"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Hindi Name (Optional)
                </label>
                <input
                  type="text"
                  value={hindiName}
                  onChange={e => setHindiName(e.target.value)}
                  placeholder="e.g. सांगा हॉस्टल"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Abbreviation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. SBH"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SatelliteLocation['category'])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordinates in Leaflet CRS.Simple */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Satellite Image Pixel Coordinates [Lat, Lng]</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Bounds: [0, 0] to [1536, 1024]
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Latitude (Vertical, 0 at bottom, 1536 at top)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1536"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Longitude (Horizontal, 0 at left, 1024 at right)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1024"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Connected Road Entrance Node ID
                </label>
                <input
                  type="text"
                  value={entranceNodeId}
                  onChange={e => setEntranceNodeId(e.target.value)}
                  placeholder="e.g. node_ent_sanga"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Marker Pin Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief information about this building or facility..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Accessibility Checkboxes */}
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Accessibility Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wheelchairAccessible}
                    onChange={e => setWheelchairAccessible(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Wheelchair (♿)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rampAvailable}
                    onChange={e => setRampAvailable(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Ramp Access</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={elevatorAvailable}
                    onChange={e => setElevatorAvailable(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Elevator</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brailleSignage}
                    onChange={e => setBrailleSignage(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Braille Signage</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Facilities (comma separated)
              </label>
              <input
                type="text"
                value={facilitiesStr}
                onChange={e => setFacilitiesStr(e.target.value)}
                placeholder="Ramped Entrance, Accessible Restroom, Common Room"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>Save Landmark Marker</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
