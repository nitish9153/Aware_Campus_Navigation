import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Navigation,
  Accessibility,
  Footprints,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Wrench
} from 'lucide-react';
import type { IndoorBuilding, FloorRoom, IndoorRouteResult } from '../types/indoor';
import { FloorPlanViewer } from './FloorPlanViewer';

interface IndoorNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  building?: IndoorBuilding;
  buildings?: IndoorBuilding[];
  initialBuildingId?: string;
  targetRoom: FloorRoom | null;
  activeIndoorRoute: IndoorRouteResult | null;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  initialFloorId?: string;
  onSwitchToOutdoor?: () => void;
  onSwitchToOutdoorMap?: () => void;
  onOpenAdminEditor?: () => void;
}

export const IndoorNavigationModal: React.FC<IndoorNavigationModalProps> = ({
  isOpen,
  onClose,
  building: propBuilding,
  buildings = [],
  initialBuildingId,
  targetRoom,
  activeIndoorRoute,
  wheelchairOnly,
  onToggleWheelchair,
  initialFloorId,
  onSwitchToOutdoor,
  onSwitchToOutdoorMap,
  onOpenAdminEditor
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(() => {
    if (initialBuildingId) return initialBuildingId;
    if (propBuilding) return propBuilding.id;
    if (buildings.length > 0) return buildings[0].id;
    return '';
  });

  const activeBuilding =
    propBuilding ||
    buildings.find(b => b.id === selectedBuildingId) ||
    buildings[0];

  // Current active floor being viewed in the floor plan
  const [currentFloorId, setCurrentFloorId] = useState<string>(() => {
    if (initialFloorId) return initialFloorId;
    if (activeIndoorRoute && activeIndoorRoute.destFloorId) return activeIndoorRoute.destFloorId;
    return activeBuilding?.floors[0]?.id || '';
  });

  const [selectedRoomInViewer, setSelectedRoomInViewer] = useState<FloorRoom | null>(targetRoom);
  const [activeTab, setActiveTab] = useState<'plan' | 'steps'>('plan');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    if (initialFloorId) {
      setCurrentFloorId(initialFloorId);
    } else if (activeIndoorRoute && activeIndoorRoute.destFloorId) {
      setCurrentFloorId(activeIndoorRoute.destFloorId);
    }
    if (targetRoom) {
      setSelectedRoomInViewer(targetRoom);
    }
  }, [initialFloorId, activeIndoorRoute, targetRoom]);

  if (!isOpen || !activeBuilding) return null;

  const currentFloor =
    activeBuilding.floors.find(f => f.id === currentFloorId) || activeBuilding.floors[0];

  const handleOutdoor = onSwitchToOutdoorMap || onSwitchToOutdoor;

  return (
    <div
      className={`fixed z-50 transition-all duration-200 flex flex-col ${
        isFullScreen
          ? 'inset-0 bg-slate-950'
          : 'bottom-4 right-4 top-20 w-full max-w-xl md:max-w-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden'
      }`}
    >
      {/* Modal Top Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              {buildings.length > 1 ? (
                <select
                  value={activeBuilding.id}
                  onChange={e => {
                    const newBldgId = e.target.value;
                    setSelectedBuildingId(newBldgId);
                    const b = buildings.find(item => item.id === newBldgId);
                    if (b && b.floors.length > 0) {
                      setCurrentFloorId(b.floors[0].id);
                    }
                  }}
                  className="bg-slate-800 text-xs text-white border border-slate-700 rounded-lg px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <h3 className="text-sm font-black text-white tracking-wide">
                  {activeBuilding.name}
                </h3>
              )}
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Floor Plans
              </span>
            </div>
            {targetRoom && (
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Target: <span className="text-cyan-400 font-bold">Room {targetRoom.roomNumber}</span> • {targetRoom.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Wheelchair toggle */}
          <button
            onClick={() => onToggleWheelchair(!wheelchairOnly)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
              wheelchairOnly
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Step-Free Wheelchair Mode"
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{wheelchairOnly ? 'Step-Free' : 'Standard'}</span>
          </button>

          {/* Admin Editor Button */}
          {onOpenAdminEditor && (
            <button
              onClick={onOpenAdminEditor}
              className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 text-xs font-bold transition-colors flex items-center gap-1"
              title="Manage Building Floors & Rooms"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Switch to outdoor map */}
          {handleOutdoor && (
            <button
              onClick={handleOutdoor}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
              title="Switch to Outdoor Campus Map"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Outdoor</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Indoor View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs bar: Floor Plan View vs Step-by-Step Directions */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'plan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>
              Turn-by-Turn Steps {activeIndoorRoute ? `(${activeIndoorRoute.steps.length})` : ''}
            </span>
          </button>
        </div>

        {/* Total indoor distance & time if route exists */}
        {activeIndoorRoute && activeIndoorRoute.isVerified && (
          <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-2">
            <span>~{activeIndoorRoute.totalIndoorDistanceMeters}m indoor walk</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
              activeIndoorRoute.isFullyAccessible
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {activeIndoorRoute.isFullyAccessible ? '♿ Step-Free' : '⚠️ Has Stairs'}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'plan' ? (
          currentFloor ? (
            <FloorPlanViewer
              floor={currentFloor}
              allFloors={activeBuilding.floors}
              onSelectFloor={setCurrentFloorId}
              selectedRoom={selectedRoomInViewer}
              onSelectRoom={setSelectedRoomInViewer}
              activeIndoorRoute={activeIndoorRoute}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              No floor plan configured for this building.
            </div>
          )
        ) : (
          /* Step-by-Step Multi-Floor Instructions */
          <div className="p-4 h-full overflow-y-auto space-y-3">
            {activeIndoorRoute && !activeIndoorRoute.isVerified ? (
              <div className="p-4 bg-amber-950/80 border border-amber-700/80 rounded-2xl text-amber-200 text-xs space-y-2">
                <div className="font-black text-sm flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" /> Route needs verification
                </div>
                <p>
                  No verified indoor corridor path connects the building entrance to this room.
                </p>
                {activeIndoorRoute.warnings.map((w, idx) => (
                  <div key={idx} className="text-[11px] text-amber-300 font-medium">
                    • {w}
                  </div>
                ))}
              </div>
            ) : activeIndoorRoute && activeIndoorRoute.isVerified ? (
              <div className="space-y-3">
                {/* Floor Change Alert if multi-floor */}
                {activeIndoorRoute.floorChangeInstructions &&
                  activeIndoorRoute.floorChangeInstructions.map((fci, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-200 text-xs flex items-center gap-2 font-bold"
                    >
                      <span className="text-base">🛗</span>
                      <span>{fci}</span>
                    </div>
                  ))}

                {/* Steps List */}
                <div className="space-y-2">
                  {activeIndoorRoute.steps.map(step => (
                    <div
                      key={step.stepNumber}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        step.isFloorChange
                          ? 'bg-blue-950/70 border-blue-700/80 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          step.isFloorChange
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold leading-snug">{step.instruction}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                          <span>{step.floorName}</span>
                          {step.distanceMeters > 0 && <span>• {step.distanceMeters}m</span>}
                          {step.isAccessible && (
                            <span className="text-emerald-400 font-sans font-bold">♿ Step-Free</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Select a destination room to compute turn-by-turn indoor corridor directions.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
