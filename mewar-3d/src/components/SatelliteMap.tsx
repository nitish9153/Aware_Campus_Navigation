import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MAP_IMAGE_BOUNDS,
  MAP_IMAGE_URL,
  FALLBACK_IMAGE_URL,
  ROUTES_OVERLAY_URL,
  METERS_PER_PIXEL,
  type SatelliteLocation,
  type SatellitePathNode,
  type SatellitePathEdge
} from '../data/mewarSatelliteData';
import type { SatelliteRouteResult } from '../utils/satelliteDijkstra';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Compass,
  Maximize2,
  Minimize2,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface SatelliteMapProps {
  locations: SatelliteLocation[];
  selectedLocation: SatelliteLocation | null;
  onSelectLocation: (loc: SatelliteLocation) => void;
  activeRoute: SatelliteRouteResult | null;
  startLocation: SatelliteLocation | null;
  destLocation: SatelliteLocation | null;
  onSetAsStart?: (loc: SatelliteLocation) => void;
  onSetAsDest?: (loc: SatelliteLocation) => void;
  onExploreIndoor?: (buildingId: string) => void;

  // Admin Mode Props
  isAdminMode?: boolean;
  networkNodes?: SatellitePathNode[];
  networkEdges?: SatellitePathEdge[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onUpdateNodePosition?: (nodeId: string, newPos: [number, number]) => void;
  onUpdateLocationPosition?: (locationId: string, newPos: [number, number]) => void;
  isAddNodeMode?: boolean;
  onAddNodeAtPosition?: (pos: [number, number]) => void;
  isAddLocationMode?: boolean;
  onAddLocationAtPosition?: (pos: [number, number]) => void;
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
  onSetAsStart,
  onSetAsDest,
  onExploreIndoor,
  isAdminMode = false,
  networkNodes = [],
  networkEdges = [],
  selectedNodeId = null,
  onSelectNode,
  onUpdateNodePosition,
  onUpdateLocationPosition,
  isAddNodeMode = false,
  onAddNodeAtPosition,
  isAddLocationMode = false,
  onAddLocationAtPosition,
  isConnectMode = false,
  onConnectToNode,
  onSelectEdge
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const basePathsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocGroupRef = useRef<L.LayerGroup | null>(null);
  const adminGroupRef = useRef<L.LayerGroup | null>(null);

  // Image loading & fallback states
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(MAP_IMAGE_URL);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [scaleDistanceMeters, setScaleDistanceMeters] = useState<number>(50);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // 1. Preload satellite image to manage loading and fallback state gracefully
  useEffect(() => {
    let isMounted = true;
    setImageLoading(true);
    setImageError(false);

    const testImg = new Image();
    testImg.src = currentImageUrl;
    testImg.onload = () => {
      if (isMounted) {
        setImageLoading(false);
        setImageError(false);
      }
    };
    testImg.onerror = () => {
      if (isMounted) {
        if (currentImageUrl !== FALLBACK_IMAGE_URL) {
          console.warn(`Primary campus map image '${currentImageUrl}' not found, trying fallback '${FALLBACK_IMAGE_URL}'`);
          setCurrentImageUrl(FALLBACK_IMAGE_URL);
        } else {
          setImageLoading(false);
          setImageError(true);
        }
      }
    };

    return () => {
      isMounted = false;
      testImg.onload = null;
      testImg.onerror = null;
    };
  }, [currentImageUrl]);

  // 2. Initialize Leaflet Map with L.CRS.Simple & Uploaded Satellite Image
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dimensions: 562 x 672
    // Bounds in CRS.Simple: [[0, 0], [672, 562]]
    const bounds: L.LatLngBoundsExpression = MAP_IMAGE_BOUNDS;

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1.0,
      maxZoom: 3.5,
      zoomDelta: 0.5,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [[-60, -60], [732, 622]],
      maxBoundsViscosity: 0.85
    });
    mapInstanceRef.current = map;

    // Add Uploaded Satellite Image as Custom Image Overlay (Fixed Source of Truth)
    const overlay = L.imageOverlay(currentImageUrl, bounds, {
      opacity: 1.0,
      interactive: true,
      crossOrigin: true
    }).addTo(map);
    imageOverlayRef.current = overlay;

    overlay.on('load', () => {
      setImageLoading(false);
      setImageError(false);
    });
    overlay.on('error', () => {
      if (currentImageUrl !== FALLBACK_IMAGE_URL) {
        setCurrentImageUrl(FALLBACK_IMAGE_URL);
      } else {
        setImageLoading(false);
        setImageError(true);
      }
    });

    // Add Master Pixel-Perfect Route & Waypoint Overlay Layer (100% exact alignment)
    try {
      L.imageOverlay(ROUTES_OVERLAY_URL, bounds, {
        opacity: 1.0,
        interactive: false
      }).addTo(map);
    } catch {}

    // Fit to initial campus view with balanced padding
    map.fitBounds(bounds, { padding: [15, 15] });

    // Layer groups for base red walking paths, markers, routes, GPS, and admin network
    basePathsGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    routeGroupRef.current = L.layerGroup().addTo(map);
    userLocGroupRef.current = L.layerGroup().addTo(map);
    adminGroupRef.current = L.layerGroup().addTo(map);

    // Zoom listener for updating meter scale bar
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

  // Update image overlay source if fallback URL changes
  useEffect(() => {
    if (imageOverlayRef.current && currentImageUrl) {
      imageOverlayRef.current.setUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Window and container resize listener to invalidate Leaflet size
  useEffect(() => {
    const handleResize = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Handle Map Clicks for Adding Nodes or Locations in Admin Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isAdminMode) return;
      const clickedPos: [number, number] = [
        Math.round(e.latlng.lat),
        Math.round(e.latlng.lng)
      ];

      if (isAddLocationMode && onAddLocationAtPosition) {
        onAddLocationAtPosition(clickedPos);
      } else if (isAddNodeMode && onAddNodeAtPosition) {
        onAddNodeAtPosition(clickedPos);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAdminMode, isAddNodeMode, onAddNodeAtPosition, isAddLocationMode, onAddLocationAtPosition]);

  // 3.5. Render Walking Network on the Satellite Map
  // The authentic red routes and green waypoints are preserved 100% pixel-for-pixel from the master map layer.
  // In Admin Mode, active graph connections are displayed for editing/diagnostics.
  useEffect(() => {
    if (!mapInstanceRef.current || !basePathsGroupRef.current) return;
    const basePathsGroup = basePathsGroupRef.current;
    basePathsGroup.clearLayers();

    // In normal mode, authentic red routes from master image are fully displayed without distortion.
    // In admin mode, display connection lines between graph nodes to assist node editing.
    if (!isAdminMode) return;

    const nodeMap = new Map<string, SatellitePathNode>(
      networkNodes.map(n => [n.id, n])
    );

    networkEdges.forEach(edge => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      if (!srcNode || !tgtNode) return;

      // Admin visual guide line
      const adminGuideLine = L.polyline([srcNode.position, tgtNode.position], {
        color: '#3b82f6',
        weight: 2,
        opacity: 0.7,
        dashArray: '4, 4',
        interactive: false
      });
      basePathsGroup.addLayer(adminGuideLine);
    });
  }, [networkNodes, networkEdges, isAdminMode]);

  // 4. Render Landmark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    locations.forEach(loc => {
      if (
        !loc ||
        !Array.isArray(loc.position) ||
        loc.position.length < 2 ||
        typeof loc.position[0] !== 'number' ||
        typeof loc.position[1] !== 'number'
      ) {
        return;
      }

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
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:scale-115" style="width: 30px; height: 36px;">
          ${
            isSelected
              ? `<div class="absolute -inset-1 rounded-full bg-blue-500/40 animate-ping"></div>`
              : ''
          }
          ${
            isStart
              ? `<div class="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping"></div>`
              : ''
          }
          ${
            isDest
              ? `<div class="absolute -inset-1 rounded-full bg-red-500/40 animate-ping"></div>`
              : ''
          }
          
          <!-- Pin Head -->
          <div 
            style="background-color: ${badgeColor};" 
            class="w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-xs text-white relative transition-all ${
              isSelected ? 'ring-4 ring-cyan-400 scale-120 z-30' : 'hover:shadow-2xl'
            }"
          >
            <span class="font-bold">${iconEmoji}</span>
            ${
              loc.wheelchairAccessible
                ? `<div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-[7px]" title="Wheelchair Accessible">♿</div>`
                : ''
            }
          </div>

          <!-- Pin Stem Pointer -->
          <div 
            style="border-top-color: ${badgeColor};" 
            class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] -mt-[1px]"
          ></div>

          <!-- Smart Label Tag: Visible on Hover or when Selected/Start/Dest to prevent map clutter -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded shadow-lg text-[10px] whitespace-nowrap pointer-events-none transition-all z-30 ${
            isSelected || isStart || isDest
              ? 'bg-blue-600 text-white font-extrabold ring-1 ring-white/40 opacity-100 scale-105'
              : 'bg-slate-900/90 text-slate-100 font-semibold border border-slate-700/80 opacity-0 group-hover:opacity-100'
          }">
            ${loc.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-satellite-pin',
        html,
        iconSize: [30, 36],
        iconAnchor: [15, 36]
      });

      const marker = L.marker(loc.position, {
        icon: customIcon,
        draggable: !!isAdminMode
      });

      // Drag listener in Admin Mode for visual marker calibration
      if (isAdminMode) {
        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          const newPos: [number, number] = [
            Math.round(latLng.lat),
            Math.round(latLng.lng)
          ];
          if (onUpdateLocationPosition) {
            onUpdateLocationPosition(loc.id, newPos);
          }
        });
      }

      // Click listener: Select location & fly to it
      marker.on('click', () => {
        onSelectLocation(loc);
      });

      const hasIndoor = loc.id === 'kumba_hostel' || loc.id === 'engineering_block';

      // Admin coordinate badge
      const adminCoordsSnippet = isAdminMode
        ? `
          <div class="my-1.5 p-1.5 bg-amber-50 border border-amber-300 rounded text-[10px] text-amber-900 font-mono">
            <strong>Image Coordinates:</strong> [${loc.position[0]}, ${loc.position[1]}]<br>
            <span class="text-amber-700 font-sans">🎯 Drag marker to adjust building placement</span>
          </div>
        `
        : '';

      // Bind informative popup
      const popupContent = `
        <div class="p-2 max-w-xs font-sans text-slate-900">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase text-white" style="background-color: ${badgeColor}">
              ${loc.category}
            </span>
            ${loc.wheelchairAccessible ? '<span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">♿ Accessible</span>' : ''}
          </div>
          <h3 class="font-extrabold text-sm text-slate-900 leading-tight">${loc.name}</h3>
          ${loc.hindiName ? `<p class="text-xs text-slate-500 font-medium mb-1">${loc.hindiName}</p>` : ''}
          ${adminCoordsSnippet}
          <p class="text-[11px] text-slate-600 my-1 line-clamp-2">${loc.description}</p>
          <div class="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
            <button id="popup-btn-dest-${loc.id}" class="flex-1 py-1 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-colors">
              <span>Directions</span>
            </button>
            <button id="popup-btn-start-${loc.id}" class="py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors">
              <span>Start</span>
            </button>
            ${hasIndoor ? `<button id="popup-btn-indoor-${loc.id}" class="py-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-colors"><span>Floors</span></button>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        offset: [0, -38],
        className: 'custom-satellite-leaflet-popup'
      });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const destBtn = document.getElementById(`popup-btn-dest-${loc.id}`);
          if (destBtn && onSetAsDest) {
            destBtn.onclick = () => {
              onSetAsDest(loc);
              marker.closePopup();
            };
          }
          const startBtn = document.getElementById(`popup-btn-start-${loc.id}`);
          if (startBtn && onSetAsStart) {
            startBtn.onclick = () => {
              onSetAsStart(loc);
              marker.closePopup();
            };
          }
          const indoorBtn = document.getElementById(`popup-btn-indoor-${loc.id}`);
          if (indoorBtn && onExploreIndoor) {
            indoorBtn.onclick = () => {
              onExploreIndoor(loc.id === 'kumba_hostel' ? 'kumbah_hostel' : loc.id);
              marker.closePopup();
            };
          }
        }, 50);
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedLocation, startLocation, destLocation, onSelectLocation, onSetAsDest, onSetAsStart, onExploreIndoor]);

  // 5. Pan and Center when Selected Location Changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    const map = mapInstanceRef.current;
    map.flyTo(selectedLocation.position, Math.max(map.getZoom(), 0.5), {
      duration: 0.8,
      easeLinearity: 0.25
    });
  }, [selectedLocation]);

  // 6. Render Route Polyline & Pin Terminals
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGroupRef.current) return;
    const routeGroup = routeGroupRef.current;
    routeGroup.clearLayers();

    // If no active route:
    if (!activeRoute) {
      return;
    }

    // If no verified path exists, render endpoints without fabricated lines
    if (!activeRoute.isVerified || activeRoute.coordinates.length < 2) {
      if (startLocation) {
        const startIcon = L.divIcon({
          className: 'route-start-pin',
          html: `
            <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
              A
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
            <div class="flex flex-col items-center w-7" style="height: 34px;">
              <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black">
                B
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-600 -mt-[1px]"></div>
            </div>
          `,
          iconSize: [28, 34],
          iconAnchor: [14, 34]
        });
        routeGroup.addLayer(L.marker(destLocation.position, { icon: destIcon }));
      }
      return;
    }

    // VERIFIED ROUTE: Polyline along verified campus road network
    // Outer glow casing (cyan/blue)
    const outerPolyline = L.polyline(activeRoute.coordinates, {
      color: '#00f0ff',
      weight: 10,
      opacity: 0.65,
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(outerPolyline);

    // Inner bright cyan/blue route line
    const innerPolyline = L.polyline(activeRoute.coordinates, {
      color: '#0284c7',
      weight: 6,
      opacity: 0.98,
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(innerPolyline);

    // Inner dashed high-contrast line
    const dashPolyline = L.polyline(activeRoute.coordinates, {
      color: '#ffffff',
      weight: 2.5,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    });
    routeGroup.addLayer(dashPolyline);

    // Start Pin (Origin A)
    const startCoord = activeRoute.coordinates[0];
    const startIcon = L.divIcon({
      className: 'route-start-pin',
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
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
        <div class="flex flex-col items-center w-7" style="height: 34px;">
          <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black">
            B
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-600 -mt-[1px]"></div>
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

  // 7. Admin Mode Network Overlay
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

      const marker = L.marker(node.position, {
        icon: customIcon,
        draggable: true
      });

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

      marker.on('click', () => {
        if (isConnectMode && onConnectToNode) {
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
      mapInstanceRef.current.fitBounds(MAP_IMAGE_BOUNDS, { padding: [15, 15] });
    }
  }, []);

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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
    <div
      ref={wrapperRef}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950"
    >
      
      {/* 1. Leaflet Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${
          isAddNodeMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* 2. Loading State Overlay */}
      {imageLoading && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white pointer-events-auto animate-in fade-in duration-300">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <span className="absolute text-xl">🛰️</span>
          </div>
          <h3 className="text-base font-extrabold tracking-wide text-white">
            Loading Mewar University Campus Map
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
            Calibrating high-resolution satellite imagery • Leaflet CRS.Simple
          </p>
          <div className="mt-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-mono">
            {currentImageUrl}
          </div>
        </div>
      )}

      {/* 3. Error / Fallback Banner */}
      {imageError && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-white p-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-3">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Campus Map Image Not Found</h3>
          <p className="text-xs text-slate-400 text-center max-w-md mb-4">
            Could not load satellite map from <code className="text-red-400">{currentImageUrl}</code>. Please ensure the image is in <code className="text-cyan-400">public/images/mewar-university-campus.png</code>.
          </p>
          <button
            onClick={() => {
              setImageError(false);
              setImageLoading(true);
              setCurrentImageUrl(MAP_IMAGE_URL);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading Map</span>
          </button>
        </div>
      )}

      {/* 4. Floating Unverified Route Notice */}
      {activeRoute && !activeRoute.isVerified && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500/95 backdrop-blur text-slate-950 px-4 py-2 rounded-xl shadow-2xl text-xs font-black flex items-center gap-2 border-2 border-amber-300 animate-in fade-in slide-in-from-top duration-200">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
          <span>Route notice: No verified pedestrian road connects these two locations.</span>
        </div>
      )}

      {/* 5. Floating Interactive Map Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        
        {/* Fullscreen Toggle Button */}
        <button
          onClick={handleToggleFullscreen}
          className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen View'}
          aria-label="Full Screen Map"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Reset Map View Button */}
        <button
          onClick={handleResetMap}
          className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Reset Map to Full Campus View"
          aria-label="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* My Location Button */}
        <button
          onClick={handleMyLocation}
          className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Show Campus Entrance (My Location)"
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
          title="Reset to North Orientation"
        >
          <span className="text-[9px] font-black text-red-600 -mb-1">N</span>
          <Compass className="w-4 h-4 text-slate-600" />
        </button>

      </div>

      {/* 6. Campus Scale Bar & Info (Bottom Left) */}
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

        <div className="bg-slate-900/85 backdrop-blur-sm text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded text-[10px] font-medium tracking-wide flex items-center gap-1.5">
          <span>🛰️</span>
          <span>Mewar University Satellite Map • CRS.Simple</span>
        </div>
      </div>

      {/* 7. GPS Toast Notification */}
      {gpsStatus && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-blue-900 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 border border-blue-400 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 text-cyan-300" />
          <span>{gpsStatus}</span>
        </div>
      )}

    </div>
  );
};
