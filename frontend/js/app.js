/**
 * AccessPath Main Application Controller
 */

class AccessPathApp {
  constructor() {
    this.api = window.AccessPathAPI;
    this.map = null;
    this.campusData = null;
    this.activeRoute = null;

    // Default Preferences
    this.preferences = {
      avoid_stairs: true,
      step_free_only: true,
      prefer_ramps: true,
      max_slope_grade: 8.0,
      avoid_unavailable_elevators: true,
      tactile_paving_priority: false,
      allow_unverified_accessible: true
    };

    this.currentView = 'map'; // 'home', 'map', 'sandbox', 'admin'
  }

  async init() {
    // 1. Initialize Map
    this.map = new CampusMap('campus-map');
    this.map.init();

    // 2. Load campus network data
    await this.refreshCampusData();

    // 3. Setup UI bindings
    this.setupEventListeners();
    this.setupPreferences();

    // 4. Set initial view
    this.switchView('map');

    this.showToast('AccessPath initialized. Fictional demo dataset loaded.', 'info');
  }

  async refreshCampusData() {
    try {
      this.campusData = await this.api.getCampusNetwork();
      this.map.setCampusData(this.campusData);
      this.populateBuildingSelects();
      this.updateElevatorStatusPill();
      this.renderAdminTables();
      this.renderSandboxControls();
    } catch (err) {
      this.showToast('Failed to load campus data: ' + err.message, 'error');
    }
  }

  setupEventListeners() {
    // View Tab Navigation
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });

    // High Contrast Toggle
    const contrastBtn = document.getElementById('btn-contrast-toggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHC = document.body.classList.contains('high-contrast');
        contrastBtn.setAttribute('aria-pressed', isHC ? 'true' : 'false');
        this.showToast(isHC ? 'High-contrast mode enabled' : 'Standard contrast mode enabled', 'info');
      });
    }

    // Route Calculate Button
    const calcBtn = document.getElementById('btn-calculate-route');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => this.calculateActiveRoute());
    }

    // Swap Locations Button
    const swapBtn = document.getElementById('btn-swap-locations');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => this.swapOriginDestination());
    }

    // Recenter Map Button
    const recenterBtn = document.getElementById('btn-recenter-map');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => this.map.recenterCampus());
    }

    // Reset Demo Button
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleResetDemo());
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update nav tab active classes
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isActive = btn.dataset.view === viewName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Trigger map invalidation if returning to map view
    if (viewName === 'map' && this.map && this.map.map) {
      setTimeout(() => {
        this.map.map.invalidateSize();
      }, 100);
    }
  }

  populateBuildingSelects() {
    const originSelect = document.getElementById('select-origin');
    const destSelect = document.getElementById('select-destination');
    if (!originSelect || !destSelect || !this.campusData) return;

    const currOrigin = originSelect.value;
    const currDest = destSelect.value;

    originSelect.innerHTML = '<option value="">-- Choose Origin Location --</option>';
    destSelect.innerHTML = '<option value="">-- Choose Destination Location --</option>';

    // Sort buildings alphabetically
    const sorted = [...this.campusData.buildings].sort((a, b) => a.name.localeCompare(b.name));

    sorted.forEach(b => {
      const optOrigin = document.createElement('option');
      optOrigin.value = b.accessible_node_id || b.main_node_id;
      optOrigin.textContent = `${b.name} (${b.category})`;
      originSelect.appendChild(optOrigin);

      const optDest = document.createElement('option');
      optDest.value = b.accessible_node_id || b.main_node_id;
      optDest.textContent = `${b.name} (${b.category})`;
      destSelect.appendChild(optDest);
    });

    // Preserve previously selected values or apply default presets
    if (currOrigin) originSelect.value = currOrigin;
    if (currDest) destSelect.value = currDest;

    if (!originSelect.value && sorted.length >= 2) {
      // Default: Visitor Gate -> Innovation Hub
      const gate = sorted.find(b => b.code === 'GATE');
      const innov = sorted.find(b => b.code === 'HUB');
      if (gate) originSelect.value = gate.accessible_node_id;
      if (innov) destSelect.value = innov.accessible_node_id;
    }
  }

  selectBuildingAsStart(buildingId) {
    const b = this.campusData.buildings.find(item => item.id === buildingId);
    if (!b) return;
    const select = document.getElementById('select-origin');
    if (select) {
      select.value = b.accessible_node_id || b.main_node_id;
      this.switchView('map');
      this.showToast(`Selected "${b.name}" as starting location`, 'info');
    }
  }

  selectBuildingAsDest(buildingId) {
    const b = this.campusData.buildings.find(item => item.id === buildingId);
    if (!b) return;
    const select = document.getElementById('select-destination');
    if (select) {
      select.value = b.accessible_node_id || b.main_node_id;
      this.switchView('map');
      this.showToast(`Selected "${b.name}" as destination`, 'info');
    }
  }

  selectPreset(originNodeId, destNodeId) {
    const origSelect = document.getElementById('select-origin');
    const destSelect = document.getElementById('select-destination');
    if (origSelect && destSelect) {
      origSelect.value = originNodeId;
      destSelect.value = destNodeId;
      this.switchView('map');
      this.calculateActiveRoute();
    }
  }

  swapOriginDestination() {
    const origSelect = document.getElementById('select-origin');
    const destSelect = document.getElementById('select-destination');
    if (!origSelect || !destSelect) return;

    const tmp = origSelect.value;
    origSelect.value = destSelect.value;
    destSelect.value = tmp;

    if (this.activeRoute) {
      this.calculateActiveRoute();
    }
  }

  setupPreferences() {
    const chkStairs = document.getElementById('pref-avoid-stairs');
    const chkStepFree = document.getElementById('pref-step-free-only');
    const chkRamps = document.getElementById('pref-prefer-ramps');
    const chkElevators = document.getElementById('pref-avoid-broken-elevators');

    if (chkStairs) chkStairs.checked = this.preferences.avoid_stairs;
    if (chkStepFree) chkStepFree.checked = this.preferences.step_free_only;
    if (chkRamps) chkRamps.checked = this.preferences.prefer_ramps;
    if (chkElevators) chkElevators.checked = this.preferences.avoid_unavailable_elevators;

    const updatePrefs = () => {
      this.preferences.avoid_stairs = chkStairs ? chkStairs.checked : true;
      this.preferences.step_free_only = chkStepFree ? chkStepFree.checked : true;
      this.preferences.prefer_ramps = chkRamps ? chkRamps.checked : true;
      this.preferences.avoid_unavailable_elevators = chkElevators ? chkElevators.checked : true;

      // Auto-recalculate route if route already active
      if (this.activeRoute) {
        this.calculateActiveRoute(false);
      }
    };

    [chkStairs, chkStepFree, chkRamps, chkElevators].forEach(el => {
      if (el) el.addEventListener('change', updatePrefs);
    });
  }

  async calculateActiveRoute(announce = true) {
    const origNode = document.getElementById('select-origin')?.value;
    const destNode = document.getElementById('select-destination')?.value;

    if (!origNode || !destNode) {
      this.showToast('Please select both starting point and destination.', 'warning');
      return;
    }

    if (origNode === destNode) {
      this.showToast('Origin and destination cannot be the same location.', 'warning');
      return;
    }

    const calcBtn = document.getElementById('btn-calculate-route');
    if (calcBtn) {
      calcBtn.disabled = true;
      calcBtn.innerHTML = '<span class="spinner"></span> Calculating Route...';
    }

    try {
      const payload = {
        start_node: origNode,
        destination_node: destNode,
        ...this.preferences
      };

      const result = await this.api.calculateRoute(payload);

      if (!result.success) {
        this.renderNoRouteFound(result.message);
        this.map.clearRoute();
        this.activeRoute = null;
        if (announce) this.announceScreenReader(`Navigation error: ${result.message}`);
        return;
      }

      this.activeRoute = result;
      this.renderRouteDetails(result);
      this.map.displayRoute(result);

      if (announce) {
        const statusMsg = result.is_step_free 
          ? `Accessible route found. Distance ${result.total_distance_m} meters. Zero stairs.`
          : `Route calculated with warnings. Distance ${result.total_distance_m} meters. Contains ${result.total_stair_count} stairs.`;
        this.announceScreenReader(statusMsg);
        this.showToast(result.message || 'Route calculated successfully', result.is_step_free ? 'success' : 'warning');
      }

    } catch (err) {
      this.renderNoRouteFound(err.message);
      this.showToast(err.message, 'error');
    } finally {
      if (calcBtn) {
        calcBtn.disabled = false;
        calcBtn.innerHTML = '<span>🔍</span> Find Accessible Route';
      }
    }
  }

  renderRouteDetails(route) {
    const container = document.getElementById('route-details-panel');
    if (!container) return;

    const stepFreeBadge = route.is_step_free
      ? `<span class="route-badge step-free">♿ 100% Step-Free</span>`
      : `<span class="route-badge has-stairs">⚠️ Stairs (${route.total_stair_count} steps)</span>`;

    const verifiedBadge = route.is_verified_accessible
      ? `<span class="route-badge verified">🛡️ Verified Accessible</span>`
      : `<span class="route-badge unverified">⚠️ Unverified Path</span>`;

    let warningsHtml = '';
    if (route.warnings && route.warnings.length > 0) {
      const items = route.warnings.map(w => `<div class="warning-pill caution">${w}</div>`).join('');
      warningsHtml = `<div class="route-warnings-list">${items}</div>`;
    }

    let comparisonHtml = '';
    if (route.has_alternative_calculated && route.alternative_summary) {
      comparisonHtml = `
        <div class="warning-pill info" style="margin-top: 6px;">
          <span>💡 <strong>Comparison:</strong> ${route.alternative_summary}</span>
        </div>
      `;
    }

    // Step-by-step turn instructions
    const stepsHtml = route.steps.map(step => {
      let icon = '🚶';
      let stepClass = '';
      if (step.elevator_used) {
        icon = '🛗';
        stepClass = 'step-elevator';
      } else if (step.ramp) {
        icon = '♿';
        stepClass = 'step-ramp';
      } else if (step.stairs) {
        icon = '🪜';
        stepClass = 'step-stairs';
      }

      return `
        <div class="nav-step-item ${stepClass}">
          <div class="step-num">${step.step_number}</div>
          <div class="step-info">
            <div class="step-instruction">${icon} ${step.instruction}</div>
            <div class="step-meta">
              Surface: ${step.surface.replace('_', ' ')} • Slope: ${step.slope_grade}% • ${Math.round(step.distance_m)}m
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="route-summary-card">
        <div class="route-badges">
          ${stepFreeBadge}
          ${verifiedBadge}
        </div>

        <div class="route-stats-grid">
          <div class="stat-box">
            <div class="stat-val">${Math.round(route.total_distance_m)}m</div>
            <div class="stat-lbl">Distance</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${route.estimated_wheelchair_min} min</div>
            <div class="stat-lbl">Wheelchair</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${route.estimated_walking_min} min</div>
            <div class="stat-lbl">Walking</div>
          </div>
        </div>

        ${comparisonHtml}
        ${warningsHtml}

        <div>
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">Step-by-Step Directions (${route.steps.length} segments):</h4>
          <div class="turn-by-turn-list">
            ${stepsHtml}
          </div>
        </div>
      </div>
    `;
  }

  renderNoRouteFound(message) {
    const container = document.getElementById('route-details-panel');
    if (!container) return;

    container.innerHTML = `
      <div class="route-summary-card" style="border-left: 4px solid var(--danger-red);">
        <h4 style="color: var(--danger-red); display: flex; align-items: center; gap: 6px;">
          <span>🚫</span> No Accessible Route Found
        </h4>
        <p style="font-size: 0.88rem; color: var(--text-muted);">${message}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">
          Tip: You may try unchecking "Step-free only" to view routes with assistance, or check the Admin Dashboard to verify path/elevator statuses.
        </p>
      </div>
    `;
  }

  updateElevatorStatusPill() {
    const pill = document.getElementById('navbar-elevator-status');
    if (!pill || !this.campusData) return;

    const elevators = this.campusData.elevators || [];
    const allOperational = elevators.every(e => e.status === 'operational');

    if (allOperational) {
      pill.className = 'elevator-health-pill operational';
      pill.innerHTML = '<span class="health-dot"></span> Elevators Normal (All Operational)';
    } else {
      const downCount = elevators.filter(e => e.status !== 'operational').length;
      pill.className = 'elevator-health-pill out-of-service';
      pill.innerHTML = `<span class="health-dot"></span> ${downCount} Elevator Out of Service`;
    }
  }

  renderAdminTables() {
    if (!this.campusData) return;

    // 1. Elevators Table
    const elevTableBody = document.getElementById('admin-elevators-tbody');
    if (elevTableBody) {
      elevTableBody.innerHTML = this.campusData.elevators.map(el => {
        const isOp = el.status === 'operational';
        return `
          <tr>
            <td><strong>${el.id}</strong></td>
            <td>${el.name}<br><small style="color:var(--text-muted)">${el.building_name}</small></td>
            <td>
              <span class="status-badge ${el.status}">
                ${el.status.replace('_', ' ').toUpperCase()}
              </span>
            </td>
            <td>${el.door_clearance_cm} cm</td>
            <td>${el.last_updated}</td>
            <td>
              <button 
                onclick="window.AccessPathApp.toggleElevatorStatus('${el.id}', '${isOp ? 'out_of_service' : 'operational'}')"
                style="
                  background: ${isOp ? '#fee2e2' : '#dcfce7'};
                  color: ${isOp ? '#991b1b' : '#166534'};
                  border: 1px solid ${isOp ? '#f87171' : '#4ade80'};
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-weight: 700;
                  font-size: 0.8rem;
                  cursor: pointer;
                "
              >
                ${isOp ? 'Simulate Breakdown' : 'Restore Operational'}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 2. Edges Table
    const edgesTableBody = document.getElementById('admin-edges-tbody');
    if (edgesTableBody) {
      edgesTableBody.innerHTML = this.campusData.edges.slice(0, 15).map(edge => {
        const isOpen = edge.status === 'open';
        return `
          <tr>
            <td><strong>${edge.id}</strong></td>
            <td>${edge.description}</td>
            <td>${Math.round(edge.distance_m)}m</td>
            <td>${edge.stairs ? `Yes (${edge.stair_count})` : 'No (Step-Free)'}</td>
            <td>
              <span class="status-badge ${edge.status}">${edge.status.toUpperCase()}</span>
            </td>
            <td>
              <button 
                onclick="window.AccessPathApp.toggleEdgeStatus('${edge.id}', '${isOpen ? 'blocked' : 'open'}')"
                style="
                  background: ${isOpen ? '#fee2e2' : '#dcfce7'};
                  color: ${isOpen ? '#991b1b' : '#166534'};
                  border: 1px solid ${isOpen ? '#f87171' : '#4ade80'};
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-weight: 600;
                  font-size: 0.8rem;
                  cursor: pointer;
                "
              >
                ${isOpen ? 'Block Path' : 'Unblock Path'}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  renderSandboxControls() {
    if (!this.campusData) return;

    const container = document.getElementById('sandbox-elevators-list');
    if (!container) return;

    container.innerHTML = this.campusData.elevators.map(el => {
      const isOp = el.status === 'operational';
      return `
        <div class="sim-switch-group">
          <div>
            <strong>${el.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${el.building_name} (${el.id})</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: ${isOp ? 'var(--accessible-green)' : 'var(--danger-red)'};">
              ${isOp ? 'OPERATIONAL' : 'OUT OF SERVICE'}
            </span>
            <label class="switch">
              <input 
                type="checkbox" 
                ${isOp ? 'checked' : ''} 
                onchange="window.AccessPathApp.toggleElevatorStatus('${el.id}', this.checked ? 'operational' : 'out_of_service')"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
    }).join('');
  }

  async toggleElevatorStatus(elevatorId, targetStatus) {
    try {
      const reason = targetStatus === 'out_of_service' ? 'Simulated Outage Demonstration' : 'Service Restored';
      await this.api.setElevatorStatus(elevatorId, targetStatus, reason);

      this.showToast(`Elevator ${elevatorId} status changed to ${targetStatus.replace('_', ' ').toUpperCase()}`, 'info');

      // Refresh campus data
      await this.refreshCampusData();

      // IF a route is currently active on the map:
      // Check if it depends on this elevator or if recalculation is needed!
      if (this.activeRoute) {
        const reliesOnElevator = (this.activeRoute.elevators_used || []).includes(elevatorId);
        if (targetStatus === 'out_of_service' && reliesOnElevator) {
          this.showToast(`Active route depends on Elevator ${elevatorId}. Recalculating alternative step-free route!`, 'warning');
          this.announceScreenReader(`Alert: Elevator ${elevatorId} is out of service. Recalculating alternative route.`);
          await this.calculateActiveRoute(true);
        } else if (targetStatus === 'operational') {
          // Re-evaluate if shorter route is now available
          await this.calculateActiveRoute(false);
        }
      }
    } catch (err) {
      this.showToast('Failed to update elevator status: ' + err.message, 'error');
    }
  }

  async toggleEdgeStatus(edgeId, targetStatus) {
    try {
      const reason = targetStatus === 'blocked' ? 'Simulated Construction Closure' : 'Path Reopened';
      await this.api.setEdgeStatus(edgeId, targetStatus, reason);

      this.showToast(`Edge ${edgeId} is now ${targetStatus.toUpperCase()}`, 'info');
      await this.refreshCampusData();

      if (this.activeRoute) {
        await this.calculateActiveRoute(false);
      }
    } catch (err) {
      this.showToast('Failed to update edge status: ' + err.message, 'error');
    }
  }

  async handleResetDemo() {
    try {
      await this.api.resetDemo();
      this.showToast('Campus data restored to original demo configuration.', 'success');
      await this.refreshCampusData();
      if (this.activeRoute) {
        await this.calculateActiveRoute(false);
      }
    } catch (err) {
      this.showToast('Failed to reset demo: ' + err.message, 'error');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  announceScreenReader(message) {
    const liveRegion = document.getElementById('sr-announcer');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}

// Global App Instance
window.AccessPathApp = new AccessPathApp();

document.addEventListener('DOMContentLoaded', () => {
  window.AccessPathApp.init();
});
