import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SatelliteMap } from './components/SatelliteMap';
import { SatelliteHeader } from './components/SatelliteHeader';
import { SatelliteSearchBar } from './components/SatelliteSearchBar';
import { SatellitePlaceCard } from './components/SatellitePlaceCard';
import { SatelliteDirectionsDrawer } from './components/SatelliteDirectionsDrawer';
import { SatelliteLegend } from './components/SatelliteLegend';
import { AdminNetworkDrawer } from './components/AdminNetworkDrawer';
import { IndoorNavigationModal } from './components/IndoorNavigationModal';
import { AdminIndoorEditor } from './components/AdminIndoorEditor';
import {
  SATELLITE_CAMPUS_LOCATIONS,
  type SatelliteLocation,
  type SatellitePathNode,
  type SatellitePathEdge,
  loadSatellitePathNetwork,
  saveSatellitePathNetwork,
  resetSatellitePathNetwork
} from './data/mewarSatelliteData';
import { calculateSatelliteRoute, type SatelliteRouteResult } from './utils/satelliteDijkstra';
import {
  type IndoorBuilding,
  type BuildingFloor,
  type FloorRoom,
  type IndoorRouteResult
} from './types/indoor';
import {
  loadIndoorBuildings,
  saveIndoorBuildings,
  resetIndoorBuildings,
  fetchBackendIndoorData
} from './data/mewarIndoorData';
import { calculateIndoorRoute } from './utils/indoorRouting';

export const App: React.FC = () => {
  const [locations] = useState<SatelliteLocation[]>(SATELLITE_CAMPUS_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<SatelliteLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Directions state
  const [isDirectionsOpen, setIsDirectionsOpen] = useState<boolean>(false);
  const [startLocation, setStartLocation] = useState<SatelliteLocation | null>(null);
  const [destLocation, setDestLocation] = useState<SatelliteLocation | null>(null);
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<SatelliteRouteResult | null>(null);

  // Indoor Building, Floor & Room State
  const [indoorBuildings, setIndoorBuildings] = useState<IndoorBuilding[]>(() => {
    return loadIndoorBuildings();
  });
  const [isIndoorModalOpen, setIsIndoorModalOpen] = useState<boolean>(false);
  const [isAdminIndoorOpen, setIsAdminIndoorOpen] = useState<boolean>(false);
  const [activeIndoorBuildingId, setActiveIndoorBuildingId] = useState<string | null>('engineering_block');
  const [activeIndoorFloorId, setActiveIndoorFloorId] = useState<string | null>(null);
  const [activeIndoorRoute, setActiveIndoorRoute] = useState<IndoorRouteResult | null>(null);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<{
    building: IndoorBuilding;
    floor: BuildingFloor;
    room: FloorRoom;
  } | null>(null);

  // Fetch latest indoor data from backend on mount
  useEffect(() => {
    fetchBackendIndoorData().then(data => {
      if (data && data.length > 0) {
        setIndoorBuildings(data);
      }
    });
  }, []);

  // Legend visibility state
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Road Network Graph State (Loaded from storage or verified defaults)
  const [networkNodes, setNetworkNodes] = useState<SatellitePathNode[]>(() => {
    return loadSatellitePathNetwork().nodes;
  });
  const [networkEdges, setNetworkEdges] = useState<SatellitePathEdge[]>(() => {
    return loadSatellitePathNetwork().edges;
  });

  // Admin Network Editor state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [selectedAdminNodeId, setSelectedAdminNodeId] = useState<string | null>(null);
  const [isAddNodeMode, setIsAddNodeMode] = useState<boolean>(false);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Filter locations by category
  const displayedLocations = useMemo(() => {
    if (!selectedCategory) return locations;
    return locations.filter(loc => loc.category === selectedCategory);
  }, [locations, selectedCategory]);

  // Recalculate route whenever start, destination, wheelchair mode, or network graph changes
  useEffect(() => {
    if (startLocation && destLocation) {
      const result = calculateSatelliteRoute(
        startLocation.entranceNodeId || startLocation.position,
        destLocation.entranceNodeId || destLocation.position,
        wheelchairOnly,
        networkNodes,
        networkEdges
      );
      setActiveRoute(result);
    } else {
      setActiveRoute(null);
    }
  }, [startLocation, destLocation, wheelchairOnly, networkNodes, networkEdges]);

  const handleSelectLocation = useCallback((loc: SatelliteLocation) => {
    setSelectedLocation(loc);
  }, []);

  const handleOpenDirections = useCallback(() => {
    setIsDirectionsOpen(true);
    setSelectedLocation(null);
  }, []);

  const handleGetDirectionsTo = useCallback((loc: SatelliteLocation) => {
    setDestLocation(loc);
    setIsDirectionsOpen(true);
    setSelectedLocation(null);
  }, []);

  const handleSetAsStart = useCallback((loc: SatelliteLocation) => {
    setStartLocation(loc);
    setIsDirectionsOpen(true);
    setSelectedLocation(null);
  }, []);

  const handleSwapDirections = useCallback(() => {
    setStartLocation(prevStart => {
      const temp = prevStart;
      setDestLocation(temp);
      return destLocation;
    });
  }, [destLocation]);

  const handleClearDirections = useCallback(() => {
    setStartLocation(null);
    setDestLocation(null);
    setActiveRoute(null);
    setSelectedRoomInfo(null);
    setActiveIndoorRoute(null);
  }, []);

  // Indoor Room Selection and Route Calculation Handler (Requirement 4)
  const handleSelectRoomHierarchy = useCallback((
    building: IndoorBuilding,
    floor: BuildingFloor,
    room: FloorRoom
  ) => {
    setSelectedRoomInfo({ building, floor, room });
    setActiveIndoorBuildingId(building.id);
    setActiveIndoorFloorId(floor.id);

    // 1. Show building on outdoor campus map
    const matchedOutdoorLoc = locations.find(
      l => l.id === building.outdoorBuildingId || l.id === building.id
    ) || locations.find(l => l.name.toLowerCase().includes(building.name.toLowerCase().slice(0, 5))) || null;

    if (matchedOutdoorLoc) {
      setDestLocation(matchedOutdoorLoc);
      setSelectedLocation(matchedOutdoorLoc);
      // If start point not yet selected, default to Sanga Hostel or Main Gate
      if (!startLocation) {
        const defaultStart = locations.find(l => l.id === 'sanga_hostel') || locations[0];
        if (defaultStart && defaultStart.id !== matchedOutdoorLoc.id) {
          setStartLocation(defaultStart);
        }
      }
    }

    // 4 & 5: Calculate indoor route from entrance to room door
    if (room.id) {
      const indoorRoute = calculateIndoorRoute(
        building,
        room.id,
        wheelchairOnly
      );
      setActiveIndoorRoute(indoorRoute);
    } else {
      setActiveIndoorRoute(null);
    }

    // 3. Open building floor plan modal
    setIsIndoorModalOpen(true);
    showAdminToast(`Selected ${building.name} → ${floor.floorName} → Room ${room.roomNumber}`);
  }, [locations, startLocation, wheelchairOnly]);

  const handleExploreIndoorForLocation = useCallback((loc: SatelliteLocation) => {
    const indoorBldg = indoorBuildings.find(
      b => b.outdoorBuildingId === loc.id || b.id === loc.id
    ) || indoorBuildings[0];

    if (indoorBldg) {
      setActiveIndoorBuildingId(indoorBldg.id);
      setActiveIndoorFloorId(indoorBldg.floors[0]?.id || null);
      setActiveIndoorRoute(null);
      setSelectedRoomInfo(null);
      setIsIndoorModalOpen(true);
    }
  }, [indoorBuildings]);

  const handleOpenIndoorNavigator = useCallback(() => {
    const defaultBldg = indoorBuildings[0];
    if (defaultBldg) {
      setActiveIndoorBuildingId(defaultBldg.id);
      setActiveIndoorFloorId(defaultBldg.floors[0]?.id || null);
    }
    setIsIndoorModalOpen(true);
  }, [indoorBuildings]);

  const handleSaveIndoorBuildings = useCallback((updated: IndoorBuilding[]) => {
    setIndoorBuildings(updated);
    saveIndoorBuildings(updated);
    showAdminToast('Indoor floors & rooms saved to backend database & storage!');
  }, []);

  const handleResetIndoorBuildings = useCallback(async () => {
    const def = await resetIndoorBuildings();
    setIndoorBuildings(def);
    showAdminToast('Reset indoor data to verified campus blueprints.');
  }, []);

  // Admin Node & Edge Handlers
  const handleUpdateNode = useCallback((updated: SatellitePathNode) => {
    setNetworkNodes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
    showAdminToast(`Updated node "${updated.name}"`);
  }, []);

  const handleUpdateNodePosition = useCallback((nodeId: string, newPos: [number, number]) => {
    setNetworkNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, position: newPos } : n))
    );
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNetworkNodes(prev => prev.filter(n => n.id !== nodeId));
    setNetworkEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedAdminNodeId(null);
    showAdminToast(`Deleted node ${nodeId}`);
  }, []);

  const handleAddNodeAtPosition = useCallback((pos: [number, number]) => {
    const newId = `node_junc_custom_${Date.now().toString().slice(-4)}`;
    const newNode: SatellitePathNode = {
      id: newId,
      name: `Road Waypoint ${newId.slice(-4)}`,
      position: pos
    };
    setNetworkNodes(prev => [...prev, newNode]);
    setSelectedAdminNodeId(newId);
    setIsAddNodeMode(false);
    showAdminToast(`Added new road node at [${pos[0]}, ${pos[1]}]`);
  }, []);

  const handleAddEdge = useCallback((edge: SatellitePathEdge) => {
    setNetworkEdges(prev => [...prev, edge]);
    showAdminToast(`Connected ${edge.source} to ${edge.target} (${edge.distanceMeters}m)`);
  }, []);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setNetworkEdges(prev => prev.filter(e => e.id !== edgeId));
    showAdminToast(`Deleted path edge`);
  }, []);

  const handleToggleEdgeAccessibility = useCallback((edgeId: string) => {
    setNetworkEdges(prev =>
      prev.map(e => (e.id === edgeId ? { ...e, isAccessible: !e.isAccessible } : e))
    );
  }, []);

  const handleSaveNetwork = useCallback(() => {
    saveSatellitePathNetwork(networkNodes, networkEdges);
    showAdminToast('Network successfully saved to local storage!');
  }, [networkNodes, networkEdges]);

  const handleResetNetwork = useCallback(() => {
    const defaults = resetSatellitePathNetwork();
    setNetworkNodes(defaults.nodes);
    setNetworkEdges(defaults.edges);
    setSelectedAdminNodeId(null);
    showAdminToast('Reset to default verified campus road network!');
  }, []);

  const handleImportNetwork = useCallback((nodes: SatellitePathNode[], edges: SatellitePathEdge[]) => {
    setNetworkNodes(nodes);
    setNetworkEdges(edges);
    saveSatellitePathNetwork(nodes, edges);
    setSelectedAdminNodeId(null);
    showAdminToast('Imported and saved new road network!');
  }, []);

  const handleConnectToNode = useCallback((targetNodeId: string) => {
    if (!selectedAdminNodeId || selectedAdminNodeId === targetNodeId) return;
    const srcNode = networkNodes.find(n => n.id === selectedAdminNodeId);
    const tgtNode = networkNodes.find(n => n.id === targetNodeId);
    if (!srcNode || !tgtNode) return;

    // Check if edge already exists
    const exists = networkEdges.some(
      e =>
        (e.source === selectedAdminNodeId && e.target === targetNodeId) ||
        (e.source === targetNodeId && e.target === selectedAdminNodeId)
    );
    if (exists) {
      showAdminToast('Edge already exists between these nodes');
      return;
    }

    const dx = srcNode.position[1] - tgtNode.position[1];
    const dy = srcNode.position[0] - tgtNode.position[0];
    const distMeters = Math.max(5, Math.round(Math.sqrt(dx * dx + dy * dy) * 0.45));

    const newEdge: SatellitePathEdge = {
      id: `e_${selectedAdminNodeId}_${targetNodeId}_${Date.now().toString().slice(-4)}`,
      source: selectedAdminNodeId,
      target: targetNodeId,
      distanceMeters: distMeters,
      isAccessible: true,
      description: `Walkway connecting ${srcNode.name} and ${tgtNode.name}`
    };

    setNetworkEdges(prev => [...prev, newEdge]);
    setIsConnectMode(false);
    showAdminToast(`Connected ${srcNode.name} to ${tgtNode.name}`);
  }, [selectedAdminNodeId, networkNodes, networkEdges]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* 1. Dark Navy-Blue Header */}
      <SatelliteHeader
        onOpenDirections={handleOpenDirections}
        isDirectionsOpen={isDirectionsOpen}
        onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        isLegendOpen={isLegendOpen}
        wheelchairOnly={wheelchairOnly}
        onToggleWheelchair={setWheelchairOnly}
        totalLocationsCount={locations.length}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => {
          setIsAdminMode(!isAdminMode);
          if (isAdminMode) {
            setSelectedAdminNodeId(null);
            setIsAddNodeMode(false);
            setIsConnectMode(false);
          }
        }}
        onOpenIndoorNavigator={handleOpenIndoorNavigator}
        onOpenIndoorAdmin={() => setIsAdminIndoorOpen(true)}
      />

      {/* 2. Interactive Leaflet Satellite Map Layer */}
      <div className="absolute inset-0 pt-16">
        <SatelliteMap
          locations={displayedLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          activeRoute={activeRoute}
          startLocation={startLocation}
          destLocation={destLocation}
          isAdminMode={isAdminMode}
          networkNodes={networkNodes}
          networkEdges={networkEdges}
          selectedNodeId={selectedAdminNodeId}
          onSelectNode={setSelectedAdminNodeId}
          onUpdateNodePosition={handleUpdateNodePosition}
          isAddNodeMode={isAddNodeMode}
          onAddNodeAtPosition={handleAddNodeAtPosition}
          isConnectMode={isConnectMode}
          onConnectToNode={handleConnectToNode}
          onSelectEdge={edge => {
            if (isAdminMode) {
              setSelectedAdminNodeId(edge.source);
            }
          }}
        />
      </div>

      {/* 3. Search Bar & Category Chips (Shown when Directions & Admin are NOT active) */}
      {!isDirectionsOpen && !isAdminMode && (
        <SatelliteSearchBar
          locations={locations}
          indoorBuildings={indoorBuildings}
          onSelectLocation={handleSelectLocation}
          onOpenDirections={handleOpenDirections}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectRoomHierarchy={handleSelectRoomHierarchy}
          onOpenIndoorExplorer={handleOpenIndoorNavigator}
        />
      )}

      {/* 4. Google Maps Place Information Card (Shown when a place is selected and Directions is inactive) */}
      {!isDirectionsOpen && !isAdminMode && (
        <SatellitePlaceCard
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onGetDirectionsTo={handleGetDirectionsTo}
          onSetAsStart={handleSetAsStart}
          onExploreIndoor={handleExploreIndoorForLocation}
        />
      )}

      {/* 5. Google Maps Directions Drawer (Shown when Directions mode is active) */}
      {isDirectionsOpen && (
        <SatelliteDirectionsDrawer
          locations={locations}
          startLocation={startLocation}
          destLocation={destLocation}
          onSelectStart={setStartLocation}
          onSelectDest={setDestLocation}
          onSwap={handleSwapDirections}
          onClose={() => setIsDirectionsOpen(false)}
          onClear={handleClearDirections}
          wheelchairOnly={wheelchairOnly}
          onToggleWheelchair={setWheelchairOnly}
          activeRoute={activeRoute}
          selectedRoomInfo={selectedRoomInfo}
          onOpenIndoorModal={() => setIsIndoorModalOpen(true)}
        />
      )}

      {/* 6. Admin Road Network Drawer (Shown when Admin Mode is active) */}
      {isAdminMode && (
        <AdminNetworkDrawer
          isOpen={isAdminMode}
          onClose={() => setIsAdminMode(false)}
          nodes={networkNodes}
          edges={networkEdges}
          selectedNodeId={selectedAdminNodeId}
          onSelectNode={setSelectedAdminNodeId}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onAddEdge={handleAddEdge}
          onDeleteEdge={handleDeleteEdge}
          onToggleEdgeAccessibility={handleToggleEdgeAccessibility}
          onResetNetwork={handleResetNetwork}
          onSaveNetwork={handleSaveNetwork}
          isAddNodeMode={isAddNodeMode}
          onToggleAddNodeMode={setIsAddNodeMode}
          isConnectMode={isConnectMode}
          onToggleConnectMode={setIsConnectMode}
          onImportNetwork={handleImportNetwork}
        />
      )}

      {/* 7. Location Legend (Upper-Right, hidden when Admin Drawer is open to avoid overlap) */}
      {!isAdminMode && (
        <SatelliteLegend
          locations={locations}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      )}

      {/* 8. Admin Notification Toast */}
      {adminToast && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <span>⚙️</span>
          <span>{adminToast}</span>
        </div>
      )}

      {/* 9. Indoor Floor Plan Navigation Modal (Requirements 1, 2, 3, 4, 5) */}
      {isIndoorModalOpen && (
        <IndoorNavigationModal
          isOpen={isIndoorModalOpen}
          onClose={() => setIsIndoorModalOpen(false)}
          buildings={indoorBuildings}
          initialBuildingId={activeIndoorBuildingId || undefined}
          initialFloorId={activeIndoorFloorId || undefined}
          activeIndoorRoute={activeIndoorRoute}
          targetRoom={selectedRoomInfo ? selectedRoomInfo.room : null}
          wheelchairOnly={wheelchairOnly}
          onToggleWheelchair={setWheelchairOnly}
          onSwitchToOutdoorMap={() => {
            setIsIndoorModalOpen(false);
            setIsDirectionsOpen(true);
          }}
          onOpenAdminEditor={() => {
            setIsIndoorModalOpen(false);
            setIsAdminIndoorOpen(true);
          }}
        />
      )}

      {/* 10. Admin Indoor Editor for Buildings, Floors, Rooms, and Corridors (Requirement 6) */}
      {isAdminIndoorOpen && (
        <AdminIndoorEditor
          isOpen={isAdminIndoorOpen}
          onClose={() => setIsAdminIndoorOpen(false)}
          buildings={indoorBuildings}
          onSaveBuildings={handleSaveIndoorBuildings}
          onResetBuildings={handleResetIndoorBuildings}
          onExportJson={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ buildings: indoorBuildings }, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', 'mewar_indoor_data.json');
            dl.click();
          }}
        />
      )}

    </div>
  );
};

export default App;
