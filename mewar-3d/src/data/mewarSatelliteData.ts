/**
 * Mewar University Satellite Map Dataset
 * Strictly calibrated to the 562 x 672 Mewar University Master Reference Map.
 * Uses Leaflet L.CRS.Simple where bounds are [[0, 0], [672, 562]].
 * Latitude = 0 (bottom) to 672 (top)  => lat = 672 - y_pixel
 * Longitude = 0 (left) to 562 (right) => lng = x_pixel
 */

export interface SatelliteLocation {
  id: string;
  name: string;
  hindiName?: string;
  code: string;
  category: 'Hostel' | 'Academic' | 'Dining' | 'Sports' | 'Medical' | 'Worship' | 'Gate' | 'Green Area' | 'Administration';
  description: string;
  position: [number, number]; // [lat, lng] in Leaflet CRS.Simple
  color: string;
  iconType: 'bed' | 'cross' | 'utensils' | 'tree' | 'building' | 'gear' | 'graduation' | 'monitor' | 'ball' | 'cricket' | 'gate' | 'worship';
  wheelchairAccessible: boolean;
  rampAvailable: boolean;
  elevatorAvailable: boolean;
  brailleSignage: boolean;
  facilities: string[];
  entranceNodeId: string;
  aliases?: string[];
}

export interface SatellitePathNode {
  id: string;
  name: string;
  position: [number, number]; // [lat, lng]
  isEntrance?: boolean;
  buildingId?: string;
}

export interface SatellitePathEdge {
  id: string;
  source: string;
  target: string;
  distanceMeters: number;
  isAccessible: boolean;
  description: string;
}

export const MAP_IMAGE_WIDTH = 562;
export const MAP_IMAGE_HEIGHT = 672;
export const MAP_IMAGE_BOUNDS: [[number, number], [number, number]] = [[0, 0], [672, 562]];
export const MAP_IMAGE_URL = '/images/mewar-university-campus.png';
export const FALLBACK_IMAGE_URL = '/mewar-satellite-map.png';
export const ROUTES_OVERLAY_URL = '/images/routes-overlay.png';

// Scale factor: calibrated meters per pixel in the 562 x 672 satellite image
export const METERS_PER_PIXEL = 0.85;

export function calculateEdgeDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const dx = p1[1] - p2[1];
  const dy = p1[0] - p2[0];
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  return Math.max(5, Math.round(distPixels * METERS_PER_PIXEL));
}

// ---------------------------------------------------------------------------
// 1. CAMPUS LOCATIONS IDENTIFIED ACCURATELY FROM REFERENCE SATELLITE IMAGE
// Coordinates correspond strictly to visible building positions and pins in the master map
// ---------------------------------------------------------------------------
export const SATELLITE_CAMPUS_LOCATIONS: SatelliteLocation[] = [
  {
    id: 'sanga_hostel',
    name: 'Sanga Hostel',
    hindiName: 'सांगा हॉस्टल',
    code: 'SBH',
    category: 'Hostel',
    description: 'Premier residential hostel for male students located at the northern perimeter with study halls and common areas.',
    position: [620, 224],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Level Ramp Entrance', 'Accessible Ground Floor Rooms', 'Mess Access', 'Wi-Fi Lounge'],
    entranceNodeId: 'node_sanga_ent',
    aliases: ['Sanga Hostel', 'Sanga', 'Sanga Boys Hostel', 'SBH']
  },
  {
    id: 'kumba_hostel',
    name: 'Kumbah Hostel',
    hindiName: 'कुम्भा हॉस्टल',
    code: 'KBH',
    category: 'Hostel',
    description: 'Multi-wing residence named after Maharana Kumbha. Features ground floor Rooms 1–16, central corridor, and washrooms at both ends.',
    position: [550, 255],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dedicated Entrance Ramp', 'Ground Floor Accessible Restrooms', 'Common Room'],
    entranceNodeId: 'node_kumba_ent',
    aliases: ['Kumbah Hostel – Ground Floor', 'Kumbah Hostel', 'Kumba Hostel', 'Kumbha Hostel', 'Kumba', 'Kumbha', 'KBH']
  },
  {
    id: 'girls_hostel',
    name: 'Girls Hostel',
    hindiName: 'गर्ल्स हॉस्टल',
    code: 'GH',
    category: 'Hostel',
    description: 'Secure multi-story residential block for female students with 24/7 security desk and inner courtyard.',
    position: [565, 80],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Automated Sliding Door', 'Step-Free Ramp', 'Elevator', '24/7 Security'],
    entranceNodeId: 'node_sanga_nw',
    aliases: ['Girls Hostel', 'GH', 'Womens Hostel']
  },
  {
    id: 'hospital',
    name: 'Hospital',
    hindiName: 'अस्पताल / स्वास्थ्य केंद्र',
    code: 'HOSP',
    category: 'Medical',
    description: 'University Health & Medical Center with round-the-clock emergency care, consultations, and ambulance station.',
    position: [592, 135],
    color: '#ef4444',
    iconType: 'cross',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Emergency Ambulance Bay', 'Wide Wheelchair Ramp', 'Medical Equipment', 'Pharmacy'],
    entranceNodeId: 'node_sanga_north',
    aliases: ['Hospital', 'Health Center', 'Medical Center', 'Clinic', 'Ambulance']
  },
  {
    id: 'gate_1',
    name: 'Gate No. 1',
    code: 'GATE_1',
    category: 'Gate',
    description: 'Northern main campus entrance gate linking directly to the national highway, with guard cabin and visitor registration.',
    position: [490, 95],
    color: '#64748b',
    iconType: 'gate',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Level Paved Access', 'Security Post', 'Barrier Free Gate'],
    entranceNodeId: 'node_west_gate_junc',
    aliases: ['Gate No. 1', 'Gate 1', 'North Gate', 'Main Highway Gate']
  },
  {
    id: 'main_building',
    name: 'Mewar University Main Building',
    hindiName: 'मेवाड़ विश्वविद्यालय मुख्य भवन',
    code: 'MAIN_BLD',
    category: 'Administration',
    description: 'Central administrative and academic headquarters housing Vice Chancellor chambers, Registrar, Admissions, and Academic Directorate.',
    position: [424, 188],
    color: '#2563eb',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Main Front Entrance Ramp', 'Passenger Elevators', 'Accessible Information Desk', 'Braille Floor Directory'],
    entranceNodeId: 'node_univ_west_ent',
    aliases: ['Mewar University Main Building', 'Main Building', 'Mewar University', 'Admin Block', 'Central Academic Block']
  },
  {
    id: 'gandhi_museum',
    name: 'Gandhi Museum',
    hindiName: 'गांधी म्यूज़ियम',
    code: 'MUSEUM',
    category: 'Academic',
    description: 'Cultural memorial and archival museum dedicated to Mahatma Gandhi, displaying historical artifacts and research literature.',
    position: [367, 218],
    color: '#0284c7',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Level Ground Access', 'Tactile Display Aids', 'Audio Guides'],
    entranceNodeId: 'node_gandhi_ent',
    aliases: ['Gandhi Museum', 'Museum', 'Gandhi Smriti', 'Cultural Museum']
  },
  {
    id: 'mess',
    name: 'Mess',
    hindiName: 'छात्र मेस / भोजनालय',
    code: 'MESS_1',
    category: 'Dining',
    description: 'Spacious campus dining hall catering to students and staff with nutritious multi-cuisine meals.',
    position: [337, 300],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Zero Threshold Double Doors', 'Low Height Serving Counters', 'Wheelchair Friendly Aisles'],
    entranceNodeId: 'node_mess_ent',
    aliases: ['Mess', 'Dining Hall', 'Student Mess', 'Canteen', 'Food Court']
  },
  {
    id: 'bader_hostel',
    name: 'Bader Hostel',
    hindiName: 'बादेर हॉस्टल',
    code: 'BDH',
    category: 'Hostel',
    description: 'Residential student hostel located adjacent to academic and dining complexes.',
    position: [397, 350],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Ramped Entrance', 'Accessible Restrooms', 'Common Room'],
    entranceNodeId: 'node_bader_ent',
    aliases: ['Bader Hostel', 'Bader', 'BDH']
  },
  {
    id: 'law_block',
    name: 'Law Block',
    hindiName: 'विधि संकाय भवन',
    code: 'LAW',
    category: 'Academic',
    description: 'Faculty of Legal Studies featuring state-of-the-art moot courtroom, legal aid clinic, and jurisprudence library.',
    position: [316, 362],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Moot Court Ramp Access', 'Designated Wheelchair Jury Desk', 'Braille Signage'],
    entranceNodeId: 'node_law_ent',
    aliases: ['Law Block', 'Faculty of Law', 'Law Department', 'Law College']
  },
  {
    id: 'football_ground',
    name: 'Football Ground',
    hindiName: 'फुटबॉल मैदान',
    code: 'FB_FLD',
    category: 'Sports',
    description: 'Official collegiate grass soccer stadium with perimeter spectator stands and paved jogging path.',
    position: [307, 242],
    color: '#10b981',
    iconType: 'ball',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Accessible Spectator Area', 'Level Field Access', 'Paved Perimeter Path'],
    entranceNodeId: 'node_fb_ent',
    aliases: ['Football Ground', 'Football Field', 'Soccer Ground', 'Soccer Field']
  },
  {
    id: 'basketball',
    name: 'Basketball Court',
    hindiName: 'बास्केटबॉल कोर्ट',
    code: 'BB_CRT',
    category: 'Sports',
    description: 'Hardcourt outdoor basketball court with spectator seating.',
    position: [257, 382],
    color: '#10b981',
    iconType: 'ball',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Level Paved Access', 'Spectator Area'],
    entranceNodeId: 'node_bball_ent',
    aliases: ['Basketball Court', 'Basketball', 'BB Court']
  },
  {
    id: 'cricket_ground',
    name: 'Cricket Ground',
    hindiName: 'क्रिकेट मैदान',
    code: 'CRK_FLD',
    category: 'Sports',
    description: 'Expansive cricket arena featuring regulation pitch, turf boundary, practice nets, and spectator seating.',
    position: [167, 255],
    color: '#10b981',
    iconType: 'cricket',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Smooth Access Pathway', 'Pavilion Ramp', 'Accessible Viewing Bays'],
    entranceNodeId: 'node_cricket_ent',
    aliases: ['Cricket Ground', 'Cricket Stadium', 'Cricket Pitch']
  }
];

// ---------------------------------------------------------------------------
// 2. CALIBRATED ROAD & WALKWAY GRAPH (29 Green Waypoints & Authentic Red Paths)
// Directly extracted from the master campus map
// ---------------------------------------------------------------------------
export const DEFAULT_SATELLITE_PATH_NODES: SatellitePathNode[] = [
  // --- North Sector: Sanga Hostel, Gate, Approach ---
  { id: 'node_sanga_north', name: 'Sanga Hostel North Approach', position: [593.5, 130.0], isEntrance: true, buildingId: 'sanga_hostel' },
  { id: 'node_sanga_nw', name: 'North-West Perimeter Gate', position: [588.4, 112.2] },
  { id: 'node_sanga_east', name: 'Sanga Hostel East Lane', position: [573.2, 217.4] },
  { id: 'node_sanga_ent', name: 'Sanga Hostel Main Entrance', position: [570.5, 192.0], isEntrance: true, buildingId: 'sanga_hostel' },
  { id: 'node_sanga_west', name: 'Sanga Hostel West Lane', position: [552.8, 139.8] },

  // --- Kumbha Hostel Sector ---
  { id: 'node_kumba_north', name: 'Kumbha Hostel North Lane', position: [537.3, 248.5] },
  { id: 'node_sanga_kumba_junc', name: 'Sanga-Kumbha Junction', position: [531.4, 210.0] },
  { id: 'node_west_upper', name: 'West Campus Drive (Upper)', position: [515.8, 119.4] },
  { id: 'node_kumba_mid', name: 'Kumbha Approach Spine', position: [515.0, 198.4] },
  { id: 'node_nw_cross', name: 'North-West Cross Pathway', position: [510.8, 156.8] },
  { id: 'node_kumba_ent', name: 'Kumbha Hostel Main Entrance', position: [505.3, 260.1], isEntrance: true, buildingId: 'kumba_hostel' },
  { id: 'node_west_gate_junc', name: 'West Drive at Gate 1', position: [490.0, 105.5] },

  // --- Central Academic Sector: Mewar University, Museum, Bader, Mess ---
  { id: 'node_univ_west_bend', name: 'University West Avenue Bend', position: [444.9, 146.1] },
  { id: 'node_univ_west_ent', name: 'Mewar University West Entrance', position: [420.1, 178.4], isEntrance: true, buildingId: 'main_building' },
  { id: 'node_univ_east_junc', name: 'Academic Spine East Junction', position: [402.1, 290.4] },
  { id: 'node_bader_ent', name: 'Bader Hostel Entrance', position: [386.7, 347.6], isEntrance: true, buildingId: 'bader_hostel' },
  { id: 'node_gandhi_north', name: 'Gandhi Museum North Walkway', position: [381.6, 174.2] },
  { id: 'node_mess_west', name: 'Mess West Approach', position: [354.6, 287.6] },
  { id: 'node_univ_south_ent', name: 'Mewar University South Entrance', position: [349.5, 275.5], isEntrance: true, buildingId: 'main_building' },
  { id: 'node_mess_ent', name: 'Mess Main Entrance', position: [337.0, 296.6], isEntrance: true, buildingId: 'mess' },
  { id: 'node_gandhi_ent', name: 'Gandhi Museum Main Entrance', position: [319.0, 186.3], isEntrance: true, buildingId: 'gandhi_museum' },
  { id: 'node_law_ent', name: 'Law Block Entrance', position: [308.2, 356.6], isEntrance: true, buildingId: 'law_block' },
  { id: 'node_central_spine_mid', name: 'Central Campus Spine', position: [287.6, 299.5] },

  // --- Sports & South Sector: Football, Basketball, Cricket, Solar Block ---
  { id: 'node_fb_ent', name: 'Football Ground Entrance', position: [311.1, 230.6], isEntrance: true, buildingId: 'football_ground' },
  { id: 'node_bball_ent', name: 'Basketball Court Entrance', position: [253.6, 381.1], isEntrance: true, buildingId: 'basketball' },
  { id: 'node_south_crossroads', name: 'South Campus Crossroads', position: [226.7, 319.5] },
  { id: 'node_solar_east', name: 'Solar Block East Walkway', position: [179.8, 358.3] },
  { id: 'node_solar_west', name: 'Solar Block West Pathway', position: [177.0, 340.9] },
  { id: 'node_cricket_ent', name: 'Cricket Ground Entrance', position: [164.4, 248.1], isEntrance: true, buildingId: 'cricket_ground' }
];

export const DEFAULT_SATELLITE_PATH_EDGES: SatellitePathEdge[] = [
  // --- North & Sanga Hostel Edges ---
  { id: 'e_sanga_nw_n', source: 'node_sanga_nw', target: 'node_sanga_north', distanceMeters: 18, isAccessible: true, description: 'North-West corner to Sanga North approach' },
  { id: 'e_sanga_n_w', source: 'node_sanga_north', target: 'node_sanga_west', distanceMeters: 36, isAccessible: true, description: 'Sanga North to Sanga West lane' },
  { id: 'e_sanga_w_cross', source: 'node_sanga_west', target: 'node_nw_cross', distanceMeters: 38, isAccessible: true, description: 'Sanga West to North-West cross path' },
  { id: 'e_sanga_nw_west_up', source: 'node_sanga_nw', target: 'node_west_upper', distanceMeters: 62, isAccessible: true, description: 'North-West corner along perimeter drive' },
  { id: 'e_west_up_gate', source: 'node_west_upper', target: 'node_west_gate_junc', distanceMeters: 25, isAccessible: true, description: 'Perimeter drive approaching Gate 1' },
  { id: 'e_sanga_ent_east', source: 'node_sanga_ent', target: 'node_sanga_east', distanceMeters: 22, isAccessible: true, description: 'Sanga Hostel entrance to East lane' },
  { id: 'e_sanga_ent_junc', source: 'node_sanga_ent', target: 'node_sanga_kumba_junc', distanceMeters: 36, isAccessible: true, description: 'Sanga entrance to Sanga-Kumbha junction' },
  { id: 'e_junc_kumba_n', source: 'node_sanga_kumba_junc', target: 'node_kumba_north', distanceMeters: 33, isAccessible: true, description: 'Junction to Kumbha north lane' },
  { id: 'e_junc_kumba_mid', source: 'node_sanga_kumba_junc', target: 'node_kumba_mid', distanceMeters: 18, isAccessible: true, description: 'Junction to Kumbha approach spine' },
  { id: 'e_kumba_mid_cross', source: 'node_kumba_mid', target: 'node_nw_cross', distanceMeters: 36, isAccessible: true, description: 'Crossway between Kumbha and west lane' },
  { id: 'e_kumba_mid_ent', source: 'node_kumba_mid', target: 'node_kumba_ent', distanceMeters: 53, isAccessible: true, description: 'Spine to Kumbha Hostel entrance' },
  { id: 'e_kumba_n_ent', source: 'node_kumba_north', target: 'node_kumba_ent', distanceMeters: 30, isAccessible: true, description: 'North lane to Kumbha Hostel entrance' },

  // --- West & Central Academic Edges ---
  { id: 'e_gate_univ_bend', source: 'node_west_gate_junc', target: 'node_univ_west_bend', distanceMeters: 52, isAccessible: true, description: 'Gate 1 to University West avenue' },
  { id: 'e_univ_bend_ent', source: 'node_univ_west_bend', target: 'node_univ_west_ent', distanceMeters: 35, isAccessible: true, description: 'West avenue to University West entrance' },
  { id: 'e_univ_ent_gandhi_n', source: 'node_univ_west_ent', target: 'node_gandhi_north', distanceMeters: 33, isAccessible: true, description: 'West entrance towards Gandhi Museum' },
  { id: 'e_gandhi_n_ent', source: 'node_gandhi_north', target: 'node_gandhi_ent', distanceMeters: 54, isAccessible: true, description: 'North walkway to Gandhi Museum entrance' },
  { id: 'e_kumba_univ_east', source: 'node_kumba_ent', target: 'node_univ_east_junc', distanceMeters: 92, isAccessible: true, description: 'Kumbha southwards to Academic east spine' },
  { id: 'e_univ_east_bader', source: 'node_univ_east_junc', target: 'node_bader_ent', distanceMeters: 50, isAccessible: true, description: 'Academic spine to Bader Hostel entrance' },
  { id: 'e_univ_east_mess_w', source: 'node_univ_east_junc', target: 'node_mess_west', distanceMeters: 41, isAccessible: true, description: 'Academic spine towards Mess west approach' },
  { id: 'e_mess_w_univ_s', source: 'node_mess_west', target: 'node_univ_south_ent', distanceMeters: 11, isAccessible: true, description: 'Mess approach to University south entrance' },
  { id: 'e_mess_w_ent', source: 'node_mess_west', target: 'node_mess_ent', distanceMeters: 17, isAccessible: true, description: 'West approach to Mess entrance' },
  { id: 'e_bader_law', source: 'node_bader_ent', target: 'node_law_ent', distanceMeters: 67, isAccessible: true, description: 'Bader Hostel avenue to Law Block' },
  { id: 'e_gandhi_fb', source: 'node_gandhi_ent', target: 'node_fb_ent', distanceMeters: 38, isAccessible: true, description: 'Gandhi Museum to Football Ground' },
  { id: 'e_gandhi_univ_s', source: 'node_gandhi_ent', target: 'node_univ_south_ent', distanceMeters: 80, isAccessible: true, description: 'Gandhi Museum concourse to University south' },
  { id: 'e_univ_s_central_mid', source: 'node_univ_south_ent', target: 'node_central_spine_mid', distanceMeters: 57, isAccessible: true, description: 'University south to Central spine' },
  { id: 'e_mess_central_mid', source: 'node_mess_ent', target: 'node_central_spine_mid', distanceMeters: 43, isAccessible: true, description: 'Mess entrance to Central spine' },

  // --- Sports & South Campus Edges ---
  { id: 'e_fb_south_cross', source: 'node_fb_ent', target: 'node_south_crossroads', distanceMeters: 105, isAccessible: true, description: 'Football Ground to South crossroads' },
  { id: 'e_central_mid_south_cross', source: 'node_central_spine_mid', target: 'node_south_crossroads', distanceMeters: 54, isAccessible: true, description: 'Central spine to South crossroads' },
  { id: 'e_south_cross_bball', source: 'node_south_crossroads', target: 'node_bball_ent', distanceMeters: 58, isAccessible: true, description: 'Crossroads to Basketball Court' },
  { id: 'e_south_cross_cricket', source: 'node_south_crossroads', target: 'node_cricket_ent', distanceMeters: 82, isAccessible: true, description: 'Crossroads to Cricket Ground' },
  { id: 'e_south_cross_solar_w', source: 'node_south_crossroads', target: 'node_solar_west', distanceMeters: 46, isAccessible: true, description: 'Crossroads towards Solar array block' },
  { id: 'e_solar_w_solar_e', source: 'node_solar_west', target: 'node_solar_east', distanceMeters: 15, isAccessible: true, description: 'Solar array walkway perimeter' }
];

export const SATELLITE_PATH_NODES: SatellitePathNode[] = DEFAULT_SATELLITE_PATH_NODES;
export const SATELLITE_PATH_EDGES: SatellitePathEdge[] = DEFAULT_SATELLITE_PATH_EDGES;

// Storage keys for custom network edits (v3 calibrated)
export const NETWORK_STORAGE_KEY_NODES = 'accesspath_network_nodes_v3';
export const NETWORK_STORAGE_KEY_EDGES = 'accesspath_network_edges_v3';

export function loadSatellitePathNetwork(): { nodes: SatellitePathNode[]; edges: SatellitePathEdge[] } {
  try {
    const rawNodes = localStorage.getItem(NETWORK_STORAGE_KEY_NODES);
    const rawEdges = localStorage.getItem(NETWORK_STORAGE_KEY_EDGES);
    if (rawNodes && rawEdges) {
      const parsedNodes = JSON.parse(rawNodes);
      const parsedEdges = JSON.parse(rawEdges);
      if (Array.isArray(parsedNodes) && Array.isArray(parsedEdges) && parsedNodes.length > 0) {
        return { nodes: parsedNodes, edges: parsedEdges };
      }
    }
  } catch (err) {
    console.warn('Error loading custom network from localStorage:', err);
  }
  return { nodes: DEFAULT_SATELLITE_PATH_NODES, edges: DEFAULT_SATELLITE_PATH_EDGES };
}

export function saveSatellitePathNetwork(nodes: SatellitePathNode[], edges: SatellitePathEdge[]): void {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY_NODES, JSON.stringify(nodes));
    localStorage.setItem(NETWORK_STORAGE_KEY_EDGES, JSON.stringify(edges));
  } catch (err) {
    console.warn('Error saving network to localStorage:', err);
  }
}

export function resetSatellitePathNetwork(): { nodes: SatellitePathNode[]; edges: SatellitePathEdge[] } {
  try {
    localStorage.removeItem(NETWORK_STORAGE_KEY_NODES);
    localStorage.removeItem(NETWORK_STORAGE_KEY_EDGES);
  } catch (err) {
    console.warn('Error resetting network in localStorage:', err);
  }
  return { nodes: DEFAULT_SATELLITE_PATH_NODES, edges: DEFAULT_SATELLITE_PATH_EDGES };
}

// Storage keys for custom satellite location edits (v3 calibrated)
export const SATELLITE_LOCATIONS_STORAGE_KEY = 'accesspath_satellite_locations_v3';

export function loadSatelliteLocations(): SatelliteLocation[] {
  try {
    const raw = localStorage.getItem(SATELLITE_LOCATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.every(
          (loc: any) =>
            loc &&
            Array.isArray(loc.position) &&
            loc.position.length === 2 &&
            typeof loc.position[0] === 'number' &&
            typeof loc.position[1] === 'number'
        );
        if (valid) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error loading custom satellite locations from localStorage:', err);
  }
  return SATELLITE_CAMPUS_LOCATIONS;
}

export function saveSatelliteLocations(locations: SatelliteLocation[]): void {
  try {
    localStorage.setItem(SATELLITE_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
  } catch (err) {
    console.warn('Error saving satellite locations to localStorage:', err);
  }
  // Also attempt async sync to backend satellite API if available
  try {
    fetch('http://127.0.0.1:8000/api/mewar/satellite-locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations })
    }).catch(() => {});
  } catch {}
}

export function resetSatelliteLocations(): SatelliteLocation[] {
  try {
    localStorage.removeItem(SATELLITE_LOCATIONS_STORAGE_KEY);
  } catch (err) {
    console.warn('Error resetting satellite locations:', err);
  }
  return SATELLITE_CAMPUS_LOCATIONS;
}

export async function fetchBackendSatelliteLocations(): Promise<SatelliteLocation[] | null> {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/mewar/satellite-locations');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.locations) && data.locations.length > 0) {
        const valid = data.locations.every(
          (loc: any) =>
            loc &&
            Array.isArray(loc.position) &&
            loc.position.length === 2 &&
            typeof loc.position[0] === 'number' &&
            typeof loc.position[1] === 'number'
        );
        if (valid) {
          return data.locations;
        }
      }
    }
  } catch {
    // Backend offline, fallback to localStorage/default
  }
  return null;
}
