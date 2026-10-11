import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Accessibility
} from 'lucide-react';
import type { BuildingFloor, FloorRoom, IndoorRouteResult } from '../types/indoor';

interface FloorPlanViewerProps {
  floor: BuildingFloor;
  allFloors: BuildingFloor[];
  onSelectFloor: (floorId: string) => void;
  selectedRoom: FloorRoom | null;
  onSelectRoom: (room: FloorRoom) => void;
  activeIndoorRoute: IndoorRouteResult | null;
  // Admin interaction props
  isAdminMode?: boolean;
  onMapClick?: (xPercent: number, yPercent: number) => void;
  onRoomDragEnd?: (roomId: string, newX: number, newY: number) => void;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  floor,
  allFloors,
  onSelectFloor,
  selectedRoom,
  onSelectRoom,
  activeIndoorRoute,
  isAdminMode = false,
  onMapClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get active route coordinates on THIS floor
  const currentFloorPath = activeIndoorRoute?.floorPaths.find(
    fp => fp.floorId === floor.id
  );

  const handleZoomIn = () => setScale(s => Math.min(s + 0.3, 3.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.3, 0.6));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click for pan
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClickPlan = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAdminMode || !onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onMapClick(Math.max(0, Math.min(100, xPct)), Math.max(0, Math.min(100, yPct)));
  };

  useEffect(() => {
    // Reset view when floor changes
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [floor.id]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none flex flex-col">
      
      {/* Top Floating Floor Switcher & Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Floor Selection Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1 px-2 text-[11px] font-black text-slate-400">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">FLOOR:</span>
          </div>

          {allFloors.map(f => {
            const isActive = f.id === floor.id;
            const hasDestination = activeIndoorRoute?.destFloorId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFloor(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{f.code || f.floorName}</span>
                {hasDestination && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Destination Floor" />
                )}
              </button>
            );
          })}
        </div>

        {/* Current Floor Name Tag */}
        <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-white font-extrabold shadow-md hidden md:block">
          {floor.floorName}
        </div>

      </div>

      {/* Main Floor Plan Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full flex items-center justify-center overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative w-[750px] h-[550px] max-w-full max-h-full bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden shrink-0"
        >
          {/* 1. Custom Image Overlay if floor plan image is provided */}
          {floor.floorPlanImageUrl ? (
            <img
              src={floor.floorPlanImageUrl}
              alt={floor.floorName}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
            />
          ) : (
            /* 2. Architectural Floor Plan Grid Base */
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-920 to-slate-950 pointer-events-none">
              {/* Subtle Gridlines */}
              <div
                className="w-full h-full opacity-15"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}
              />
            </div>
          )}

          {/* 3. SVG Layer for Corridors, Walls, Doors, and Routes */}
          <svg
            onClick={handleClickPlan}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Walkable Corridors Background Network */}
            <g opacity="0.85">
              {floor.corridorEdges.map(edge => {
                const src = floor.corridorNodes.find(n => n.id === edge.source);
                const tgt = floor.corridorNodes.find(n => n.id === edge.target);
                if (!src || !tgt) return null;
                return (
                  <line
                    key={edge.id}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={edge.isAccessible ? '#0284c7' : '#d97706'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={edge.isAccessible ? undefined : '2, 2'}
                  />
                );
              })}
            </g>

            {/* Inner Corridor Pavement Highlight */}
            <g opacity="0.65">
              {floor.corridorEdges.map(edge => {
                const src = floor.corridorNodes.find(n => n.id === edge.source);
                const tgt = floor.corridorNodes.find(n => n.id === edge.target);
                if (!src || !tgt) return null;
                return (
                  <line
                    key={`inner_${edge.id}`}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="#e0f2fe"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Verified Active Indoor Route Polyline on this floor */}
            {currentFloorPath && currentFloorPath.coordinates.length >= 2 && (
              <g>
                {/* Glowing Outer casing */}
                <polyline
                  points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="5"
                  strokeOpacity="0.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Bright Cyan Route Line */}
                <polyline
                  points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeOpacity="0.95"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Animated Pulsating Dashes */}
                <polyline
                  points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray="3, 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* Corridor Waypoints / Connectors */}
            {floor.corridorNodes.map(node => {
              if (node.type === 'corridor') {
                return (
                  <circle
                    key={node.id}
                    cx={node.x}
                    cy={node.y}
                    r="1.2"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />
                );
              }

              if (node.type === 'entrance') {
                return (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="0.8" />
                    <text x={node.x} y={node.y + 1} textAnchor="middle" fontSize="2" fill="#ffffff" fontWeight="bold">
                      IN
                    </text>
                  </g>
                );
              }

              if (node.type === 'elevator') {
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x - 3}
                      y={node.y - 3}
                      width="6"
                      height="6"
                      rx="1"
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text x={node.x} y={node.y + 1.2} textAnchor="middle" fontSize="2.8" fill="#ffffff" fontWeight="bold">
                      🛗
                    </text>
                  </g>
                );
              }

              if (node.type === 'stairs') {
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x - 3}
                      y={node.y - 3}
                      width="6"
                      height="6"
                      rx="1"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text x={node.x} y={node.y + 1.2} textAnchor="middle" fontSize="2.8" fill="#ffffff" fontWeight="bold">
                      🪜
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {/* Room Doors & Connection Lines */}
            {floor.rooms.map(room => (
              <g key={`door_${room.id}`}>
                {/* Line from door to room center */}
                <line
                  x1={room.doorLocation.x}
                  y1={room.doorLocation.y}
                  x2={room.x + (room.width || 15) / 2}
                  y2={room.y + (room.height || 15) / 2}
                  stroke="#64748b"
                  strokeWidth="0.8"
                  strokeDasharray="1, 1"
                />
                {/* Door Marker */}
                <circle
                  cx={room.doorLocation.x}
                  cy={room.doorLocation.y}
                  r="1.6"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
              </g>
            ))}
          </svg>

          {/* 4. Interactive Room Polygons & Badges (HTML absolute overlays for rich styling) */}
          {floor.rooms.map(room => {
            const isSelected = selectedRoom?.id === room.id;
            const isRouteDestination = activeIndoorRoute?.destRoom?.id === room.id;

            let badgeColor = 'bg-slate-800/90 border-slate-700 text-slate-200';
            let typeIcon = '📖';

            if (room.type === 'Computer Lab') {
              badgeColor = 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200';
              typeIcon = '💻';
            } else if (room.type === 'Classroom') {
              badgeColor = 'bg-blue-950/90 border-blue-500/50 text-blue-200';
              typeIcon = '🏫';
            } else if (room.type === 'Administrative') {
              badgeColor = 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200';
              typeIcon = '🏛️';
            } else if (room.type === 'Restroom') {
              badgeColor = 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200';
              typeIcon = '🚻';
            } else if (room.type === 'Seminar Hall') {
              badgeColor = 'bg-purple-950/90 border-purple-500/50 text-purple-200';
              typeIcon = '🎭';
            } else if (room.type === 'Hostel Room') {
              badgeColor = 'bg-violet-950/90 border-violet-500/50 text-violet-200';
              typeIcon = '🛏️';
            }

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                style={{
                  left: `${room.x}%`,
                  top: `${room.y}%`,
                  width: `${room.width || 18}%`,
                  height: `${room.height || 18}%`
                }}
                className={`absolute rounded-2xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 backdrop-blur-sm ${badgeColor} ${
                  isSelected
                    ? 'ring-4 ring-cyan-400 scale-105 z-30 shadow-2xl'
                    : 'hover:scale-102 hover:border-blue-400 shadow-md'
                } ${isRouteDestination ? 'ring-4 ring-red-500 bg-red-950/80 animate-pulse' : ''}`}
              >
                {/* Header: Room Number & Type Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md text-white">
                    {room.roomNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{typeIcon}</span>
                    {room.isAccessible && (
                      <span className="text-[10px]" title="Accessible Entrance">
                        ♿
                      </span>
                    )}
                  </div>
                </div>

                {/* Room Name */}
                <div className="text-[10px] font-bold leading-tight line-clamp-2 text-white/95">
                  {room.name}
                </div>

                {/* Subtext */}
                <div className="text-[8px] text-slate-400 truncate">
                  {room.type}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Bottom Controls Bar (Zoom, Pan, Info) */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg overflow-hidden divide-x divide-slate-800">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Floor Plan View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Room Details Card Popup */}
      {selectedRoom && (
        <div className="absolute bottom-4 left-4 z-20 w-80 max-w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-white space-y-2 animate-in fade-in slide-in-from-bottom duration-150">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-cyan-400">
                  Room {selectedRoom.roomNumber}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {floor.floorName}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
                {selectedRoom.name}
              </h4>
            </div>
            <button
              onClick={() => onSelectRoom(null!)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {selectedRoom.description && (
            <p className="text-[11px] text-slate-300 leading-snug">
              {selectedRoom.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400">Category: {selectedRoom.type}</span>
            <span className={`font-bold flex items-center gap-1 ${selectedRoom.isAccessible ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Accessibility className="w-3 h-3" />
              {selectedRoom.isAccessible ? 'Step-Free Door' : 'Standard Door'}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
