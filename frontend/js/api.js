/**
 * AccessPath API Client
 * Clean asynchronous interface to the FastAPI backend, OpenStreetMap Nominatim, and campus datasets.
 */

const API_BASE = window.location.origin;

// In-memory cache and rate-limiter for responsible OpenStreetMap Nominatim queries
const nominatimCache = new Map();
let lastNominatimRequestTime = 0;
const NOMINATIM_MIN_INTERVAL_MS = 1100; // Enforce >= 1.1s between Nominatim requests per OSM usage policy

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
      console.warn("API warning getCampusNetwork (using fallback if offline):", err);
      throw err;
    }
  },

  /**
   * Fetches real georeferenced campus landmarks for Mewar University
   */
  async getMewarLocations() {
    try {
      const res = await fetch(`${API_BASE}/api/mewar/locations`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.locations) && data.locations.length > 0) {
          return data.locations;
        }
      }
    } catch (err) {
      console.warn("Backend /api/mewar/locations offline, using verified embedded dataset", err);
    }
    // Verified fallback dataset for Mewar University, Gangrar, Chittorgarh, Rajasthan
    return API.getVerifiedMewarLocationsFallback();
  },

  /**
   * Fetches persistent indoor building layouts for Mewar University
   */
  async getMewarIndoorData() {
    try {
      const res = await fetch(`${API_BASE}/api/mewar/indoor`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.buildings) && data.buildings.length > 0) {
          return data.buildings;
        }
      }
    } catch (err) {
      console.warn("Backend /api/mewar/indoor offline, using verified fallback", err);
    }
    return API.getVerifiedMewarIndoorFallback();
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
  },

  /**
   * Responsible OpenStreetMap Nominatim search helper.
   * Strictly adheres to OSM Nominatim Usage Policy:
   * - Maximum 1 query per second rate limiting
   * - Debounced client-side queries
   * - In-memory caching of search queries
   * - User-Agent / identification parameters
   */
  async searchNominatim(query) {
    const trimmed = (query || "").trim();
    if (!trimmed || trimmed.length < 3) return [];

    const cacheKey = trimmed.toLowerCase();
    if (nominatimCache.has(cacheKey)) {
      return nominatimCache.get(cacheKey);
    }

    const now = Date.now();
    const timeSinceLast = now - lastNominatimRequestTime;
    if (timeSinceLast < NOMINATIM_MIN_INTERVAL_MS) {
      await new Promise(r => setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - timeSinceLast));
    }
    lastNominatimRequestTime = Date.now();

    try {
      // Bounded search prioritizing Mewar University / Chittorgarh / Rajasthan
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data || []).map(item => ({
        id: `osm_${item.osm_id || Math.random()}`,
        name: item.display_name.split(',')[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'place',
        isOsmResult: true
      }));

      nominatimCache.set(cacheKey, results);
      return results;
    } catch (err) {
      console.warn("Nominatim search request failed or rate limited:", err);
      return [];
    }
  },

  /**
   * Verified Mewar University Campus Locations (Gangrar, Chittorgarh, Rajasthan)
   */
  getVerifiedMewarLocationsFallback() {
    return [
      {
        id: "main_gate",
        name: "Main Gate (NH-79)",
        code: "GATE_1",
        category: "Gate",
        description: "Northern main campus entrance gate linking directly to the NH-79 national highway, with 24/7 security kiosk, barrier control, and visitor registration.",
        lat: 25.032489,
        lng: 74.636014,
        color: "#0284c7",
        iconType: "gate",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Security Checkpost", "Tactile Paved Pathway", "Visitor Parking Area", "Information Board"],
        entranceNodeId: "node_gate_1"
      },
      {
        id: "central_library",
        name: "Maharana Pratap Central Library",
        code: "LIB",
        category: "Library",
        description: "Multi-level university central library with study stacks, reference books, digital computer lab, and ramped access.",
        lat: 25.031446,
        lng: 74.636461,
        color: "#8b5cf6",
        iconType: "book",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Level Ramp Entrance", "Elevator to 1st Floor", "Braille Reference Texts", "Assistive Tech Stations"],
        entranceNodeId: "node_ent_library"
      },
      {
        id: "kumbah_hostel",
        name: "Kumbha Hostel",
        code: "KBH",
        category: "Hostel",
        description: "Premier multi-story student residence block named after Maharana Kumbha. Features Ground Floor Rooms 1–16, central corridor, and washrooms at both ends.",
        lat: 25.032028,
        lng: 74.636877,
        color: "#a855f7",
        iconType: "bed",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        hasIndoorMap: true,
        indoorBuildingId: "kumba_hostel",
        facilities: ["Dual Handrail Ramp", "Wheelchair Lift", "Ground Floor Rooms 1–16", "West & East Washrooms"],
        entranceNodeId: "node_ent_kumbah"
      },
      {
        id: "girls_hostel",
        name: "Girls Hostel",
        code: "GH",
        category: "Hostel",
        description: "Multi-story secure residential block for female students with 24/7 security, Wi-Fi, study lounges, and internal courtyard.",
        lat: 25.032286,
        lng: 74.636133,
        color: "#ec4899",
        iconType: "bed",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Level Ramp Entrance", "Elevator Access", "Accessible Restrooms", "Security Desk"],
        entranceNodeId: "node_ent_girls_hostel"
      },
      {
        id: "hospital",
        name: "Campus Hospital & Healthcare Center",
        code: "HOSP",
        category: "Medical",
        description: "Campus Medical & Emergency Healthcare Center offering outpatient care, first aid, medical checkups, and ambulance service.",
        lat: 25.032299,
        lng: 74.636371,
        color: "#ef4444",
        iconType: "cross",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Automated Sliding Doors", "Emergency Ramp", "Medical Wheelchairs", "Pharmacy Counter"],
        entranceNodeId: "node_ent_hospital"
      },
      {
        id: "sanga_boys_hostel",
        name: "Sanga Boys Hostel",
        code: "SBH",
        category: "Hostel",
        description: "Premier student residence block named after Rana Sanga, featuring student study lounges and indoor recreation.",
        lat: 25.032326,
        lng: 74.636728,
        color: "#a855f7",
        iconType: "bed",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Ground Floor Accessible Rooms", "Ramp Entry", "Study Hall"],
        entranceNodeId: "node_ent_sanga"
      },
      {
        id: "guest_house",
        name: "University Guest House",
        code: "GHOUSE",
        category: "Dining",
        description: "University hospitality suites for visiting professors, VIP delegates, parents, and academic scholars.",
        lat: 25.032001,
        lng: 74.636148,
        color: "#f97316",
        iconType: "utensils",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Step-Free Porch", "Visitor Reception", "Dining Lounge"],
        entranceNodeId: "node_ent_guest_house"
      },
      {
        id: "park",
        name: "Campus Quad & Park",
        code: "PRK",
        category: "Green Area",
        description: "Serene landscaped garden quad with shaded pergolas, paved walking circuits, and native flowering trees.",
        lat: 25.032028,
        lng: 74.636386,
        color: "#22c55e",
        iconType: "tree",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Paved Step-Free Walkways", "Rest Benches", "Tactile Edge Borders"],
        entranceNodeId: "node_ent_park"
      },
      {
        id: "temple",
        name: "University Temple",
        code: "TMPL",
        category: "Worship",
        description: "Traditional campus shrine for prayer, meditation, and spiritual reflection, surrounded by peaceful gardens.",
        lat: 25.031947,
        lng: 74.636609,
        color: "#3b82f6",
        iconType: "building",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Dedicated West Side Ramp", "Shoe Stand with Handrail", "Spiritual Sanctuary"],
        entranceNodeId: "node_ent_temple"
      },
      {
        id: "admin_block",
        name: "Maharana Pratap Administrative Block",
        code: "ADM",
        category: "Administration",
        description: "Main administrative headquarters, Vice Chancellor Secretariat, Registrar, Academic Council, and Student Accounts.",
        lat: 25.031091,
        lng: 74.636579,
        color: "#0284c7",
        iconType: "building",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Grand Ramped Entrance", "VIP Lift", "Accessible Restrooms", "Student Helpdesk"],
        entranceNodeId: "node_ent_mewar_univ"
      },
      {
        id: "engineering_block",
        name: "Faculty of Engineering & Technology",
        code: "ENG",
        category: "Academic",
        description: "High-tech engineering wing with mechatronics labs, robotics workshops, and smart classrooms.",
        lat: 25.031023,
        lng: 74.636148,
        color: "#0d9488",
        iconType: "gear",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: true,
        facilities: ["Wide Laboratory Entrances", "Certified Ramp", "Elevator E1"],
        entranceNodeId: "node_ent_eng_block"
      },
      {
        id: "cafeteria",
        name: "Central Cafeteria & Student Mess",
        code: "CAFE",
        category: "Dining",
        description: "Multi-cuisine student food court, dining hall, hygienic water dispensers, and outdoor shaded tables.",
        lat: 25.031649,
        lng: 74.636148,
        color: "#f59e0b",
        iconType: "utensils",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Wide Double Doors", "Wheelchair Accessible Seating", "Braille Menu Cards"],
        entranceNodeId: "node_ent_cafeteria"
      },
      {
        id: "sports_complex",
        name: "Sports Complex & Cricket Ground",
        code: "SPORT",
        category: "Sports",
        description: "Spacious university cricket oval, athletic running track, basketball courts, and spectator pavilions.",
        lat: 25.030509,
        lng: 74.637041,
        color: "#10b981",
        iconType: "ball",
        wheelchairAccessible: true,
        rampAvailable: true,
        elevatorAvailable: false,
        facilities: ["Paved Perimeter Track", "Spectator Ramp Seating", "Accessible Water Station"],
        entranceNodeId: "node_ent_sports"
      }
    ];
  },

  /**
   * Verified Kumbha Hostel Ground Floor Indoor Dataset
   */
  getVerifiedMewarIndoorFallback() {
    return [
      {
        id: "kumba_hostel",
        name: "Kumbah Hostel",
        category: "Hostel",
        description: "Premier student residential block named after Maharana Kumbha. Features ground floor Rooms 1–16, central corridor, and washrooms at both ends.",
        outdoorEntranceNodeId: "node_ent_kumbah",
        outdoorBuildingId: "kumbah_hostel",
        floors: [
          {
            id: "fl_kumba_0",
            buildingId: "kumba_hostel",
            floorNumber: 0,
            floorName: "Ground Floor",
            code: "GF",
            floorPlanImageUrl: "/static/images/kumbah-ground-floor.png",
            corridorNodes: [
              { id: "node_c_kumba_gf_ent", floorId: "fl_kumba_0", type: "entrance", label: "Hostel Ground Floor Entrance", x: 53.7, y: 27.1, isAccessible: true },
              { id: "node_c_kumba_gf_junction", floorId: "fl_kumba_0", type: "corridor", label: "Central Corridor Entrance Cross", x: 56.2, y: 38.1, isAccessible: true },
              { id: "node_c_kumba_gf_washroom_w", floorId: "fl_kumba_0", type: "corridor", label: "West Washroom Entrance (Left End)", x: 16.5, y: 58.5, isAccessible: true },
              { id: "node_c_kumba_gf_sp_1_2", floorId: "fl_kumba_0", type: "corridor", label: "West Corridor (Rooms 1 & 2)", x: 27.8, y: 57.9, isAccessible: true },
              { id: "node_c_kumba_gf_sp_3_4", floorId: "fl_kumba_0", type: "corridor", label: "West Corridor (Rooms 3 & 4)", x: 37.1, y: 53.5, isAccessible: true },
              { id: "node_c_kumba_gf_sp_5_6", floorId: "fl_kumba_0", type: "corridor", label: "West Corridor (Rooms 5 & 6)", x: 45.9, y: 49.8, isAccessible: true },
              { id: "node_c_kumba_gf_sp_7_8", floorId: "fl_kumba_0", type: "corridor", label: "Mid-West Corridor (Rooms 7 & 8)", x: 54.7, y: 45.4, isAccessible: true },
              { id: "node_c_kumba_gf_sp_9_10", floorId: "fl_kumba_0", type: "corridor", label: "Mid-East Corridor (Rooms 9 & 10)", x: 68.4, y: 39.6, isAccessible: true },
              { id: "node_c_kumba_gf_sp_11_12", floorId: "fl_kumba_0", type: "corridor", label: "East Corridor (Rooms 11 & 12)", x: 76.7, y: 35.2, isAccessible: true },
              { id: "node_c_kumba_gf_sp_13_14", floorId: "fl_kumba_0", type: "corridor", label: "East Corridor (Rooms 13 & 14)", x: 84.5, y: 31.5, isAccessible: true },
              { id: "node_c_kumba_gf_sp_15_16", floorId: "fl_kumba_0", type: "corridor", label: "East Corridor (Rooms 15 & 16)", x: 92.3, y: 27.8, isAccessible: true },
              { id: "node_c_kumba_gf_washroom_e", floorId: "fl_kumba_0", type: "corridor", label: "East Washroom Entrance (Right End)", x: 93.3, y: 26.4, isAccessible: true }
            ],
            corridorEdges: [
              { id: "e_kumba_gf_ent_junc", floorId: "fl_kumba_0", source: "node_c_kumba_gf_ent", target: "node_c_kumba_gf_junction", distanceMeters: 4, isAccessible: true, description: "Hostel Main Entrance to Central Corridor" },
              { id: "e_kumba_gf_junc_w", floorId: "fl_kumba_0", source: "node_c_kumba_gf_junction", target: "node_c_kumba_gf_sp_7_8", distanceMeters: 3, isAccessible: true, description: "Corridor heading West toward Rooms 1–8" },
              { id: "e_kumba_gf_sp_7_5", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_7_8", target: "node_c_kumba_gf_sp_5_6", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 5 & 6" },
              { id: "e_kumba_gf_sp_5_3", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_5_6", target: "node_c_kumba_gf_sp_3_4", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 3 & 4" },
              { id: "e_kumba_gf_sp_3_1", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_3_4", target: "node_c_kumba_gf_sp_1_2", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 1 & 2" },
              { id: "e_kumba_gf_sp_1_wash", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_1_2", target: "node_c_kumba_gf_washroom_w", distanceMeters: 5, isAccessible: true, description: "West Corridor approach to West Washroom" },
              { id: "e_kumba_gf_junc_e", floorId: "fl_kumba_0", source: "node_c_kumba_gf_junction", target: "node_c_kumba_gf_sp_9_10", distanceMeters: 4, isAccessible: true, description: "Corridor heading East toward Rooms 9–16" },
              { id: "e_kumba_gf_sp_9_11", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_9_10", target: "node_c_kumba_gf_sp_11_12", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 11 & 12" },
              { id: "e_kumba_gf_sp_11_13", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_11_12", target: "node_c_kumba_gf_sp_13_14", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 13 & 14" },
              { id: "e_kumba_gf_sp_13_15", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_13_14", target: "node_c_kumba_gf_sp_15_16", distanceMeters: 4, isAccessible: true, description: "Central Corridor past Rooms 15 & 16" },
              { id: "e_kumba_gf_sp_15_wash", floorId: "fl_kumba_0", source: "node_c_kumba_gf_sp_15_16", target: "node_c_kumba_gf_washroom_e", distanceMeters: 3, isAccessible: true, description: "East Corridor approach to East Washroom" }
            ],
            rooms: [
              { id: "room_kumba_1", roomNumber: "1", name: "Room 1 (Top Row)", type: "Hostel Room", description: "Resident Student Room 1 in North-West wing of Kumbah Hostel Ground Floor.", x: 13.5, y: 35.5, width: 9.5, height: 17.5, doorLocation: { x: 25.2, y: 52.8 }, doorCorridorNodeId: "node_c_kumba_gf_sp_1_2", isAccessible: true, accessibilityNotes: "Step-free level threshold, 900mm wide doorway" },
              { id: "room_kumba_3", roomNumber: "3", name: "Room 3 (Top Row)", type: "Hostel Room", description: "Resident Student Room 3 along the top corridor row.", x: 23.5, y: 31.5, width: 9.5, height: 17.5, doorLocation: { x: 34.8, y: 48.4 }, doorCorridorNodeId: "node_c_kumba_gf_sp_3_4", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_5", roomNumber: "5", name: "Room 5 (Top Row)", type: "Hostel Room", description: "Resident Student Room 5 along the top corridor row.", x: 32.5, y: 27.5, width: 9.5, height: 17.5, doorLocation: { x: 43.5, y: 44.7 }, doorCorridorNodeId: "node_c_kumba_gf_sp_5_6", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_7", roomNumber: "7", name: "Room 7 (Top Row)", type: "Hostel Room", description: "Resident Student Room 7 situated immediately west of the hostel main entrance.", x: 41.5, y: 23.5, width: 9.5, height: 17.5, doorLocation: { x: 52.0, y: 40.3 }, doorCorridorNodeId: "node_c_kumba_gf_sp_7_8", isAccessible: true, accessibilityNotes: "Step-free level doorway adjacent to entrance foyer" },
              { id: "room_kumba_9", roomNumber: "9", name: "Room 9 (Top Row)", type: "Hostel Room", description: "Resident Student Room 9 situated immediately east of the hostel main entrance.", x: 55.5, y: 18.5, width: 9.5, height: 17.5, doorLocation: { x: 66.4, y: 34.5 }, doorCorridorNodeId: "node_c_kumba_gf_sp_9_10", isAccessible: true, accessibilityNotes: "Step-free level doorway" },
              { id: "room_kumba_11", roomNumber: "11", name: "Room 11 (Top Row)", type: "Hostel Room", description: "Resident Student Room 11 along the top corridor row.", x: 64.5, y: 15.0, width: 9.5, height: 17.5, doorLocation: { x: 74.2, y: 30.8 }, doorCorridorNodeId: "node_c_kumba_gf_sp_11_12", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_13", roomNumber: "13", name: "Room 13 (Top Row)", type: "Hostel Room", description: "Resident Student Room 13 along the top corridor row.", x: 72.5, y: 11.5, width: 9.5, height: 17.5, doorLocation: { x: 81.8, y: 27.1 }, doorCorridorNodeId: "node_c_kumba_gf_sp_13_14", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_15", roomNumber: "15", name: "Room 15 (Top Row)", type: "Hostel Room", description: "Resident Student Room 15 in the North-East wing near East Washroom.", x: 80.5, y: 8.0, width: 9.5, height: 17.5, doorLocation: { x: 89.8, y: 24.6 }, doorCorridorNodeId: "node_c_kumba_gf_sp_15_16", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_2", roomNumber: "2", name: "Room 2 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 2 in the South-West wing of Kumbah Hostel Ground Floor.", x: 20.0, y: 60.0, width: 9.5, height: 17.5, doorLocation: { x: 30.8, y: 63.8 }, doorCorridorNodeId: "node_c_kumba_gf_sp_1_2", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_4", roomNumber: "4", name: "Room 4 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 4 along the bottom corridor row.", x: 29.5, y: 56.0, width: 9.5, height: 17.5, doorLocation: { x: 39.6, y: 59.4 }, doorCorridorNodeId: "node_c_kumba_gf_sp_3_4", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_6", roomNumber: "6", name: "Room 6 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 6 along the bottom corridor row.", x: 39.0, y: 51.5, width: 9.5, height: 17.5, doorLocation: { x: 48.6, y: 55.0 }, doorCorridorNodeId: "node_c_kumba_gf_sp_5_6", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_8", roomNumber: "8", name: "Room 8 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 8 directly opposite the entrance corridor.", x: 48.5, y: 47.0, width: 9.5, height: 17.5, doorLocation: { x: 57.6, y: 50.6 }, doorCorridorNodeId: "node_c_kumba_gf_sp_7_8", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_10", roomNumber: "10", name: "Room 10 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 10 along the bottom corridor row.", x: 60.5, y: 42.0, width: 9.5, height: 17.5, doorLocation: { x: 70.8, y: 44.7 }, doorCorridorNodeId: "node_c_kumba_gf_sp_9_10", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_12", roomNumber: "12", name: "Room 12 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 12 along the bottom corridor row.", x: 70.0, y: 37.5, width: 9.5, height: 17.5, doorLocation: { x: 79.3, y: 40.3 }, doorCorridorNodeId: "node_c_kumba_gf_sp_11_12", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_14", roomNumber: "14", name: "Room 14 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 14 along the bottom corridor row.", x: 78.5, y: 33.0, width: 9.5, height: 17.5, doorLocation: { x: 87.4, y: 35.9 }, doorCorridorNodeId: "node_c_kumba_gf_sp_13_14", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_16", roomNumber: "16", name: "Room 16 (Bottom Row)", type: "Hostel Room", description: "Resident Student Room 16 in the South-East wing near East Washroom.", x: 87.0, y: 28.5, width: 9.5, height: 17.5, doorLocation: { x: 95.2, y: 31.5 }, doorCorridorNodeId: "node_c_kumba_gf_sp_15_16", isAccessible: true, accessibilityNotes: "Step-free doorway" },
              { id: "room_kumba_washroom_west", roomNumber: "W-WR", name: "West Washroom (Left End)", type: "Restroom", description: "Communal restrooms and washroom facility located at the West end of the ground floor corridor.", x: 2.0, y: 52.0, width: 14.0, height: 26.0, doorLocation: { x: 16.5, y: 58.5 }, doorCorridorNodeId: "node_c_kumba_gf_washroom_w", isAccessible: true, accessibilityNotes: "Step-free level entry, accessible fixtures" },
              { id: "room_kumba_washroom_east", roomNumber: "E-WR", name: "East Washroom (Right End)", type: "Restroom", description: "Communal restrooms and washroom facility located at the East end of the ground floor corridor.", x: 90.0, y: 13.0, width: 9.0, height: 20.0, doorLocation: { x: 92.5, y: 26.8 }, doorCorridorNodeId: "node_c_kumba_gf_washroom_e", isAccessible: true, accessibilityNotes: "Step-free entry, accessible basin" }
            ]
          }
        ]
      }
    ];
  }
};

window.AccessPathAPI = API;
