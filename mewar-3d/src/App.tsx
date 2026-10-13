import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SatelliteMap } from './components/SatelliteMap';
import { OsmCampusMap } from './components/OsmCampusMap';
import { SatelliteHeader } from './components/SatelliteHeader';
import { SatelliteSearchBar } from './components/SatelliteSearchBar';
import { SatellitePlaceCard } from './components/SatellitePlaceCard';
import { SatelliteDirectionsDrawer } from './components/SatelliteDirectionsDrawer';
import { SatelliteLegend } from './components/SatelliteLegend';
import { AdminNetworkDrawer } from './components/AdminNetworkDrawer';
import { IndoorNavigationModal } from './components/IndoorNavigationModal';
import { KumbahHostelNavigator } from './components/KumbahHostelNavigator';
import { AdminIndoorEditor } from './components/AdminIndoorEditor';
import { AdminLocationModal } from './components/AdminLocationModal';
import { AdminSatelliteLocationModal } from './components/AdminSatelliteLocationModal';

// Satellite image dataset (Leaflet CRS.Simple)
import {
  type SatelliteLocation,
  type SatellitePathNode,
  type SatellitePathEdge,
  loadSatellitePathNetwork,
  saveSatellitePathNetwork,
  resetSatellitePathNetwork,
  loadSatelliteLocations,
  saveSatelliteLocations,
  resetSatelliteLocations,
  fetchBackendSatelliteLocations
} from './data/mewarSatelliteData';

import {
  calculateSatelliteRoute,
  type SatelliteRouteResult
} from './utils/satelliteDijkstra';

// OpenStreetMap & Indoor Data
import {
  type GeoLocation,
  loadCampusGeoLocations,
  saveCampusGeoLocations,
  resetCampusGeoLocations,
  fetchBackendCampusGeoLocations
} from './data/mewarGeoData';

import {
  calculatePedestrianRoute,
  type RoutingResult
} from './services/osmRoutingService';

import {
  type IndoorBuilding,
  type BuildingFloor,
  type FloorRoom
} from './types/indoor';

import {
  loadIndoorBuildings,
  saveIndoorBuildings,
  resetIndoorBuildings,
  fetchBackendIndoorData
} from './data/mewarIndoorData';

export const App: React.FC = () => {
  // Primary Map View Mode: defaults to 'satellite' (Uploaded Real Satellite Map)
  const [mapMode, setMapMode] = useState<'satellite' | 'osm'>('satellite');

  // =========================================================================
  // 1. SATELLITE MAP STATE (Primary Map: mewar-university-campus.png)
  // =========================================================================
  const [satLocations, setSatLocations] = useState<SatelliteLocation[]>(() => {
    return loadSatelliteLocations();
  });
  const [selectedSatLocation, setSelectedSatLocation] = useState<SatelliteLocation | null>(null);
  const [startSatLocation, setStartSatLocation] = useState<SatelliteLocation | null>(null);
  const [destSatLocation, setDestSatLocation] = useState<SatelliteLocation | null>(null);
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [satRouteResult, setSatRouteResult] = useState<SatelliteRouteResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync custom calibrated satellite locations from backend on mount
  useEffect(() => {
    fetchBackendSatelliteLocations().then(backendLocs => {
      if (backendLocs && backendLocs.length > 0) {
        setSatLocations(backendLocs);
      }
    });
  }, []);

  // Satellite Network Nodes & Edges (for walking graph and admin mode)
  const [network, setNetwork] = useState<{ nodes: SatellitePathNode[]; edges: SatellitePathEdge[] }>(() => {
    return loadSatellitePathNetwork();
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddNodeMode, setIsAddNodeMode] = useState<boolean>(false);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);

  // Calculate Satellite Dijkstra Route when origin, destination or wheelchair mode changes
  useEffect(() => {
    if (!startSatLocation || !destSatLocation) {
      setSatRouteResult(null);
      return;
    }

    const route = calculateSatelliteRoute(
      startSatLocation.entranceNodeId || startSatLocation.position,
      destSatLocation.entranceNodeId || destSatLocation.position,
      wheelchairOnly,
      network.nodes,
      network.edges
    );
    setSatRouteResult(route);
  }, [startSatLocation, destSatLocation, wheelchairOnly, network]);

  // Filter satellite locations by category chip
  const displayedSatLocations = useMemo(() => {
    if (!selectedCategory) return satLocations;
    return satLocations.filter(loc => loc.category === selectedCategory);
  }, [satLocations, selectedCategory]);

  // Satellite Selection & Direction Handlers
  const handleSelectSatLocation = useCallback((loc: SatelliteLocation) => {
    setSelectedSatLocation(loc);
  }, []);

  const handleOpenDirections = useCallback(() => {
    setIsDirectionsOpen(true);
    setSelectedSatLocation(null);
  }, []);

  const handleGetDirectionsTo = useCallback((loc: SatelliteLocation) => {
    setDestSatLocation(loc);
    setIsDirectionsOpen(true);
    setSelectedSatLocation(null);
  }, []);

  const handleSetAsStart = useCallback((loc: SatelliteLocation) => {
    setStartSatLocation(loc);
    setIsDirectionsOpen(true);
    setSelectedSatLocation(null);
  }, []);

  const handleSwapDirections = useCallback(() => {
    const tempStart = startSatLocation;
    setStartSatLocation(destSatLocation);
    setDestSatLocation(tempStart);
  }, [startSatLocation, destSatLocation]);

  const handleClearDirections = useCallback(() => {
    setStartSatLocation(null);
    setDestSatLocation(null);
    setSatRouteResult(null);
  }, []);

  // =========================================================================
  // 2. OSM SECONDARY MAP STATE
  // =========================================================================
  const [geoLocations, setGeoLocations] = useState<GeoLocation[]>(() => {
    return loadCampusGeoLocations();
  });
  const [selectedGeoLocation, setSelectedGeoLocation] = useState<GeoLocation | null>(null);
  const [startGeoLocation] = useState<GeoLocation | null>(null);
  const [destGeoLocation] = useState<GeoLocation | null>(null);
  const [osmRouteResult, setOsmRouteResult] = useState<RoutingResult | null>(null);

  // Sync OSM locations from backend on mount
  useEffect(() => {
    fetchBackendCampusGeoLocations().then(backendLocs => {
      if (backendLocs && backendLocs.length > 0) {
        setGeoLocations(backendLocs);
      }
    });
  }, []);

  // OSM Route calculation
  useEffect(() => {
    if (mapMode !== 'osm' || !startGeoLocation || !destGeoLocation) {
      setOsmRouteResult(null);
      return;
    }

    calculatePedestrianRoute({
      start: startGeoLocation,
      dest: destGeoLocation,
      wheelchairOnly
    }).then(res => setOsmRouteResult(res)).catch(() => {});
  }, [mapMode, startGeoLocation, destGeoLocation, wheelchairOnly]);

  // =========================================================================
  // 3. INDOOR BUILDING & FLOOR PLAN STATE
  // =========================================================================
  const [indoorBuildings, setIndoorBuildings] = useState<IndoorBuilding[]>(() => {
    return loadIndoorBuildings();
  });
  const [isIndoorModalOpen, setIsIndoorModalOpen] = useState<boolean>(false);
  const [isAdminIndoorOpen, setIsAdminIndoorOpen] = useState<boolean>(false);
  const [activeIndoorBuildingId, setActiveIndoorBuildingId] = useState<string | null>('kumba_hostel');
  const [activeIndoorFloorId, setActiveIndoorFloorId] = useState<string | null>(null);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<{
    building: IndoorBuilding;
    floor: BuildingFloor;
    room: FloorRoom;
  } | null>(null);

  useEffect(() => {
    fetchBackendIndoorData().then(data => {
      if (data && data.length > 0) {
        setIndoorBuildings(data);
      }
    });
  }, []);

  const handleOpenIndoorNavigator = useCallback((buildingId: string = 'kumba_hostel') => {
    setActiveIndoorBuildingId(buildingId);
    setIsIndoorModalOpen(true);
  }, []);

  const handleSelectRoomHierarchy = useCallback((
    building: IndoorBuilding,
    floor: BuildingFloor,
    room: FloorRoom
  ) => {
    setSelectedRoomInfo({ building, floor, room });
    setActiveIndoorBuildingId(building.id);
    setActiveIndoorFloorId(floor.id);
    setIsIndoorModalOpen(true);
  }, []);

  // =========================================================================
  // 4. COMMON UI / ADMIN / TOAST STATE
  // =========================================================================
  const [isDirectionsOpen, setIsDirectionsOpen] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminLocationModalOpen, setIsAdminLocationModalOpen] = useState<boolean>(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* 1. Main Navigation Header */}
      <SatelliteHeader
        onOpenDirections={handleOpenDirections}
        isDirectionsOpen={isDirectionsOpen}
        onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        isLegendOpen={isLegendOpen}
        wheelchairOnly={wheelchairOnly}
        onToggleWheelchair={setWheelchairOnly}
        totalLocationsCount={satLocations.length}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => {
          setIsAdminMode(!isAdminMode);
          showAdminToast(!isAdminMode ? 'Admin Mode: Enabled' : 'Admin Mode: Disabled');
        }}
        onOpenIndoorNavigator={() => handleOpenIndoorNavigator('kumbah_hostel')}
        onOpenIndoorAdmin={() => setIsAdminIndoorOpen(true)}
        onOpenAdminLocationModal={() => setIsAdminLocationModalOpen(true)}
        mapMode={mapMode}
        onToggleMapMode={setMapMode}
      />

      {/* 2. Main Map Screen (Primary: Uploaded Satellite Image Map with L.CRS.Simple) */}
      <div className="absolute inset-0 pt-16">
        {mapMode === 'satellite' ? (
          <SatelliteMap
            locations={displayedSatLocations}
            selectedLocation={selectedSatLocation}
            onSelectLocation={handleSelectSatLocation}
            activeRoute={satRouteResult}
            startLocation={startSatLocation}
            destLocation={destSatLocation}
            onSetAsStart={handleSetAsStart}
            onSetAsDest={handleGetDirectionsTo}
            onExploreIndoor={handleOpenIndoorNavigator}
            isAdminMode={isAdminMode}
            onUpdateLocationPosition={(locId, newPos) => {
              setSatLocations(prev => {
                const next = prev.map(l => l.id === locId ? { ...l, position: newPos } : l);
                saveSatelliteLocations(next);
                return next;
              });
              showAdminToast(`Calibrated position: [${newPos[0]}, ${newPos[1]}]`);
            }}
            networkNodes={network.nodes}
            networkEdges={network.edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={(id, newPos) => {
              setNetwork(prev => {
                const nextNodes = prev.nodes.map(n => n.id === id ? { ...n, position: newPos } : n);
                saveSatellitePathNetwork(nextNodes, prev.edges);
                return { ...prev, nodes: nextNodes };
              });
              showAdminToast('Updated pathway node position');
            }}
            isAddNodeMode={isAddNodeMode}
            onAddNodeAtPosition={pos => {
              const newNode: SatellitePathNode = {
                id: `node_${Date.now()}`,
                name: `Point ${network.nodes.length + 1}`,
                position: pos
              };
              setNetwork(prev => {
                const nextNodes = [...prev.nodes, newNode];
                saveSatellitePathNetwork(nextNodes, prev.edges);
                return { ...prev, nodes: nextNodes };
              });
              showAdminToast('Added new walking network node');
            }}
            isConnectMode={isConnectMode}
            onConnectToNode={targetId => {
              if (!selectedNodeId || selectedNodeId === targetId) return;
              const newEdge: SatellitePathEdge = {
                id: `edge_${selectedNodeId}_${targetId}`,
                source: selectedNodeId,
                target: targetId,
                distanceMeters: 20,
                isAccessible: !wheelchairOnly,
                description: 'Campus Path'
              };
              setNetwork(prev => {
                const nextEdges = [...prev.edges, newEdge];
                saveSatellitePathNetwork(prev.nodes, nextEdges);
                return { ...prev, edges: nextEdges };
              });
              setIsConnectMode(false);
              showAdminToast('Connected walking road segment');
            }}
          />
        ) : (
          <OsmCampusMap
            locations={geoLocations}
            selectedLocation={selectedGeoLocation}
            onSelectLocation={setSelectedGeoLocation}
            startLocation={startGeoLocation}
            destLocation={destGeoLocation}
            wheelchairOnly={wheelchairOnly}
            isAdminMode={isAdminMode}
            onUpdateLocationPosition={(locId, lat, lng) => {
              setGeoLocations(prev => {
                const next = prev.map(l => l.id === locId ? { ...l, lat, lng } : l);
                saveCampusGeoLocations(next);
                return next;
              });
            }}
            onOpenLocationAdminModal={() => setIsAdminLocationModalOpen(true)}
            activeRoute={osmRouteResult}
            routeNotice={osmRouteResult?.notice}
          />
        )}
      </div>

      {/* 3. Search Location Panel (Top Left) */}
      {!isAdminMode && (
        <SatelliteSearchBar
          locations={satLocations}
          indoorBuildings={indoorBuildings}
          onSelectLocation={handleSelectSatLocation}
          onOpenDirections={handleOpenDirections}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectRoomHierarchy={handleSelectRoomHierarchy}
        />
      )}

      {/* 4. Campus Landmark Place Card (Satellite or OpenStreetMap view) */}
      {!isAdminMode && (selectedSatLocation || selectedGeoLocation) && (() => {
        const placeLocation: SatelliteLocation = selectedSatLocation || (
          satLocations.find(l => l.id === selectedGeoLocation!.id) || {
            id: selectedGeoLocation!.id,
            name: selectedGeoLocation!.name,
            code: selectedGeoLocation!.code,
            category: (selectedGeoLocation!.category === 'Library' ? 'Academic' : selectedGeoLocation!.category) as SatelliteLocation['category'],
            description: selectedGeoLocation!.description || '',
            position: [0, 0] as [number, number],
            color: selectedGeoLocation!.color,
            iconType: (selectedGeoLocation!.iconType === 'book' ? 'building' : selectedGeoLocation!.iconType) as SatelliteLocation['iconType'],
            wheelchairAccessible: selectedGeoLocation!.wheelchairAccessible,
            rampAvailable: selectedGeoLocation!.rampAvailable,
            elevatorAvailable: selectedGeoLocation!.elevatorAvailable,
            brailleSignage: selectedGeoLocation!.brailleSignage,
            facilities: selectedGeoLocation!.facilities,
            entranceNodeId: selectedGeoLocation!.entranceNodeId,
          }
        );
        return (
          <SatellitePlaceCard
            location={placeLocation}
            onClose={() => {
              setSelectedSatLocation(null);
              setSelectedGeoLocation(null);
            }}
            onGetDirectionsTo={loc => {
              const satLoc = satLocations.find(l => l.id === loc.id) || loc;
              handleGetDirectionsTo(satLoc);
            }}
            onSetAsStart={loc => {
              const satLoc = satLocations.find(l => l.id === loc.id) || loc;
              handleSetAsStart(satLoc);
            }}
            onExploreIndoor={loc => handleOpenIndoorNavigator(loc.id === 'kumba_hostel' ? 'kumbah_hostel' : loc.id)}
          />
        );
      })()}

      {/* 5. Outdoor Walking Directions Drawer */}
      {isDirectionsOpen && (
        <SatelliteDirectionsDrawer
          locations={satLocations}
          startLocation={startSatLocation}
          destLocation={destSatLocation}
          onSelectStart={setStartSatLocation}
          onSelectDest={setDestSatLocation}
          onSwap={handleSwapDirections}
          onClose={() => setIsDirectionsOpen(false)}
          onClear={handleClearDirections}
          wheelchairOnly={wheelchairOnly}
          onToggleWheelchair={setWheelchairOnly}
          activeRoute={satRouteResult}
          selectedRoomInfo={selectedRoomInfo}
          onOpenIndoorModal={() => handleOpenIndoorNavigator('kumbah_hostel')}
        />
      )}

      {/* 6. Campus Landmark Legend */}
      {isLegendOpen && !isAdminMode && (
        <SatelliteLegend
          locations={satLocations}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      )}

      {/* 7. Admin Network Drawer (When Admin Mode is active in Satellite view) */}
      {isAdminMode && mapMode === 'satellite' && (
        <AdminNetworkDrawer
          isOpen={isAdminMode}
          onClose={() => setIsAdminMode(false)}
          nodes={network.nodes}
          edges={network.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNode={updated => {
            setNetwork(prev => {
              const nextNodes = prev.nodes.map(n => n.id === updated.id ? updated : n);
              saveSatellitePathNetwork(nextNodes, prev.edges);
              return { ...prev, nodes: nextNodes };
            });
            showAdminToast('Updated pathway node');
          }}
          onDeleteNode={nodeId => {
            setNetwork(prev => {
              const nextNodes = prev.nodes.filter(n => n.id !== nodeId);
              const nextEdges = prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
              saveSatellitePathNetwork(nextNodes, nextEdges);
              return { nodes: nextNodes, edges: nextEdges };
            });
            if (selectedNodeId === nodeId) setSelectedNodeId(null);
            showAdminToast('Deleted node and connected edges');
          }}
          onAddEdge={edge => {
            setNetwork(prev => {
              const nextEdges = [...prev.edges, edge];
              saveSatellitePathNetwork(prev.nodes, nextEdges);
              return { ...prev, edges: nextEdges };
            });
            showAdminToast('Added walkway edge');
          }}
          onDeleteEdge={edgeId => {
            setNetwork(prev => {
              const nextEdges = prev.edges.filter(e => e.id !== edgeId);
              saveSatellitePathNetwork(prev.nodes, nextEdges);
              return { ...prev, edges: nextEdges };
            });
            showAdminToast('Deleted walkway edge');
          }}
          onToggleEdgeAccessibility={edgeId => {
            setNetwork(prev => {
              const nextEdges = prev.edges.map(e => e.id === edgeId ? { ...e, isAccessible: !e.isAccessible } : e);
              saveSatellitePathNetwork(prev.nodes, nextEdges);
              return { ...prev, edges: nextEdges };
            });
            showAdminToast('Toggled walkway accessibility');
          }}
          onResetNetwork={() => {
            if (confirm('Reset satellite road network to verified default graph?')) {
              const reset = resetSatellitePathNetwork();
              setNetwork(reset);
              showAdminToast('Reset walking network to default');
            }
          }}
          onSaveNetwork={() => {
            saveSatellitePathNetwork(network.nodes, network.edges);
            showAdminToast('Saved road network to browser storage');
          }}
          isAddNodeMode={isAddNodeMode}
          onToggleAddNodeMode={setIsAddNodeMode}
          isConnectMode={isConnectMode}
          onToggleConnectMode={setIsConnectMode}
          onImportNetwork={(importedNodes, importedEdges) => {
            setNetwork({ nodes: importedNodes, edges: importedEdges });
            saveSatellitePathNetwork(importedNodes, importedEdges);
            showAdminToast(`Imported ${importedNodes.length} nodes and ${importedEdges.length} edges`);
          }}
        />
      )}

      {/* 8. Kumbah Hostel Indoor Navigator or Generic Modal */}
      {isIndoorModalOpen && (activeIndoorBuildingId === 'kumba_hostel' || activeIndoorBuildingId === 'kumbah_hostel') && (
        <KumbahHostelNavigator
          isOpen={isIndoorModalOpen}
          onClose={() => setIsIndoorModalOpen(false)}
          building={
            indoorBuildings.find(b => b.id === 'kumba_hostel' || b.id === 'kumbah_hostel') ||
            indoorBuildings[0]
          }
          initialRoomId={selectedRoomInfo?.room?.id}
          initialFloorId={activeIndoorFloorId || undefined}
          wheelchairOnly={wheelchairOnly}
          onToggleWheelchair={setWheelchairOnly}
          onOpenAdminEditor={() => setIsAdminIndoorOpen(true)}
          onSwitchToCampusMap={() => setIsIndoorModalOpen(false)}
        />
      )}

      {isIndoorModalOpen && activeIndoorBuildingId !== 'kumba_hostel' && activeIndoorBuildingId !== 'kumbah_hostel' && (
        <IndoorNavigationModal
          isOpen={isIndoorModalOpen}
          onClose={() => setIsIndoorModalOpen(false)}
          buildings={indoorBuildings}
          initialBuildingId={activeIndoorBuildingId || 'kumba_hostel'}
          initialFloorId={activeIndoorFloorId || undefined}
          targetRoom={selectedRoomInfo?.room || null}
          activeIndoorRoute={null}
          wheelchairOnly={wheelchairOnly}
          onToggleWheelchair={setWheelchairOnly}
          onOpenAdminEditor={() => setIsAdminIndoorOpen(true)}
        />
      )}

      {/* 9. Admin Indoor Floor Plan Editor */}
      {isAdminIndoorOpen && (
        <AdminIndoorEditor
          isOpen={isAdminIndoorOpen}
          onClose={() => setIsAdminIndoorOpen(false)}
          buildings={indoorBuildings}
          onSaveBuildings={updated => {
            setIndoorBuildings(updated);
            saveIndoorBuildings(updated);
            showAdminToast('Saved indoor floor plans');
          }}
          onResetBuildings={() => {
            if (confirm('Reset indoor buildings to default?')) {
              resetIndoorBuildings().then(reset => {
                setIndoorBuildings(reset);
                showAdminToast('Reset indoor floor plans');
              });
            }
          }}
        />
      )}

      {/* 10. Admin Location Editor Modals */}
      {isAdminLocationModalOpen && mapMode === 'satellite' && (
        <AdminSatelliteLocationModal
          isOpen={isAdminLocationModalOpen}
          onClose={() => setIsAdminLocationModalOpen(false)}
          locations={satLocations}
          selectedLocation={selectedSatLocation}
          onSaveLocation={loc => {
            setSatLocations(prev => {
              const exists = prev.some(l => l.id === loc.id);
              const next = exists ? prev.map(l => l.id === loc.id ? loc : l) : [...prev, loc];
              saveSatelliteLocations(next);
              return next;
            });
            showAdminToast(`Saved landmark marker: ${loc.name}`);
          }}
          onDeleteLocation={id => {
            setSatLocations(prev => {
              const next = prev.filter(l => l.id !== id);
              saveSatelliteLocations(next);
              return next;
            });
            showAdminToast('Deleted landmark marker');
          }}
          onResetAll={() => {
            if (confirm('Reset satellite landmark markers to verified defaults?')) {
              const reset = resetSatelliteLocations();
              setSatLocations(reset);
              showAdminToast('Reset landmark markers to defaults');
            }
          }}
          onImportJson={imported => {
            setSatLocations(imported);
            saveSatelliteLocations(imported);
            showAdminToast(`Imported ${imported.length} satellite markers`);
          }}
        />
      )}

      {isAdminLocationModalOpen && mapMode === 'osm' && (
        <AdminLocationModal
          isOpen={isAdminLocationModalOpen}
          onClose={() => setIsAdminLocationModalOpen(false)}
          locations={geoLocations}
          selectedLocation={selectedGeoLocation}
          onSaveLocation={loc => {
            setGeoLocations(prev => {
              const exists = prev.some(l => l.id === loc.id);
              const next = exists ? prev.map(l => l.id === loc.id ? loc : l) : [...prev, loc];
              saveCampusGeoLocations(next);
              return next;
            });
            showAdminToast('Saved campus marker');
          }}
          onDeleteLocation={id => {
            setGeoLocations(prev => {
              const next = prev.filter(l => l.id !== id);
              saveCampusGeoLocations(next);
              return next;
            });
            showAdminToast('Deleted campus marker');
          }}
          onResetAll={() => {
            if (confirm('Reset OSM markers to verified defaults?')) {
              const reset = resetCampusGeoLocations();
              setGeoLocations(reset);
              showAdminToast('Reset markers');
            }
          }}
          onImportJson={imported => {
            setGeoLocations(imported);
            saveCampusGeoLocations(imported);
            showAdminToast(`Imported ${imported.length} markers`);
          }}
        />
      )}

      {/* 11. Admin Toast Notification */}
      {adminToast && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-200">
          {adminToast}
        </div>
      )}

    </div>
  );
};

export default App;
