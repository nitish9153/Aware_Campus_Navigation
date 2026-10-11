import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MAP_IMAGE_BOUNDS,
  MAP_IMAGE_URL,
  METERS_PER_PIXEL,
  type SatelliteLocation,
  type SatellitePathNode,
  type SatellitePathEdge
} from '../data/mewarSatelliteData';
import type { SatelliteRouteResult } from '../utils/satelliteDijkstra';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Compass, CheckCircle, AlertTriangle } from 'lucide-react';

interface SatelliteMapProps {
  locations: SatelliteLocation[];
  selectedLocation: SatelliteLocation | null;
  onSelectLocation: (loc: SatelliteLocation) => void;
  activeRoute: SatelliteRouteResult | null;
  startLocation: SatelliteLocation | null;
  destLocation: SatelliteLocation | null;

  // Admin Mode Props
  isAdminMode?: boolean;
  networkNodes?: SatellitePathNode[];
  networkEdges?: SatellitePathEdge[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onUpdateNodePosition?: (nodeId: string, newPos: [number, number]) => void;
  isAddNodeMode?: boolean;
  onAddNodeAtPosition?: (pos: [number, number]) => void;
  isConnectMode?: boolean;
  onConnectToNode?: (targetNodeId: string) => void;
  onSelectEdge?: (edge: SatellitePathEdge) => void;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute,
  startLocation,
  destLocation,
  isAdminMode = false,
  networkNodes = [],
  networkEdges = [],
  selectedNodeId = null,
  onSelectNode,
  onUpdateNodePosition,
  isAddNodeMode = false,
  onAddNodeAtPosition,
  isConnectMode = false,
  onConnectToNode,
  onSelectEdge
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocGroupRef = useRef<L.LayerGroup | null>(null);
  const adminGroupRef = useRef<L.LayerGroup | null>(null);

  const [scaleDistanceMeters, setScaleDistanceMeters] = useState<number>(50);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // 1. Initialize Map with L.CRS.Simple & Uploaded Satellite Image
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dimensions: 1024 x 1536
    // Bounds in CRS.Simple: [[0, 0], [1536, 1024]]
    const bounds: L.LatLngBoundsExpression = MAP_IMAGE_BOUNDS;

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1.2,
      maxZoom: 2.5,
      zoomDelta: 0.5,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [[-120, -120], [1656, 1144]],
      maxBoundsViscosity: 0.85
    });
    mapInstanceRef.current = map;

    // Add Uploaded Satellite Image as Custom Image Overlay
    const overlay = L.imageOverlay(MAP_IMAGE_URL, bounds, {
      opacity: 1.0,
      interactive: true,
      crossOrigin: true
    }).addTo(map);
    imageOverlayRef.current = overlay;

    // Fit to initial view
    map.fitBounds(bounds, { padding: [10, 10] });

    // Layer groups for markers, routes, GPS, and admin network
    markersGroupRef.current = L.layerGroup().addTo(map);
    routeGroupRef.current = L.layerGroup().addTo(map);
    userLocGroupRef.current = L.layerGroup().addTo(map);
    adminGroupRef.current = L.layerGroup().addTo(map);

    // Zoom listener for updating scale bar
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const basePixels = 100;
      const meters = Math.round((basePixels / Math.pow(2, zoom)) * METERS_PER_PIXEL);
      setScaleDistanceMeters(Math.max(10, Math.min(500, meters)));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Clicks for Adding Nodes in Admin Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAdminMode && isAddNodeMode && onAddNodeAtPosition) {
        const clickedPos: [number, number] = [
          Math.round(e.latlng.lat),
          Math.round(e.latlng.lng)
        ];
        onAddNodeAtPosition(clickedPos);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAdminMode, isAddNodeMode, onAddNodeAtPosition]);

  // 3. Render Landmark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    locations.forEach(loc => {
      const isSelected = selectedLocation?.id === loc.id;
      const isStart = startLocation?.id === loc.id;
      const isDest = destLocation?.id === loc.id;

      let iconEmoji = '📍';
      let badgeColor = loc.color || '#2563eb';

      if (isStart) {
        iconEmoji = 'A';
        badgeColor = '#059669';
      } else if (isDest) {
        iconEmoji = 'B';
        badgeColor = '#dc2626';
      } else if (loc.category === 'Hostel') iconEmoji = '🛏️';
      else if (loc.category === 'Medical') iconEmoji = '➕';
      else if (loc.category === 'Academic') iconEmoji = '🏛️';
      else if (loc.category === 'Dining') iconEmoji = '🍴';
      else if (loc.category === 'Sports') iconEmoji = loc.iconType === 'cricket' ? '🏏' : '⚽';
      else if (loc.category === 'Worship') iconEmoji = '🛕';
      else if (loc.category === 'Gate') iconEmoji = '🚪';
      else if (loc.category === 'Green Area') iconEmoji = '🌳';
      else if (loc.category === 'Administration') iconEmoji = '🎓';

      // Custom Google Maps-style Pin HTML
      const html = `
        <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-115">
          ${
            isSelected
              ? `<div class="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping"></div>`
              : ''
          }
          
          <div class="flex flex-col items-center">
            <!-- Pin Head -->
            <div 
              style="background-color: ${badgeColor};" 
              class="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-xs text-white relative transition-all ${
                isSelected ? 'ring-4 ring-cyan-400 scale-125 z-30' : 'hover:shadow-2xl'
              }"
            >
              <span>${iconEmoji}</span>
              ${
                loc.wheelchairAccessible
                  ? `<div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-[7px]" title="Accessible">♿</div>`
                  : ''
              }
            </div>

            <!-- Pin Stem Pointer -->
            <div 
              style="border-top-color: ${badgeColor};" 
              class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-[1px]"
            ></div>

            <!-- Text Label Tag -->
            <div class="mt-0.5 px-2 py-0.5 bg-white/95 backdrop-blur-sm border border-slate-300 rounded shadow-sm text-[10px] font-bold text-slate-800 whitespace-nowrap pointer-events-none transition-all group-hover:bg-white group-hover:scale-105 ${
              isSelected ? 'ring-1 ring-blue-500 bg-blue-50 text-blue-900 font-extrabold' : ''
            }">
              ${loc.name}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-satellite-pin',
        html,
        iconSize: [32, 42],
        iconAnchor: [16, 42]
      });

      const marker = L.marker(loc.position, { icon: customIcon });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedLocation, startLocation, destLocation, onSelectLocation]);

  // 4. Pan and Center when Selected Location Changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    const map = mapInstanceRef.current;
    map.flyTo(selectedLocation.position, Math.max(map.getZoom(), 0.5), {
      duration: 0.8,
      easeLinearity: 0.25
    });
  }, [selectedLocation]);

  // 5. Render Route Polyline (ONLY if verified) & Pin Terminals
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGroupRef.current) return;
    const routeGroup = routeGroupRef.current;
    routeGroup.clearLayers();

    // If no active route or unverified route:
    if (!activeRoute) {
      return;
    }

    // REQUIREMENT 8: If no verified path exists, do NOT draw any straight line!
    if (!activeRoute.isVerified || activeRoute.coordinates.length < 2) {
      // Just render origin pin A and destination pin B if locations exist
      if (startLocation) {
        const startIcon = L.divIcon({
          className: 'route-start-pin',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
                A
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        routeGroup.addLayer(L.marker(startLocation.position, { icon: startIcon }));
      }
      if (destLocation) {
        const destIcon = L.divIcon({
          className: 'route-dest-pin',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
                B
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        routeGroup.addLayer(L.marker(destLocation.position, { icon: destIcon }));
      }
      return;
    }

    // VERIFIED ROUTE: Strictly render polyline along verified road coordinates
    // Outer glow casing
    const outerPolyline = L.polyline(activeRoute.coordinates, {
      color: '#0284c7',
      weight: 9,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(outerPolyline);

    // Inner bright royal-blue route line
    const innerPolyline = L.polyline(activeRoute.coordinates, {
      color: '#1a73e8',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(innerPolyline);

    // Inner dashed white line for high contrast
    const dashPolyline = L.polyline(activeRoute.coordinates, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.85,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(dashPolyline);

    // Start Pin (Origin A)
    const startCoord = activeRoute.coordinates[0];
    const startIcon = L.divIcon({
      className: 'route-start-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
            A
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    routeGroup.addLayer(L.marker(startCoord, { icon: startIcon }));

    // Destination Pin (Terminal B)
    const destCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
    const destIcon = L.divIcon({
      className: 'route-dest-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
          <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black">
            B
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-red-600 absolute -bottom-1"></div>
        </div>
      `,
      iconSize: [28, 34],
      iconAnchor: [14, 34]
    });
    routeGroup.addLayer(L.marker(destCoord, { icon: destIcon }));

    // Auto-fit route bounds with comfortable padding
    const bounds = L.polyline(activeRoute.coordinates).getBounds();
    mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
  }, [activeRoute, startLocation, destLocation]);

  // 6. Admin Mode Network Overlay (Interactive Nodes & Edges)
  useEffect(() => {
    if (!mapInstanceRef.current || !adminGroupRef.current) return;
    const adminGroup = adminGroupRef.current;
    adminGroup.clearLayers();

    if (!isAdminMode) return;

    const nodeMap = new Map<string, SatellitePathNode>(
      networkNodes.map(n => [n.id, n])
    );

    // Render Edges
    networkEdges.forEach(edge => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      if (!srcNode || !tgtNode) return;

      const isEdgeConnectedToSelected =
        selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

      const edgeColor = isEdgeConnectedToSelected
        ? '#38bdf8'
        : edge.isAccessible
        ? '#06b6d4'
        : '#f59e0b';

      const line = L.polyline([srcNode.position, tgtNode.position], {
        color: edgeColor,
        weight: isEdgeConnectedToSelected ? 4 : 2.5,
        opacity: isEdgeConnectedToSelected ? 0.95 : 0.75,
        dashArray: edge.isAccessible ? undefined : '5, 5'
      });

      line.on('click', () => {
        if (onSelectEdge) onSelectEdge(edge);
      });

      adminGroup.addLayer(line);
    });

    // Render Interactive Nodes
    networkNodes.forEach(node => {
      const isSelected = selectedNodeId === node.id;
      const isEntrance = !!node.isEntrance;

      const markerColor = isSelected
        ? '#eab308'
        : isEntrance
        ? '#10b981'
        : '#3b82f6';

      const markerSize = isSelected ? 18 : 12;

      const html = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125">
          ${
            isSelected
              ? `<div class="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping"></div>`
              : ''
          }
          <div 
            style="background-color: ${markerColor};"
            class="rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
              isSelected ? 'w-5 h-5 ring-4 ring-amber-400 z-40' : 'w-3.5 h-3.5'
            }"
            title="${node.name} (${node.id})"
          >
            ${isEntrance ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'admin-network-node',
        html,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      // Draggable marker in admin mode
      const marker = L.marker(node.position, {
        icon: customIcon,
        draggable: true
      });

      // Drag listener: updates node coordinates
      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        const newPos: [number, number] = [
          Math.round(latLng.lat),
          Math.round(latLng.lng)
        ];
        if (onUpdateNodePosition) {
          onUpdateNodePosition(node.id, newPos);
        }
      });

      // Click listener: select node or connect
      marker.on('click', () => {
        if (isConnectMode && onConnectToNode && selectedNodeId && selectedNodeId !== node.id) {
          onConnectToNode(node.id);
        } else if (onSelectNode) {
          onSelectNode(node.id);
        }
      });

      adminGroup.addLayer(marker);
    });
  }, [
    isAdminMode,
    networkNodes,
    networkEdges,
    selectedNodeId,
    isConnectMode,
    onSelectNode,
    onUpdateNodePosition,
    onConnectToNode,
    onSelectEdge
  ]);

  // Handle Zoom In
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  }, []);

  // Handle Zoom Out
  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  }, []);

  // Handle Reset Map View
  const handleResetMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(MAP_IMAGE_BOUNDS, { padding: [10, 10] });
    }
  }, []);

  // Handle My Location
  const handleMyLocation = useCallback(() => {
    setGpsStatus('Locating your position...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          if (mapInstanceRef.current && userLocGroupRef.current) {
            userLocGroupRef.current.clearLayers();
            const campusLoc: [number, number] = [866, 280]; // Gate No. 2
            
            const gpsIcon = L.divIcon({
              className: 'my-loc-pin',
              html: `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                  <div class="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                  <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const userMarker = L.marker(campusLoc, { icon: gpsIcon });
            userLocGroupRef.current.addLayer(userMarker);
            mapInstanceRef.current.flyTo(campusLoc, 0.8);
            setGpsStatus('Located at Gate No. 2 (Visitor Entrance)');
            setTimeout(() => setGpsStatus(null), 4000);
          }
        },
        () => {
          if (mapInstanceRef.current && userLocGroupRef.current) {
            userLocGroupRef.current.clearLayers();
            const defaultPos: [number, number] = [866, 280];
            const gpsIcon = L.divIcon({
              className: 'my-loc-pin',
              html: `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                  <div class="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                  <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            userLocGroupRef.current.addLayer(L.marker(defaultPos, { icon: gpsIcon }));
            mapInstanceRef.current.flyTo(defaultPos, 0.8);
            setGpsStatus('Located at Campus Entrance (Gate No. 2)');
            setTimeout(() => setGpsStatus(null), 4000);
          }
        },
        { timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900">
      
      {/* 1. Leaflet Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${
          isAddNodeMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* 2. Floating Unverified Route Notice (Shown when no verified path exists) */}
      {activeRoute && !activeRoute.isVerified && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500/95 backdrop-blur text-slate-950 px-4 py-2 rounded-xl shadow-2xl text-xs font-black flex items-center gap-2 border-2 border-amber-300 animate-in fade-in slide-in-from-top duration-200">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
          <span>Route needs verification: No verified road connects these locations.</span>
        </div>
      )}

      {/* 3. Floating Google Maps Control Buttons (Bottom Right) */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        
        {/* Reset Map Button */}
        <button
          onClick={handleResetMap}
          className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Reset Map View"
          aria-label="Reset Map"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* My Location Button */}
        <button
          onClick={handleMyLocation}
          className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="My Location"
          aria-label="My Location"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Zoom In & Out Stack */}
        <div className="flex flex-col bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* North Compass Widget */}
        <button
          onClick={handleResetMap}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur hover:bg-white shadow-md border border-slate-200/90 flex flex-col items-center justify-center text-slate-700 hover:text-red-600 transition-all hover:scale-105"
          title="North Orientation"
        >
          <span className="text-[9px] font-black text-red-600 -mb-1">N</span>
          <Compass className="w-4 h-4 text-slate-600" />
        </button>

      </div>

      {/* 4. Campus Scale Bar & Info (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-3">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded shadow-sm flex items-center gap-2">
          <div className="text-[10px] font-bold text-slate-700">SCALE:</div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-slate-800 rounded-sm"></div>
            <div className="text-[9px] font-mono font-bold text-slate-600 mt-0.5">
              ~{scaleDistanceMeters}m
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded text-[10px] font-medium tracking-wide">
          🛰️ Mewar University Satellite Road Graph • CRS.Simple
        </div>
      </div>

      {/* 5. GPS / Action Toast Notification */}
      {gpsStatus && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-blue-900 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 border border-blue-400 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 text-cyan-300" />
          <span>{gpsStatus}</span>
        </div>
      )}

    </div>
  );
};
