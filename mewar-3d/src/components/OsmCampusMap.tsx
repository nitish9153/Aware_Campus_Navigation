import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CAMPUS_CENTER,
  GEO_CAMPUS_BOUNDARY,
  GEO_LAWN_POLYGONS,
  GEO_WALKWAY_LINES,
  type GeoLocation
} from '../data/mewarGeoData';
import type { RoutingResult } from '../services/osmRoutingService';
import {
  Layers,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export type MapTileProvider = 'osm_standard' | 'esri_satellite' | 'carto_dark';

interface OsmCampusMapProps {
  locations: GeoLocation[];
  selectedLocation: GeoLocation | null;
  onSelectLocation: (loc: GeoLocation) => void;
  startLocation: GeoLocation | null;
  destLocation: GeoLocation | null;
  wheelchairOnly: boolean;
  isAdminMode: boolean;
  onUpdateLocationPosition?: (locId: string, newLat: number, newLng: number) => void;
  onOpenLocationAdminModal?: (loc: GeoLocation | null) => void;
  activeRoute?: RoutingResult | null;
  routeNotice?: string | null;
}

const TILE_CONFIGS: Record<MapTileProvider, {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}> = {
  osm_standard: {
    name: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  esri_satellite: {
    name: 'Satellite View (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  carto_dark: {
    name: 'Night / Dark Map',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd']
  }
};

export const OsmCampusMap: React.FC<OsmCampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  startLocation,
  destLocation,
  wheelchairOnly,
  isAdminMode,
  onUpdateLocationPosition,
  onOpenLocationAdminModal,
  activeRoute,
  routeNotice
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer references
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const campusPolygonsLayerRef = useRef<L.LayerGroup | null>(null);

  const [tileProvider, setTileProvider] = useState<MapTileProvider>('osm_standard');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: true
    });

    // Custom attribution prefix
    map.attributionControl.setPrefix('AccessPath');

    // Add Initial Standard Tile Layer
    const initialConfig = TILE_CONFIGS.osm_standard;
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      subdomains: initialConfig.subdomains || 'abc'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer Groups
    campusPolygonsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks in admin mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      // In admin mode, let admin place new landmark marker
      if ((window as any).__ACCESS_PATH_ADMIN_ACTIVE__ && onOpenLocationAdminModal) {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        onOpenLocationAdminModal({
          id: `custom_${Date.now()}`,
          name: 'New Campus Point',
          code: 'NEW',
          category: 'Academic',
          description: 'Campus location added by administrator.',
          lat,
          lng,
          color: '#3b82f6',
          iconType: 'building',
          wheelchairAccessible: true,
          rampAvailable: true,
          elevatorAvailable: false,
          brailleSignage: false,
          facilities: ['Verified Entrance'],
          entranceNodeId: 'node_ent_mewar_univ'
        });
      }
    });

    // Draw campus boundary & walkways underlay
    if (campusPolygonsLayerRef.current) {
      campusPolygonsLayerRef.current.clearLayers();

      // Campus boundary
      if (GEO_CAMPUS_BOUNDARY && GEO_CAMPUS_BOUNDARY.length > 0) {
        L.polygon(GEO_CAMPUS_BOUNDARY, {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.4,
          fillColor: '#0284c7',
          fillOpacity: 0.04,
          dashArray: '6, 6'
        }).addTo(campusPolygonsLayerRef.current);
      }

      // Lawn quads
      if (GEO_LAWN_POLYGONS) {
        GEO_LAWN_POLYGONS.forEach(poly => {
          L.polygon(poly, {
            color: '#22c55e',
            weight: 1,
            opacity: 0.35,
            fillColor: '#16a34a',
            fillOpacity: 0.12
          }).addTo(campusPolygonsLayerRef.current!);
        });
      }

      // Verified Walkway Lines (faint dashed underlay for unrouted paths)
      if (GEO_WALKWAY_LINES) {
        GEO_WALKWAY_LINES.forEach(line => {
          L.polyline(line, {
            color: '#64748b',
            weight: 2.5,
            opacity: 0.35,
            dashArray: '3, 5'
          }).addTo(campusPolygonsLayerRef.current!);
        });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update global admin flag for click handler
  useEffect(() => {
    (window as any).__ACCESS_PATH_ADMIN_ACTIVE__ = isAdminMode;
  }, [isAdminMode]);

  // 2. Handle Base Tile Layer Switch (OSM Standard / Esri Satellite / Carto Dark)
  const handleChangeTileProvider = (providerKey: MapTileProvider) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = TILE_CONFIGS[providerKey];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    }).addTo(map);

    tileLayerRef.current = newLayer;
    setTileProvider(providerKey);
    setShowLayerMenu(false);
  };

  // 3. Render Campus Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    locations.forEach(loc => {
      const isSelected = selectedLocation?.id === loc.id;
      const isStart = startLocation?.id === loc.id;
      const isDest = destLocation?.id === loc.id;

      let ringClass = 'border-slate-800 shadow-md';
      let badgeHtml = '';

      if (isStart) {
        ringClass = 'border-emerald-400 ring-4 ring-emerald-400/40 scale-110';
        badgeHtml = '<span class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">A</span>';
      } else if (isDest) {
        ringClass = 'border-rose-400 ring-4 ring-rose-400/40 scale-110';
        badgeHtml = '<span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">B</span>';
      } else if (isSelected) {
        ringClass = 'border-blue-400 ring-4 ring-blue-400/50 scale-110 animate-bounce';
      }

      const iconHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-all border-2 ${ringClass}"
               style="background-color: ${loc.color};">
            <span>${getCategoryEmoji(loc.category)}</span>
          </div>
          ${badgeHtml}
          ${isAdminMode ? '<span class="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-black px-1 rounded shadow">MOVE</span>' : ''}
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 shadow-lg">
            ${loc.name} ${loc.wheelchairAccessible ? '♿' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-osm-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([loc.lat, loc.lng], {
        icon: customIcon,
        draggable: isAdminMode,
        title: loc.name
      }).addTo(layer);

      // Handle click
      marker.on('click', () => {
        onSelectLocation(loc);
      });

      // Handle drag in admin mode
      if (isAdminMode) {
        marker.on('dragend', (e: L.LeafletEvent) => {
          const newPos = (e.target as L.Marker).getLatLng();
          if (onUpdateLocationPosition) {
            onUpdateLocationPosition(
              loc.id,
              Number(newPos.lat.toFixed(6)),
              Number(newPos.lng.toFixed(6))
            );
          }
        });
      }
    });
  }, [locations, selectedLocation, startLocation, destLocation, isAdminMode, onSelectLocation, onUpdateLocationPosition]);

  // 4. Render Active Walking Route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    const layer = routeLayerRef.current;
    layer.clearLayers();

    if (!activeRoute || !activeRoute.success || activeRoute.coordinates.length < 2) {
      return;
    }

    const coords = activeRoute.coordinates;
    const isStepFree = activeRoute.isStepFree || wheelchairOnly;

    // Glowing border line
    L.polyline(coords, {
      color: isStepFree ? '#059669' : '#1d4ed8',
      weight: 8,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layer);

    // Core polyline
    const routePoly = L.polyline(coords, {
      color: isStepFree ? '#10b981' : '#3b82f6',
      weight: 5,
      opacity: 0.95,
      dashArray: isStepFree ? '8, 8' : undefined,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layer);

    // Fit map bounds to show full route comfortably
    try {
      mapInstanceRef.current.fitBounds(routePoly.getBounds(), {
        padding: [60, 60],
        maxZoom: 18,
        animate: true
      });
    } catch (_e) {
      // Ignored if bounds invalid
    }
  }, [activeRoute, wheelchairOnly]);

  // 5. Center on Selected Location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    mapInstanceRef.current.flyTo(
      [selectedLocation.lat, selectedLocation.lng],
      18,
      { duration: 1.2 }
    );
  }, [selectedLocation]);

  // 6. User GPS Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const userMarker = L.circleMarker(userLocation, {
      radius: 8,
      color: '#06b6d4',
      fillColor: '#38bdf8',
      fillOpacity: 0.9,
      weight: 3
    }).addTo(mapInstanceRef.current);
    userMarker.bindTooltip('Your Current Position', { permanent: false });
    return () => {
      userMarker.remove();
    };
  }, [userLocation]);

  // Map Controls Helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo(CAMPUS_CENTER, 17, { duration: 1.0 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        mapInstanceRef.current?.flyTo([latitude, longitude], 18, { duration: 1.2 });
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not determine current location. Defaulting to Mewar University campus center.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950 z-0" />

      {/* Floating Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-10 h-10 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all"
            title="Switch Map Layers (OSM / Satellite)"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Layer Menu Dropdown */}
          {showLayerMenu && (
            <div className="absolute right-0 top-12 w-64 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                Map Tile Source
              </div>

              {/* Standard OSM */}
              <button
                onClick={() => handleChangeTileProvider('osm_standard')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                  tileProvider === 'osm_standard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🗺️ OpenStreetMap Standard</span>
                {tileProvider === 'osm_standard' && <span className="text-[10px]">✓</span>}
              </button>

              {/* Esri Satellite */}
              <button
                onClick={() => handleChangeTileProvider('esri_satellite')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                  tileProvider === 'esri_satellite'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🛰️ Satellite View (Esri)</span>
                {tileProvider === 'esri_satellite' && <span className="text-[10px]">✓</span>}
              </button>

              {/* Dark / Night */}
              <button
                onClick={() => handleChangeTileProvider('carto_dark')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                  tileProvider === 'carto_dark'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🌙 Night Map (Dark)</span>
                {tileProvider === 'carto_dark' && <span className="text-[10px]">✓</span>}
              </button>

              <div className="text-[9px] text-slate-400 px-2 pt-1 border-t border-slate-800">
                Data &copy; OpenStreetMap contributors
              </div>
            </div>
          )}
        </div>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`w-10 h-10 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
            isLocating ? 'animate-pulse text-cyan-400' : ''
          }`}
          title="Find My Location"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset Campus View */}
        <button
          onClick={handleResetCenter}
          className="w-10 h-10 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all"
          title="Center on Mewar University"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
        </button>

        {/* Zoom In / Out */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="w-10 h-9 text-white hover:bg-slate-800 flex items-center justify-center border-b border-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-9 text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Mode Badge on Map */}
      {isAdminMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500/95 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-2xl border border-amber-300 text-xs flex items-center gap-2 backdrop-blur-sm">
          <span>🛠️ Admin Mode Active</span>
          <span className="text-[11px] font-semibold text-slate-900">• Drag markers to reposition or click map to add</span>
        </div>
      )}

      {/* Route Notice Banner */}
      {routeNotice && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 text-cyan-300 border border-cyan-500/40 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{routeNotice}</span>
        </div>
      )}
    </div>
  );
};

function getCategoryEmoji(cat: string): string {
  switch (cat) {
    case 'Hostel': return '🛏️';
    case 'Academic': return '🏛️';
    case 'Dining': return '🍴';
    case 'Sports': return '⚽';
    case 'Medical': return '➕';
    case 'Worship': return '🙏';
    case 'Green Area': return '🌲';
    case 'Gate': return '🚪';
    case 'Library': return '📚';
    case 'Administration': return '🎓';
    default: return '📍';
  }
}
export default OsmCampusMap;
