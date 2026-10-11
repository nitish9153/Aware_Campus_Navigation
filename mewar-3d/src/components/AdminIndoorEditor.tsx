import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Upload,
  Building,
  Check,
  DoorOpen,
  Download
} from 'lucide-react';
import type {
  IndoorBuilding,
  BuildingFloor,
  FloorRoom,
  RoomType
} from '../types/indoor';
import { FloorPlanViewer } from './FloorPlanViewer';

interface AdminIndoorEditorProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: IndoorBuilding[];
  onSaveBuildings: (buildings: IndoorBuilding[]) => void;
  onResetBuildings: () => void;
  onExportJson?: () => void;
}

export const AdminIndoorEditor: React.FC<AdminIndoorEditorProps> = ({
  isOpen,
  onClose,
  buildings,
  onSaveBuildings,
  onResetBuildings,
  onExportJson
}) => {
  const [data, setData] = useState<IndoorBuilding[]>(buildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );
  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    buildings[0]?.floors[0]?.id || ''
  );

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'floors' | 'rooms' | 'corridors' | 'plan'>('rooms');

  // Form states for Room
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string>('101');
  const [roomName, setRoomName] = useState<string>('New Lecture Room');
  const [roomType, setRoomType] = useState<RoomType>('Classroom');
  const [roomDesc, setRoomDesc] = useState<string>('');
  const [roomX, setRoomX] = useState<number>(20);
  const [roomY, setRoomY] = useState<number>(30);
  const [doorX, setDoorX] = useState<number>(50);
  const [doorY, setDoorY] = useState<number>(50);
  const [doorCorridorNodeId, setDoorCorridorNodeId] = useState<string>('');
  const [isRoomAccessible, setIsRoomAccessible] = useState<boolean>(true);
  const [roomAccessNotes, setRoomAccessNotes] = useState<string>('Step-free accessible door');

  // Form states for Floor
  const [floorNameInput, setFloorNameInput] = useState<string>('');
  const [floorNumberInput, setFloorNumberInput] = useState<number>(0);
  const [floorCodeInput, setFloorCodeInput] = useState<string>('');

  // Selected room for preview
  const [previewRoom, setPreviewRoom] = useState<FloorRoom | null>(null);

  if (!isOpen) return null;

  const currentBuilding =
    data.find(b => b.id === selectedBuildingId) || data[0];
  const currentFloor =
    currentBuilding?.floors.find(f => f.id === selectedFloorId) ||
    currentBuilding?.floors[0];

  // ==========================================
  // Floor Management Handlers
  // ==========================================
  const handleAddFloor = () => {
    if (!currentBuilding) return;
    const nextNum = !isNaN(floorNumberInput) && floorNumberInput >= 0 ? floorNumberInput : currentBuilding.floors.length;
    const newFloorId = `fl_${currentBuilding.id}_${nextNum}_${Date.now().toString().slice(-4)}`;
    const newFloor: BuildingFloor = {
      id: newFloorId,
      buildingId: currentBuilding.id,
      floorNumber: nextNum,
      floorName: floorNameInput.trim() || `Floor ${nextNum}`,
      code: floorCodeInput.trim() || `${nextNum}F`,
      corridorNodes: [
        {
          id: `node_c_${newFloorId}_center`,
          floorId: newFloorId,
          type: 'corridor',
          label: 'Central Hallway',
          x: 50,
          y: 50,
          isAccessible: true
        }
      ],
      corridorEdges: [],
      rooms: []
    };

    const updated = data.map(b => {
      if (b.id === currentBuilding.id) {
        return { ...b, floors: [...b.floors, newFloor] };
      }
      return b;
    });

    setData(updated);
    setSelectedFloorId(newFloorId);
    setFloorNameInput('');
    setFloorCodeInput('');
  };

  const handleDeleteFloor = (floorId: string) => {
    if (!currentBuilding || currentBuilding.floors.length <= 1) {
      alert('A building must have at least one floor.');
      return;
    }
    if (!confirm('Are you sure you want to delete this floor and all its rooms?')) return;

    const updated = data.map(b => {
      if (b.id === currentBuilding.id) {
        const filtered = b.floors.filter(f => f.id !== floorId);
        return { ...b, floors: filtered };
      }
      return b;
    });

    setData(updated);
    const remaining = currentBuilding.floors.filter(f => f.id !== floorId);
    if (remaining.length > 0) {
      setSelectedFloorId(remaining[0].id);
    }
  };

  const handleFloorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBuilding || !currentFloor) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = data.map(b => {
        if (b.id === currentBuilding.id) {
          const updatedFloors = b.floors.map(f => {
            if (f.id === currentFloor.id) {
              return { ...f, floorPlanImageUrl: dataUrl };
            }
            return f;
          });
          return { ...b, floors: updatedFloors };
        }
        return b;
      });
      setData(updated);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // Room Management Handlers
  // ==========================================
  const handleSaveRoom = () => {
    if (!currentBuilding || !currentFloor) return;

    const roomId = editingRoomId || `room_${currentFloor.id}_${Date.now().toString().slice(-4)}`;
    const newRoom: FloorRoom = {
      id: roomId,
      roomNumber: roomNumber.trim(),
      name: roomName.trim(),
      type: roomType,
      description: roomDesc.trim(),
      x: roomX,
      y: roomY,
      width: 20,
      height: 20,
      doorLocation: { x: doorX, y: doorY },
      doorCorridorNodeId: doorCorridorNodeId || currentFloor.corridorNodes[0]?.id || '',
      isAccessible: isRoomAccessible,
      accessibilityNotes: roomAccessNotes.trim()
    };

    const updated = data.map(b => {
      if (b.id === currentBuilding.id) {
        const updatedFloors = b.floors.map(f => {
          if (f.id === currentFloor.id) {
            let updatedRooms: FloorRoom[];
            if (editingRoomId) {
              updatedRooms = f.rooms.map(r => (r.id === editingRoomId ? newRoom : r));
            } else {
              updatedRooms = [...f.rooms, newRoom];
            }
            return { ...f, rooms: updatedRooms };
          }
          return f;
        });
        return { ...b, floors: updatedFloors };
      }
      return b;
    });

    setData(updated);
    setEditingRoomId(null);
    setRoomNumber('101');
    setRoomName('New Classroom');
    setRoomDesc('');
  };

  const handleEditRoom = (room: FloorRoom) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setRoomName(room.name);
    setRoomType(room.type);
    setRoomDesc(room.description || '');
    setRoomX(room.x);
    setRoomY(room.y);
    setDoorX(room.doorLocation.x);
    setDoorY(room.doorLocation.y);
    setDoorCorridorNodeId(room.doorCorridorNodeId);
    setIsRoomAccessible(room.isAccessible);
    setRoomAccessNotes(room.accessibilityNotes || '');
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    const updated = data.map(b => {
      if (b.id === currentBuilding.id) {
        const updatedFloors = b.floors.map(f => {
          if (f.id === currentFloor.id) {
            return { ...f, rooms: f.rooms.filter(r => r.id !== roomId) };
          }
          return f;
        });
        return { ...b, floors: updatedFloors };
      }
      return b;
    });
    setData(updated);
  };

  // Click on floor plan to set room or door position
  const handleFloorPlanClick = (xPct: number, yPct: number) => {
    if (activeTab === 'rooms') {
      setRoomX(xPct);
      setRoomY(yPct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide">
                  Building, Floor & Room Administrator
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  ADMIN MODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage building levels, floor plans, room numbers, doors, and indoor corridor routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSaveBuildings(data);
                alert('All building, floor, and room changes saved and persisted!');
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Persist</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Building & Floor Selector Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Building Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-400" /> Building:
              </span>
              <select
                value={selectedBuildingId}
                onChange={e => {
                  setSelectedBuildingId(e.target.value);
                  const b = data.find(x => x.id === e.target.value);
                  if (b && b.floors.length > 0) {
                    setSelectedFloorId(b.floors[0].id);
                  }
                }}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {data.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.floors.length} Floors)
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Selector */}
            {currentBuilding && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700">
                <span className="text-xs font-bold text-slate-400">Floor:</span>
                {currentBuilding.floors.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFloorId(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      f.id === currentFloor?.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.code || f.floorName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rooms' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rooms ({currentFloor?.rooms.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('floors')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'floors' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Floor Setup
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'plan' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Plan
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          {/* Left Panel: Form / Table depending on tab */}
          <div className="md:col-span-5 h-full overflow-y-auto p-4 space-y-4">
            {activeTab === 'rooms' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    {editingRoomId ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  {editingRoomId && (
                    <button
                      onClick={() => setEditingRoomId(null)}
                      className="text-xs text-slate-400 hover:text-white font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 101, G-01"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Room Type
                    </label>
                    <select
                      value={roomType}
                      onChange={e => setRoomType(e.target.value as RoomType)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Classroom">Classroom</option>
                      <option value="Computer Lab">Computer Lab</option>
                      <option value="Faculty Office">Faculty Office</option>
                      <option value="Library">Library</option>
                      <option value="Seminar Hall">Seminar Hall</option>
                      <option value="Restroom">Restroom</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Hostel Room">Hostel Room</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI & Robotics Research Lab"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 60 workstations, projector, braille signage"
                    value={roomDesc}
                    onChange={e => setRoomDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Location on Floor Plan (X, Y) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Room X Position (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={roomX}
                      onChange={e => setRoomX(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Room Y Position (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={roomY}
                      onChange={e => setRoomY(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Door & Corridor Connection */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" /> Door & Walkable Corridor
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Door X (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={doorX}
                        onChange={e => setDoorX(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Door Y (%)</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={doorY}
                        onChange={e => setDoorY(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Connected Corridor Node</span>
                    <select
                      value={doorCorridorNodeId}
                      onChange={e => setDoorCorridorNodeId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="">Default Nearest Hallway Node</option>
                      {currentFloor?.corridorNodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.label || n.id} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step-Free Accessibility Toggle */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRoomAccessible}
                      onChange={e => setIsRoomAccessible(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Verified Step-Free Door (Wide entrance, level threshold)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Accessibility notes (e.g. Braille plaque, roll-in desk)"
                    value={roomAccessNotes}
                    onChange={e => setRoomAccessNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>

                {/* Save Room Button */}
                <button
                  onClick={handleSaveRoom}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRoomId ? 'Update Room' : 'Add Room to Floor'}</span>
                </button>

                {/* Existing Rooms List on Current Floor */}
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Configured Rooms on {currentFloor?.floorName} ({currentFloor?.rooms.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {currentFloor?.rooms.map(room => (
                      <div
                        key={room.id}
                        className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-1 rounded">
                              {room.roomNumber}
                            </span>
                            <span className="font-semibold text-white truncate">
                              {room.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{room.type}</span>
                            {room.isAccessible && <span className="text-emerald-400">♿ Step-Free</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Edit Room"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1 text-slate-400 hover:text-red-400"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'floors' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Floor Management for {currentBuilding?.name}
                </h3>

                {/* Add Floor Section */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-400" /> Add New Floor
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Floor No.</label>
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={floorNumberInput}
                        onChange={e => setFloorNumberInput(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Floor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Third Floor"
                        value={floorNameInput}
                        onChange={e => setFloorNameInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 3F"
                        value={floorCodeInput}
                        onChange={e => setFloorCodeInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddFloor}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Create Floor
                  </button>
                </div>

                {/* Upload Floor Plan Image */}
                {currentFloor && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Floor Plan Image for {currentFloor.floorName}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Upload an architectural schematic or floor blueprint image for this level.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFloorImageUpload}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    {currentFloor.floorPlanImageUrl && (
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        ✓ Custom floor plan image loaded
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Floors Table */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Floors in Building
                  </h4>
                  {currentBuilding?.floors.map(floor => (
                    <div
                      key={floor.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{floor.floorName} ({floor.code})</div>
                        <div className="text-[10px] text-slate-400">
                          Level {floor.floorNumber} • {floor.rooms.length} Rooms • {floor.corridorNodes.length} Waypoints
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedFloorId(floor.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleDeleteFloor(floor.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="Delete Floor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {activeTab === 'plan' && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Floor Plan Waypoints & Preview
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click anywhere on the interactive floor plan to place rooms or inspect waypoints. Rooms are placed as percentage coordinates (0 to 100%) so they scale seamlessly with zoom.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-white">Current Active Floor:</div>
                  <div className="text-cyan-300 font-mono">
                    {currentBuilding?.name} → {currentFloor?.floorName} ({currentFloor?.code})
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Floor Plan Viewer */}
          <div className="md:col-span-7 h-full bg-slate-950 relative flex flex-col">
            {currentFloor ? (
              <FloorPlanViewer
                floor={currentFloor}
                allFloors={currentBuilding?.floors || []}
                onSelectFloor={setSelectedFloorId}
                selectedRoom={previewRoom}
                onSelectRoom={setPreviewRoom}
                activeIndoorRoute={null}
                isAdminMode={true}
                onMapClick={handleFloorPlanClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                No floor selected.
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar: JSON Export & Reset */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Indoor JSON</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset all buildings, floors, and rooms to default verified demo data?')) {
                onResetBuildings();
                setData(buildings);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

      </div>
    </div>
  );
};
