/**
 * Leaflet Campus Map Controller for AccessPath
 */

class CampusMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.campusData = null;
    
    // Layer Groups
    this.networkLayer = null;
    this.buildingsLayer = null;
    this.routeLayer = null;
    this.markersLayer = null;
    this.highlightLayer = null;

    this.onNodeSelectCallback = null;
  }

  init(center = [37.7762, -122.4168], zoom = 17) {
    if (this.map) return;

    this.map = L.map(this.containerId, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    // High quality, clean tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Initialize layer groups
    this.networkLayer = L.layerGroup().addTo(this.map);
    this.buildingsLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.highlightLayer = L.layerGroup().addTo(this.map);
  }

  setCampusData(data) {
    this.campusData = data;
    this.renderCampusTopology();
  }

  renderCampusTopology() {
    if (!this.campusData) return;

    this.networkLayer.clearLayers();
    this.buildingsLayer.clearLayers();

    const { nodes, edges, buildings, elevators } = this.campusData;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const elevMap = new Map(elevators.map(el => [el.id, el]));

    // 1. Render Path Network Edges
    edges.forEach(edge => {
      const u = nodeMap.get(edge.source);
      const v = nodeMap.get(edge.target);
      if (!u || !v) return;

      const latlngs = [[u.lat, u.lng], [v.lat, v.lng]];

      let color = '#10b981'; // Green for step-free
      let dashArray = null;
      let weight = 4;
      let opacity = 0.55;

      if (edge.status !== 'open') {
        color = '#ef4444';
        dashArray = '4, 8';
        weight = 3;
        opacity = 0.7;
      } else if (edge.stairs) {
        color = '#dc2626';
        dashArray = '5, 5';
        weight = 3.5;
        opacity = 0.75;
      } else if (edge.ramp_available) {
        color = '#0d9488';
        weight = 5;
        opacity = 0.8;
      } else if (edge.elevator_dependent) {
        const el = elevMap.get(edge.elevator_id);
        color = (el && el.status === 'operational') ? '#8b5cf6' : '#ef4444';
        dashArray = '2, 6';
        weight = 4;
      }

      const polyline = L.polyline(latlngs, {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Tooltip on path hover
      const descText = edge.description || 'Path segment';
      const stairText = edge.stairs ? `<br><strong style="color:#dc2626;">⚠️ ${edge.stair_count} Stairs</strong>` : '';
      const rampText = edge.ramp_available ? `<br><strong style="color:#0d9488;">♿ Accessible Ramp (${edge.slope_grade}%)</strong>` : '';
      const statusText = edge.status !== 'open' ? `<br><strong style="color:#ef4444;">⛔ BLOCKED</strong>` : '';

      polyline.bindTooltip(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; line-height: 1.4;">
          <strong>${descText}</strong><br>
          Distance: ${Math.round(edge.distance_m)}m
          ${stairText}
          ${rampText}
          ${statusText}
        </div>
      `, { sticky: true });

      polyline.addTo(this.networkLayer);
    });

    // 2. Render Campus Buildings & Landmarks
    buildings.forEach(b => {
      const iconHtml = `
        <div class="map-bldg-marker" style="
          background: #ffffff;
          border: 2px solid #2563eb;
          color: #1e40af;
          border-radius: 8px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: Inter, sans-serif;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="font-size: 13px;">🏛️</span>
          <span>${b.name.split(' ')[0]}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bldg-icon',
        html: iconHtml,
        iconSize: [80, 26],
        iconAnchor: [40, 13]
      });

      const marker = L.marker([b.lat, b.lng], { icon: customIcon });

      const facilitiesList = b.facilities.map(f => `<li>✓ ${f}</li>`).join('');

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <h3 style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">${b.name}</h3>
          <p style="font-size: 12px; color: #475569; margin-bottom: 8px;">${b.description}</p>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
            <strong style="color: #0f172a;">Accessibility Features:</strong>
            <ul style="list-style: none; padding: 0; margin-top: 4px; color: #047857;">
              ${facilitiesList}
            </ul>
          </div>
          <div style="display: flex; gap: 6px;">
            <button onclick="window.AccessPathApp.selectBuildingAsStart('${b.id}')" style="flex:1; background: #2563eb; color: #fff; border:none; padding: 6px; border-radius: 4px; font-size: 11px; font-weight:700; cursor: pointer;">Set as Start</button>
            <button onclick="window.AccessPathApp.selectBuildingAsDest('${b.id}')" style="flex:1; background: #059669; color: #fff; border:none; padding: 6px; border-radius: 4px; font-size: 11px; font-weight:700; cursor: pointer;">Set as Dest</button>
          </div>
        </div>
      `);

      marker.addTo(this.buildingsLayer);
    });

    // 3. Render Elevator Landmarks
    elevators.forEach(el => {
      // Find elevator node
      const elNode = nodes.find(n => n.node_type === 'elevator_landing' && n.description.includes(el.id));
      if (!elNode) return;

      const isOperational = el.status === 'operational';
      const iconHtml = `
        <div style="
          background: ${isOperational ? '#10b981' : '#ef4444'};
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.25);
          cursor: pointer;
        ">
          🛗
        </div>
      `;

      const elevIcon = L.divIcon({
        className: 'elev-marker-icon',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const elevMarker = L.marker([elNode.lat, elNode.lng], { icon: elevIcon });
      elevMarker.bindTooltip(`
        <strong>${el.name}</strong><br>
        Status: <span style="color: ${isOperational ? '#10b981' : '#ef4444'}; font-weight: bold;">
          ${el.status.toUpperCase()}
        </span>
      `);
      elevMarker.addTo(this.buildingsLayer);
    });
  }

  displayRoute(routeData) {
    this.routeLayer.clearLayers();
    this.markersLayer.clearLayers();

    if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
      return;
    }

    const latlngs = routeData.coordinates;

    // Outer glow / casing
    L.polyline(latlngs, {
      color: '#ffffff',
      weight: 9,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.routeLayer);

    // Primary route polyline
    const routeColor = routeData.is_step_free ? '#2563eb' : '#d97706';
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

    // Zoom and pan to fit entire route smoothly
    this.map.fitBounds(mainLine.getBounds(), {
      padding: [40, 40],
      maxZoom: 18,
      animate: true
    });
  }

  clearRoute() {
    this.routeLayer.clearLayers();
    this.markersLayer.clearLayers();
  }

  recenterCampus() {
    if (this.campusData && this.campusData.center) {
      this.map.setView(this.campusData.center, 17, { animate: true });
    }
  }
}

window.CampusMap = CampusMap;
