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
import type { GeoRouteResult } from '../utils/dijkstraGeo';
import { Layers, Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GoogleMapProps {
  locations: GeoLocation[];
  selectedLocation: GeoLocation | null;
  onSelectLocation: (loc: GeoLocation) => void;
  activeRoute: GeoRouteResult | null;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const campusBaseGroupRef = useRef<L.LayerGroup | null>(null);
  const walkwayGroupRef = useRef<L.LayerGroup | null>(null);
  const buildingsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 1. Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 18,
      minZoom: 15,
      maxZoom: 21,
      zoomControl: false, // We use custom Google Maps-style controls
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // 2. Base Tile Layer (Carto Voyager / Google Maps style)
    const streetsTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 21 }
    ).addTo(map);
    tileLayerRef.current = streetsTile;

    // 3. Layer Groups
    campusBaseGroupRef.current = L.layerGroup().addTo(map);
    walkwayGroupRef.current = L.layerGroup().addTo(map);
    buildingsGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    routeGroupRef.current = L.layerGroup().addTo(map);
    userLocGroupRef.current = L.layerGroup().addTo(map);

    // 4. Render Campus Base (Warm sandy ground & green lawns)
    renderCampusBase(campusBaseGroupRef.current);

    // 5. Render Continuous White Walking Paths
    renderCampusWalkways(walkwayGroupRef.current);

    // 6. Render Building Footprints
    renderBuildingFootprints(buildingsGroupRef.current, locations, onSelectLocation);

    // 7. Render Markers
    renderLocationMarkers(markersGroupRef.current, locations, onSelectLocation);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';

    if (activeBaseLayer === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    } else if (activeBaseLayer === 'dark') {
      newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    const newTile = L.tileLayer(newUrl, { subdomains, maxZoom: 21 }).addTo(map);
    tileLayerRef.current = newTile;
  }, [activeBaseLayer]);

  // Pan to Selected Location
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedLocation.lat, selectedLocation.lng], 19, {
      animate: true,
      duration: 0.8
    });
  }, [selectedLocation]);

  // Render Active Navigation Route
  useEffect(() => {
    if (!routeGroupRef.current || !mapInstanceRef.current) return;
    const group = routeGroupRef.current;
    const map = mapInstanceRef.current;
    group.clearLayers();

    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    const latlngs = activeRoute.coordinates;

    // Route Outer Casing (White border for high visibility)
    L.polyline(latlngs, {
      color: '#ffffff',
      weight: 9,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(group);

    // Main Google Maps Navigation Blue Line
    const routeLine = L.polyline(latlngs, {
      color: activeRoute.isFullyAccessible ? '#1a73e8' : '#e65100',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(group);

    // Start Pin (A - Green Circle)
    const startCoord = latlngs[0];
    const startIcon = L.divIcon({
      className: 'route-start-pin',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
        ">
          A
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker(startCoord, { icon: startIcon }).addTo(group);

    // Destination Pin (B - Google Maps Red Pin)
    const destCoord = latlngs[latlngs.length - 1];
    const destIcon = L.divIcon({
      className: 'route-dest-pin',
      html: `
        <div style="
          width: 32px;
          height: 38px;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 28px;
            height: 28px;
            background: #ea4335;
            color: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">B</span>
          </div>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [16, 38]
    });
    L.marker(destCoord, { icon: destIcon }).addTo(group);

    // Fit route in view smoothly
    map.fitBounds(routeLine.getBounds(), {
      padding: [80, 80],
      maxZoom: 19,
      animate: true
    });
  }, [activeRoute]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.setView(CAMPUS_CENTER, 18, { animate: true });

  const handleMyLocation = () => {
    if (!mapInstanceRef.current || !userLocGroupRef.current) return;
    const map = mapInstanceRef.current;
    const group = userLocGroupRef.current;
    group.clearLayers();

    // Simulate location on central promenade
    const userPos: [number, number] = [25.03130, 74.63648];

    const blueDotIcon = L.divIcon({
      className: 'user-blue-dot',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: rgba(66, 133, 244, 0.35);
            animation: pulse-ring 2s infinite;
          "></div>
          <div style="
            width: 16px;
            height: 16px;
            margin: 4px;
            border-radius: 50%;
            background: #1a73e8;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(userPos, { icon: blueDotIcon }).addTo(group);
    map.setView(userPos, 19, { animate: true });
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Google Maps Style Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-2 shadow-lg select-none">
        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-10 h-10 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-md border border-slate-200 transition-colors"
            title="Map Layers"
          >
            <Layers className="w-5 h-5" />
          </button>

          {showLayerMenu && (
            <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-2 w-40 flex flex-col gap-1 text-xs font-semibold text-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
              <button
                onClick={() => { setActiveBaseLayer('streets'); setShowLayerMenu(false); }}
                className={`px-3 py-2 rounded-lg text-left transition-colors ${activeBaseLayer === 'streets' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100'}`}
              >
                🗺️ Default Streets
              </button>
              <button
                onClick={() => { setActiveBaseLayer('satellite'); setShowLayerMenu(false); }}
                className={`px-3 py-2 rounded-lg text-left transition-colors ${activeBaseLayer === 'satellite' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100'}`}
              >
                🛰️ Satellite Aerial
              </button>
              <button
                onClick={() => { setActiveBaseLayer('dark'); setShowLayerMenu(false); }}
                className={`px-3 py-2 rounded-lg text-left transition-colors ${activeBaseLayer === 'dark' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100'}`}
              >
                🌙 Dark Mode
              </button>
            </div>
          )}
        </div>

        {/* My Location Button */}
        <button
          onClick={handleMyLocation}
          className="w-10 h-10 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-md border border-slate-200 transition-colors"
          title="Your Current Location"
        >
          <Crosshair className="w-5 h-5 text-blue-600" />
        </button>

        {/* Reset Campus View */}
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-md border border-slate-200 transition-colors"
          title="Reset to Full Campus View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-lg bg-white shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 hover:bg-slate-50 text-slate-700 flex items-center justify-center border-b border-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   LAYER RENDERING HELPERS
   ========================================================================= */

function renderCampusBase(group: L.LayerGroup) {
  // 1. Warm sandy-yellow campus ground polygon
  L.polygon(GEO_CAMPUS_BOUNDARY, {
    color: '#d4a373',
    weight: 2,
    fillColor: '#edd69e',
    fillOpacity: 0.75,
    interactive: false
  }).addTo(group);

  // 2. Green lawn patches
  GEO_LAWN_POLYGONS.forEach(pts => {
    L.polygon(pts, {
      color: '#2e7d32',
      weight: 1,
      fillColor: '#4caf50',
      fillOpacity: 0.65,
      interactive: false
    }).addTo(group);
  });
}

function renderCampusWalkways(group: L.LayerGroup) {
  GEO_WALKWAY_LINES.forEach(pts => {
    // Walkway outer casing for crisp contrast
    L.polyline(pts, {
      color: '#cbd5e1',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(group);

    // Continuous white walking path
    L.polyline(pts, {
      color: '#ffffff',
      weight: 4,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(group);
  });
}

function renderBuildingFootprints(
  group: L.LayerGroup,
  locations: GeoLocation[],
  onSelect: (loc: GeoLocation) => void
) {
  locations.forEach(loc => {
    if (!loc.buildingFootprint) return;

    const poly = L.polygon(loc.buildingFootprint, {
      color: '#475569',
      weight: 1.5,
      fillColor: '#f8fafc',
      fillOpacity: 0.85
    });

    poly.on('click', () => onSelect(loc));
    poly.bindTooltip(`<strong>${loc.name}</strong><br><small>${loc.category}</small>`, { sticky: true });
    poly.addTo(group);
  });
}

function renderLocationMarkers(
  group: L.LayerGroup,
  locations: GeoLocation[],
  onSelect: (loc: GeoLocation) => void
) {
  locations.forEach(loc => {
    const symbol = getCategorySymbol(loc.iconType);

    const customIcon = L.divIcon({
      className: 'custom-google-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        ">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${loc.color};
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${symbol}
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid #cbd5e1;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          ">
            ${loc.name}
          </div>
        </div>
      `,
      iconSize: [120, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
    marker.on('click', () => onSelect(loc));
    marker.addTo(group);
  });
}

function getCategorySymbol(type: string): string {
  switch (type) {
    case 'bed': return '🛏️';
    case 'cross': return '➕';
    case 'utensils': return '🍴';
    case 'tree': return '🌲';
    case 'building': return '🏛️';
    case 'gear': return '⚙️';
    case 'graduation': return '🎓';
    case 'monitor': return '💻';
    case 'ball': return '⚽';
    case 'cricket': return '🏏';
    default: return '📍';
  }
}
