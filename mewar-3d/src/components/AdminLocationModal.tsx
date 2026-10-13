import React, { useState } from 'react';
import { X, MapPin, Plus, Trash2, Download, Upload, Check, RotateCcw } from 'lucide-react';
import type { GeoLocation } from '../data/mewarGeoData';

interface AdminLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: GeoLocation[];
  selectedLocation: GeoLocation | null;
  onSaveLocation: (loc: GeoLocation) => void;
  onDeleteLocation: (id: string) => void;
  onResetAll: () => void;
  onImportJson: (imported: GeoLocation[]) => void;
}

const CATEGORIES: GeoLocation['category'][] = [
  'Hostel',
  'Academic',
  'Dining',
  'Sports',
  'Medical',
  'Worship',
  'Green Area',
  'Administration',
  'Gate',
  'Library'
];

export const AdminLocationModal: React.FC<AdminLocationModalProps> = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onSaveLocation,
  onDeleteLocation,
  onResetAll,
  onImportJson
}) => {
  const [editingLoc, setEditingLoc] = useState<GeoLocation | null>(selectedLocation || locations[0] || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields
  const [name, setName] = useState(editingLoc?.name || '');
  const [code, setCode] = useState(editingLoc?.code || '');
  const [category, setCategory] = useState<GeoLocation['category']>(editingLoc?.category || 'Academic');
  const [description, setDescription] = useState(editingLoc?.description || '');
  const [lat, setLat] = useState(editingLoc?.lat || 25.031338);
  const [lng, setLng] = useState(editingLoc?.lng || 74.636520);
  const [color, setColor] = useState(editingLoc?.color || '#2563eb');
  const [wheelchairAccessible, setWheelchairAccessible] = useState(editingLoc?.wheelchairAccessible ?? true);
  const [rampAvailable, setRampAvailable] = useState(editingLoc?.rampAvailable ?? true);
  const [elevatorAvailable, setElevatorAvailable] = useState(editingLoc?.elevatorAvailable ?? false);
  const [brailleSignage, setBrailleSignage] = useState(editingLoc?.brailleSignage ?? false);
  const [facilitiesStr, setFacilitiesStr] = useState(editingLoc?.facilities.join(', ') || '');

  React.useEffect(() => {
    if (selectedLocation) {
      setEditingLoc(selectedLocation);
      setIsCreatingNew(false);
      setName(selectedLocation.name);
      setCode(selectedLocation.code);
      setCategory(selectedLocation.category);
      setDescription(selectedLocation.description);
      setLat(selectedLocation.lat);
      setLng(selectedLocation.lng);
      setColor(selectedLocation.color);
      setWheelchairAccessible(selectedLocation.wheelchairAccessible);
      setRampAvailable(selectedLocation.rampAvailable);
      setElevatorAvailable(selectedLocation.elevatorAvailable);
      setBrailleSignage(selectedLocation.brailleSignage);
      setFacilitiesStr(selectedLocation.facilities.join(', '));
    }
  }, [selectedLocation]);

  if (!isOpen) return null;

  const handleSelectToEdit = (loc: GeoLocation) => {
    setEditingLoc(loc);
    setIsCreatingNew(false);
    setName(loc.name);
    setCode(loc.code);
    setCategory(loc.category);
    setDescription(loc.description);
    setLat(loc.lat);
    setLng(loc.lng);
    setColor(loc.color);
    setWheelchairAccessible(loc.wheelchairAccessible);
    setRampAvailable(loc.rampAvailable);
    setElevatorAvailable(loc.elevatorAvailable);
    setBrailleSignage(loc.brailleSignage);
    setFacilitiesStr(loc.facilities.join(', '));
  };

  const handleStartNew = () => {
    setIsCreatingNew(true);
    setEditingLoc(null);
    setName('');
    setCode('');
    setCategory('Academic');
    setDescription('');
    setLat(25.031338);
    setLng(74.636520);
    setColor('#2563eb');
    setWheelchairAccessible(true);
    setRampAvailable(true);
    setElevatorAvailable(false);
    setBrailleSignage(false);
    setFacilitiesStr('Step-Free Entrance, Ramped Access');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const facilities = facilitiesStr.split(',').map(s => s.trim()).filter(Boolean);
    const id = isCreatingNew || !editingLoc ? `loc_${Date.now()}` : editingLoc.id;

    const updated: GeoLocation = {
      id,
      name: name.trim(),
      code: (code || name.slice(0, 4).toUpperCase()).trim(),
      category,
      description: description.trim() || `${name} on Mewar University campus.`,
      lat: Number(lat),
      lng: Number(lng),
      color,
      iconType: category === 'Hostel' ? 'bed' : category === 'Dining' ? 'utensils' : category === 'Gate' ? 'gate' : category === 'Medical' ? 'cross' : category === 'Sports' ? 'ball' : category === 'Green Area' ? 'tree' : 'building',
      wheelchairAccessible,
      rampAvailable,
      elevatorAvailable,
      brailleSignage,
      facilities,
      entranceNodeId: editingLoc?.entranceNodeId || `node_ent_${id}`
    };

    onSaveLocation(updated);
    setIsCreatingNew(false);
    setEditingLoc(updated);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ locations }, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', 'mewar_campus_locations.json');
    dl.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const locs = parsed.locations || parsed;
        if (Array.isArray(locs)) {
          onImportJson(locs);
        }
      } catch (err) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              📍
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Admin Campus Location &amp; Marker Editor</h2>
              <p className="text-[11px] text-slate-400">Add, edit, or adjust coordinates for Mewar University landmarks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export Locations as JSON"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer" title="Import Locations from JSON">
              <Upload className="w-3.5 h-3.5" /> Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left: Location List */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {locations.length} Markers
              </span>
              <button
                onClick={handleStartNew}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {locations.map(loc => {
                const isSelected = (!isCreatingNew && editingLoc?.id === loc.id);
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectToEdit(loc)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{loc.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{loc.category} • {loc.code}</div>
                      </div>
                    </div>
                    {loc.wheelchairAccessible && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                        ♿
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                onClick={onResetAll}
                className="w-full py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Verified Defaults
              </button>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{isCreatingNew ? 'Create New Campus Marker' : `Edit: ${name || 'Marker'}`}</span>
              </h3>
              {!isCreatingNew && editingLoc && (
                <button
                  onClick={() => {
                    if (confirm(`Delete marker "${editingLoc.name}"?`)) {
                      onDeleteLocation(editingLoc.id);
                      setIsCreatingNew(true);
                    }
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Kumbah Hostel"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Code / Abbreviation</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. KBH"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as GeoLocation['category'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Pin Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={facilitiesStr}
                  onChange={e => setFacilitiesStr(e.target.value)}
                  placeholder="e.g. Ramp Access, Elevator, Braille Signage, Security Desk"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Accessibility Checkboxes */}
              <div className="col-span-2 grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={wheelchairAccessible}
                    onChange={e => setWheelchairAccessible(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Wheelchair Accessible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={rampAvailable}
                    onChange={e => setRampAvailable(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Ramped Entrance</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={elevatorAvailable}
                    onChange={e => setElevatorAvailable(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Elevator Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={brailleSignage}
                    onChange={e => setBrailleSignage(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Braille Signage</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Marker</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
