/**
 * Leaflet Campus Map Controller for AccessPath — Mewar University
 * Fully OpenStreetMap-powered, 100vw x 100vh interactive outdoor map with zero API keys.
 */

// Verified geographic center of Mewar University campus in Gangrar, Chittorgarh, Rajasthan
const MEWAR_CAMPUS_CENTER = [25.031338, 74.636520];
const MEWAR_CAMPUS_DEFAULT_ZOOM = 17;

class CampusMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.mewarLocations = [];
    this.selectedLocation = null;
    
    // Layer Groups
    this.tileLayers = {};
    this.currentTileLayer = null;
    this.networkLayer = null;
    this.buildingsLayer = null;
    this.routeLayer = null;
    this.markersLayer = null;
    this.userLocationLayer = null;
    this.highlightLayer = null;

    // Callbacks
    this.onLocationSelectCallback = null;
    this.onOpenHostelIndoorCallback = null;
  }

  /**
   * Initializes the Leaflet map with standard OpenStreetMap tiles
   */
  init(center = MEWAR_CAMPUS_CENTER, zoom = MEWAR_CAMPUS_DEFAULT_ZOOM) {
    if (this.map) return;

    // Create Leaflet map instance with pan and zoom enabled
    this.map = L.map(this.containerId, {
      zoomControl: false, // We use custom accessible floating zoom controls
      attributionControl: true,
      dragging: true,
      tap: true,
      scrollWheelZoom: true,
      minZoom: 13,
      maxZoom: 20
    }).setView(center, zoom);

    // 1. Standard OpenStreetMap Layer (Default - Strictly adhering to OSM attribution policy)
    const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // 2. High-Resolution Esri World Imagery (Optional toggle without API key)
    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
      maxZoom: 19
    });

    // 3. CartoDB Dark Map (for high-contrast / night mode)
    const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });

    this.tileLayers = {
      osm_standard: osmStandard,
      esri_satellite: esriSatellite,
      carto_dark: cartoDark
    };

    // Default to Standard OpenStreetMap
    this.currentTileLayer = osmStandard;
    this.currentTileLayer.addTo(this.map);

    // Add standard Leaflet zoom control at top-left
    L.control.zoom({ position: 'top-left' }).addTo(this.map);

    // Initialize overlay layer groups
    this.networkLayer = L.layerGroup().addTo(this.map);
    this.buildingsLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.userLocationLayer = L.layerGroup().addTo(this.map);
    this.highlightLayer = L.layerGroup().addTo(this.map);

    // Handle map click to clear focus if clicked on empty canvas
    this.map.on('click', (e) => {
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.id === this.containerId) {
        // empty canvas click
      }
    });

    // Invalidate size on window resize
    window.addEventListener('resize', () => {
      if (this.map) this.map.invalidateSize();
    });
  }

  /**
   * Switches tile provider dynamically (OSM Standard, Esri Satellite, CartoDB Dark)
   */
  setTileProvider(providerName) {
    if (!this.tileLayers[providerName] || !this.map) return;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[providerName];
    this.currentTileLayer.addTo(this.map);
  }

  /**
   * Populates and renders verified Mewar University landmarks
   */
  setMewarLocations(locations) {
    this.mewarLocations = locations || [];
    this.renderMewarLocations();
  }

  /**
   * Renders interactive markers for all Mewar University locations
   */
  renderMewarLocations() {
    if (!this.map || !this.mewarLocations) return;
    this.buildingsLayer.clearLayers();

    this.mewarLocations.forEach(loc => {
      const isKumbha = loc.id === 'kumbah_hostel' || (loc.name && loc.name.toLowerCase().includes('kumbha'));
      
      // Determine icon emoji & badge color
      let iconEmoji = '🏛️';
      if (isKumbha) iconEmoji = '🏨';
      else if (loc.category === 'Hostel') iconEmoji = '🛏️';
      else if (loc.category === 'Medical') iconEmoji = '🏥';
      else if (loc.category === 'Library') iconEmoji = '📚';
      else if (loc.category === 'Gate') iconEmoji = '🚪';
      else if (loc.category === 'Worship') iconEmoji = '🛕';
      else if (loc.category === 'Green Area') iconEmoji = '🌳';
      else if (loc.category === 'Dining') iconEmoji = '🍽️';
      else if (loc.category === 'Sports') iconEmoji = '🏏';
      else if (loc.category === 'Academic') iconEmoji = '🔬';

      const markerColor = loc.color || '#2563eb';

      // HTML custom marker
      const markerHtml = `
        <div class="campus-marker-pill ${isKumbha ? 'kumbha-featured' : ''}" style="
          background: #ffffff;
          border: 2px solid ${markerColor};
          color: #0f172a;
          border-radius: 9999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 800;
          font-family: Inter, sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        ">
          <span style="font-size: 14px;">${iconEmoji}</span>
          <span>${loc.name}</span>
          ${isKumbha ? '<span style="background:#7c3aed; color:#fff; font-size:9px; padding:2px 6px; border-radius:10px; text-transform:uppercase; font-weight:900;">Indoor Plan</span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-mewar-loc-icon',
        html: markerHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 16]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      // Build Rich Interactive Popup Card
      const facilitiesHtml = (loc.facilities || []).map(f => `<li style="font-size:11px; color:#047857; margin-bottom:2px;">✓ ${f}</li>`).join('');

      const popupHtml = `
        <div class="map-popup-card" style="font-family: Inter, sans-serif; min-width: 240px; max-width: 300px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 18px;">${iconEmoji}</span>
            <div>
              <h3 style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin: 0; line-height: 1.2;">${loc.name}</h3>
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Mewar University • ${loc.category}</span>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #334155; line-height: 1.4; margin: 0 0 8px 0;">${loc.description || 'Verified campus building at Mewar University, Gangrar, Chittorgarh.'}</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Accessibility &amp; Amenities:</div>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${facilitiesHtml || '<li style="font-size:11px; color:#64748b;">Step-free campus pathway access</li>'}
            </ul>
          </div>

          ${isKumbha ? `
            <div style="margin-bottom: 8px;">
              <button 
                onclick="window.AccessPathApp.openHostelIndoorModal('kumba_hostel')" 
                style="width: 100%; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(124,58,237,0.35);"
              >
                <span>🏨</span> View Ground Floor Plan (Rooms 1–16)
              </button>
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
            <button 
              onclick="window.AccessPathApp.setRouteOriginFromLocation('${loc.id}')" 
              style="background: #2563eb; color: #ffffff; border: none; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
            >
              📍 Set as Start
            </button>
            <button 
              onclick="window.AccessPathApp.setRouteDestFromLocation('${loc.id}')" 
              style="background: #059669; color: #ffffff; border: none; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
            >
              🎯 Set as Dest
            </button>
          </div>

          <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="font-size: 11px; color: #4338ca; font-weight: 700; text-decoration: none;"
            >
              🗺️ Open this spot in Google Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 320 });
      marker.on('click', () => {
        this.selectedLocation = loc;
        if (this.onLocationSelectCallback) this.onLocationSelectCallback(loc);
      });

      marker.addTo(this.buildingsLayer);
    });
  }

  /**
   * Smoothly pans and zooms to a target coordinate
   */
  flyToLocation(lat, lng, zoom = 18) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2
    });
  }

  /**
   * Highlights and opens the popup of a specific location by ID
   */
  focusLocation(locId) {
    const loc = this.mewarLocations.find(l => l.id === locId);
    if (!loc || !this.map) return;
    this.flyToLocation(loc.lat, loc.lng, 18);
    
    // Find marker and open popup
    this.buildingsLayer.eachLayer(layer => {
      if (layer.getLatLng && Math.abs(layer.getLatLng().lat - loc.lat) < 0.00005) {
        layer.openPopup();
      }
    });
  }

  /**
   * Recenter back to Mewar University, Gangrar, Chittorgarh, Rajasthan
   */
  recenterMewarCampus() {
    if (!this.map) return;
    this.map.flyTo(MEWAR_CAMPUS_CENTER, MEWAR_CAMPUS_DEFAULT_ZOOM, {
      animate: true,
      duration: 1.0
    });
  }

  /**
   * Locate User with browser permission (Requirement 4)
   */
  locateUser(onSuccess, onError) {
    if (!navigator.geolocation) {
      if (onError) onError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        this.renderUserLocation(latitude, longitude, accuracy);
        this.flyToLocation(latitude, longitude, 17);
        if (onSuccess) onSuccess({ lat: latitude, lng: longitude, accuracy });
      },
      (err) => {
        let msg = 'Could not access your location.';
        if (err.code === 1) msg = 'Location access denied by user. Please grant browser permission.';
        else if (err.code === 2) msg = 'Position unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        if (onError) onError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Renders glowing user GPS location beacon on map
   */
  renderUserLocation(lat, lng, accuracy = 20) {
    if (!this.map) return;
    this.userLocationLayer.clearLayers();

    // Accuracy Circle
    L.circle([lat, lng], {
      radius: Math.min(accuracy, 100),
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.18,
      weight: 1.5
    }).addTo(this.userLocationLayer);

    // Pulsing Blue Dot
    const pulseIcon = L.divIcon({
      className: 'user-loc-pulsing-icon',
      html: `
        <div style="
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            background: rgba(37, 99, 235, 0.4);
            border-radius: 50%;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 16px;
            height: 16px;
            background: #2563eb;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker([lat, lng], { icon: pulseIcon });
    userMarker.bindTooltip('<strong>You Are Here</strong>', { permanent: false, direction: 'top' });
    userMarker.addTo(this.userLocationLayer);
  }

  /**
   * "Open in Google Maps" Helper (Requirement 6 - NO API KEY)
   * Opens Google Maps in a new tab with verified Mewar University or current location URL
   */
  openInGoogleMaps() {
    let url = `https://www.google.com/maps/place/Mewar+University/@${MEWAR_CAMPUS_CENTER[0]},${MEWAR_CAMPUS_CENTER[1]},17z`;
    
    // If a campus location is currently selected, focus directly on that location in Google Maps
    if (this.selectedLocation) {
      url = `https://www.google.com/maps/search/?api=1&query=${this.selectedLocation.lat},${this.selectedLocation.lng}`;
    } else if (this.map) {
      const center = this.map.getCenter();
      url = `https://www.google.com/maps/@${center.lat},${center.lng},${Math.round(this.map.getZoom())}z`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Toggles Fullscreen on the document element (Requirement 4)
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Displays route on map with accessible casing, start pin A, and dest pin B
   */
  displayRoute(routeData) {
    this.routeLayer.clearLayers();
    this.markersLayer.clearLayers();

    if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
      return;
    }

    const latlngs = routeData.coordinates;

    // Outer glow casing
    L.polyline(latlngs, {
      color: '#ffffff',
      weight: 10,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.routeLayer);

    // Primary route polyline
    const routeColor = routeData.is_step_free ? '#10b981' : '#f59e0b';
    const mainLine = L.polyline(latlngs, {
      color: routeColor,
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.routeLayer);

    // Start Pin (A)
    const startCoord = latlngs[0];
    const startIcon = L.divIcon({
      className: 'route-start-pin',
      html: `
        <div style="
          background: #059669;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">A</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    L.marker(startCoord, { icon: startIcon }).addTo(this.markersLayer);

    // Destination Pin (B)
    const destCoord = latlngs[latlngs.length - 1];
    const destIcon = L.divIcon({
      className: 'route-dest-pin',
      html: `
        <div style="
          background: #2563eb;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">B</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    L.marker(destCoord, { icon: destIcon }).addTo(this.markersLayer);

    // Smoothly fit bounds to route
    this.map.fitBounds(mainLine.getBounds(), {
      padding: [60, 60],
      maxZoom: 18,
      animate: true
    });
  }

  /**
   * Clears route lines and pins
   */
  clearRoute() {
    this.routeLayer.clearLayers();
    this.markersLayer.clearLayers();
  }

  /**
   * Recenter helper
   */
  recenterCampus() {
    this.recenterMewarCampus();
  }
}

window.CampusMap = CampusMap;
