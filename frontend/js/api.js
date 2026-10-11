/**
 * AccessPath API Client
 * Clean asynchronous interface to the FastAPI backend
 */

const API_BASE = window.location.origin;

const API = {
  /**
   * Fetches full campus topology: buildings, nodes, edges, elevators
   */
  async getCampusNetwork() {
    try {
      const res = await fetch(`${API_BASE}/api/campus`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to fetch campus data`);
      return await res.json();
    } catch (err) {
      console.error("API error getCampusNetwork:", err);
      throw err;
    }
  },

  /**
   * Requests route calculation from start_node to destination_node
   */
  async calculateRoute(routeParams) {
    try {
      const res = await fetch(`${API_BASE}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeParams)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP Error ${res.status}: Route calculation failed`);
      }
      return await res.json();
    } catch (err) {
      console.error("API error calculateRoute:", err);
      throw err;
    }
  },

  /**
   * Fetches real-time elevator statuses
   */
  async getElevators() {
    try {
      const res = await fetch(`${API_BASE}/api/elevators`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to fetch elevators`);
      return await res.json();
    } catch (err) {
      console.error("API error getElevators:", err);
      throw err;
    }
  },

  /**
   * Updates operational status of an elevator
   */
  async setElevatorStatus(elevatorId, status, reason = "") {
    try {
      const res = await fetch(`${API_BASE}/api/elevators/${elevatorId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to update elevator status`);
      return await res.json();
    } catch (err) {
      console.error("API error setElevatorStatus:", err);
      throw err;
    }
  },

  /**
   * Fetches path edge segments
   */
  async getEdges() {
    try {
      const res = await fetch(`${API_BASE}/api/edges`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to fetch edges`);
      return await res.json();
    } catch (err) {
      console.error("API error getEdges:", err);
      throw err;
    }
  },

  /**
   * Updates open/blocked/maintenance status of a path edge
   */
  async setEdgeStatus(edgeId, status, reason = "") {
    try {
      const res = await fetch(`${API_BASE}/api/edges/${edgeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to update edge status`);
      return await res.json();
    } catch (err) {
      console.error("API error setEdgeStatus:", err);
      throw err;
    }
  },

  /**
   * Resets campus data to default demo state
   */
  async resetDemo() {
    try {
      const res = await fetch(`${API_BASE}/api/reset-demo`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to reset demo data`);
      return await res.json();
    } catch (err) {
      console.error("API error resetDemo:", err);
      throw err;
    }
  }
};

window.AccessPathAPI = API;
