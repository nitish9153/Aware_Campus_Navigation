/**
 * Mewar University Satellite Map Dataset
 * Strictly aligned with the 1024 x 1536 Mewar University satellite map imagery.
 * Uses Leaflet L.CRS.Simple where bounds are [[0, 0], [1536, 1024]].
 * Latitude = 0 (bottom) to 1536 (top)  => lat = 1536 - y_pixel
 * Longitude = 0 (left) to 1024 (right) => lng = x_pixel
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

export const MAP_IMAGE_WIDTH = 1024;
export const MAP_IMAGE_HEIGHT = 1536;
export const MAP_IMAGE_BOUNDS: [[number, number], [number, number]] = [[0, 0], [1536, 1024]];
export const MAP_IMAGE_URL = '/images/mewar-university-campus.png';
export const FALLBACK_IMAGE_URL = '/mewar-satellite-map.png';

// Scale factor: calibrated meters per pixel in the satellite image
export const METERS_PER_PIXEL = 0.45;

export function calculateEdgeDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const dx = p1[1] - p2[1];
  const dy = p1[0] - p2[0];
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  return Math.max(5, Math.round(distPixels * METERS_PER_PIXEL));
}

// ---------------------------------------------------------------------------
// 1. CAMPUS LOCATIONS IDENTIFIED ACCURATELY FROM SATELLITE IMAGE
// Coordinates correspond strictly to visible building positions and pins
// ---------------------------------------------------------------------------
export const SATELLITE_CAMPUS_LOCATIONS: SatelliteLocation[] = [
  {
    id: 'sanga_hostel',
    name: 'Sanga Hostel',
    hindiName: 'सांगा हॉस्टल',
    code: 'SBH',
    category: 'Hostel',
    description: 'Premier residential hostel for male students located at the northern perimeter with study halls and common areas.',
    position: [1441, 420],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Level Ramp Entrance', 'Accessible Ground Floor Rooms', 'Mess Access', 'Wi-Fi Lounge'],
    entranceNodeId: 'node_ent_sanga',
    aliases: ['Sanga Hostel', 'Sanga', 'Sanga Boys Hostel']
  },
  {
    id: 'kumba_hostel',
    name: 'Kumbah Hostel',
    hindiName: 'कुम्भा हॉस्टल',
    code: 'KBH',
    category: 'Hostel',
    description: 'Multi-wing residence named after Maharana Kumbha. Features ground floor Rooms 1–16, central corridor, and washrooms at both ends.',
    position: [1276, 442],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dedicated Entrance Ramp', 'Ground Floor Accessible Restrooms', 'Common Room'],
    entranceNodeId: 'node_ent_kumba',
    aliases: ['Kumbah Hostel – Ground Floor', 'Kumbah Hostel', 'Kumba Hostel', 'Kumbha Hostel', 'Kumba', 'Kumbha', 'KBH']
  },
  {
    id: 'girls_hostel',
    name: 'Girls Hostel',
    hindiName: 'गर्ल्स हॉस्टल',
    code: 'GH',
    category: 'Hostel',
    description: 'Secure multi-story residential block for female students with 24/7 security desk and inner courtyard.',
    position: [1346, 150],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Automated Sliding Door', 'Step-Free Ramp', 'Elevator', '24/7 Security'],
    entranceNodeId: 'node_ent_girls',
    aliases: ['Girls Hostel', 'GH', 'Womens Hostel']
  },
  {
    id: 'hospital',
    name: 'Hospital',
    hindiName: 'अस्पताल / स्वास्थ्य केंद्र',
    code: 'HOSP',
    category: 'Medical',
    description: 'University Health & Medical Center with round-the-clock emergency care, consultations, and ambulance station.',
    position: [1406, 245],
    color: '#ef4444',
    iconType: 'cross',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Emergency Ambulance Bay', 'Wide Wheelchair Ramp', 'Medical Equipment', 'Pharmacy'],
    entranceNodeId: 'node_ent_hospital',
    aliases: ['Hospital', 'Health Center', 'Medical Center', 'Clinic', 'Ambulance']
  },
  {
    id: 'gate_1',
    name: 'Gate No. 1',
    code: 'GATE_1',
    category: 'Gate',
    description: 'Northern main campus entrance gate linking directly to the national highway, with guard cabin and visitor registration.',
    position: [1226, 135],
    color: '#64748b',
    iconType: 'gate',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Level Paved Access', 'Security Post', 'Barrier Free Gate'],
    entranceNodeId: 'node_gate_1',
    aliases: ['Gate No. 1', 'Gate 1', 'North Gate', 'Main Highway Gate']
  },
  {
    id: 'main_building',
    name: 'Mewar University Main Building',
    hindiName: 'मेवाड़ विश्वविद्यालय मुख्य भवन',
    code: 'MAIN_BLD',
    category: 'Administration',
    description: 'Central administrative and academic headquarters housing Vice Chancellor chambers, Registrar, Admissions, and Academic Directorate.',
    position: [1106, 270],
    color: '#2563eb',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Main Front Entrance Ramp', 'Passenger Elevators', 'Accessible Information Desk', 'Braille Floor Directory'],
    entranceNodeId: 'node_ent_mewar',
    aliases: ['Mewar University Main Building', 'Main Building', 'Mewar University', 'Admin Block', 'Central Academic Block']
  },
  {
    id: 'gandhi_museum',
    name: 'Gandhi Museum',
    hindiName: 'गांधी म्यूज़ियम',
    code: 'MUSEUM',
    category: 'Academic',
    description: 'Cultural memorial and archival museum dedicated to Mahatma Gandhi, displaying historical artifacts and research literature.',
    position: [926, 380],
    color: '#0284c7',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Level Ground Access', 'Tactile Display Aids', 'Audio Guides'],
    entranceNodeId: 'node_ent_gandhi',
    aliases: ['Gandhi Museum', 'Museum', 'Gandhi Smriti', 'Cultural Museum']
  },
  {
    id: 'gate_2',
    name: 'Gate No. 2',
    code: 'GATE_2',
    category: 'Gate',
    description: 'Central campus entrance gate directly opening towards Gandhi Museum and the central administrative quad.',
    position: [821, 320],
    color: '#64748b',
    iconType: 'gate',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Vehicular & Pedestrian Portal', 'Curb Cut Access', 'Security Checkpoint'],
    entranceNodeId: 'node_gate_2',
    aliases: ['Gate No. 2', 'Gate 2', 'Central Gate', 'Museum Gate']
  },
  {
    id: 'mess',
    name: 'Mess',
    hindiName: 'छात्र मेस / भोजनालय',
    code: 'MESS_1',
    category: 'Dining',
    description: 'Spacious campus dining hall with silver-paneled roof catering to students and staff with nutritious multi-cuisine meals.',
    position: [866, 620],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Zero Threshold Double Doors', 'Low Height Serving Counters', 'Wheelchair Friendly Aisles'],
    entranceNodeId: 'node_ent_mess',
    aliases: ['Mess', 'Dining Hall', 'Student Mess', 'Canteen', 'Food Court']
  },
  {
    id: 'law_block',
    name: 'Law Block',
    hindiName: 'विधि संकाय भवन',
    code: 'LAW',
    category: 'Academic',
    description: 'Faculty of Legal Studies featuring state-of-the-art moot courtroom, legal aid clinic, and jurisprudence library.',
    position: [791, 750],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Moot Court Ramp Access', 'Designated Wheelchair Jury Desk', 'Braille Signage'],
    entranceNodeId: 'node_ent_law',
    aliases: ['Law Block', 'Faculty of Law', 'Law Department', 'Law College']
  },
  {
    id: 'football_ground',
    name: 'Football Ground',
    hindiName: 'फुटबॉल मैदान',
    code: 'FB_FLD',
    category: 'Sports',
    description: 'Official collegiate grass soccer stadium with perimeter spectator stands, floodlights, and paved jogging path.',
    position: [707, 488],
    color: '#10b981',
    iconType: 'ball',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Accessible Spectator Area', 'Level Field Access', 'Paved Perimeter Path'],
    entranceNodeId: 'node_ent_fb',
    aliases: ['Football Ground', 'Football Field', 'Soccer Ground', 'Soccer Field']
  },
  {
    id: 'cricket_ground',
    name: 'Cricket Ground',
    hindiName: 'क्रिकेट मैदान',
    code: 'CRK_FLD',
    category: 'Sports',
    description: 'Expansive cricket arena featuring regulation pitch, turf boundary, practice nets, and spectator seating.',
    position: [416, 580],
    color: '#10b981',
    iconType: 'cricket',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Smooth Access Pathway', 'Pavilion Ramp', 'Accessible Viewing Bays'],
    entranceNodeId: 'node_ent_cricket',
    aliases: ['Cricket Ground', 'Cricket Stadium', 'Cricket Pitch']
  },
  {
    id: 'gym',
    name: 'Gym',
    hindiName: 'व्यायामशाला / जिम',
    code: 'GYM',
    category: 'Sports',
    description: 'University Sports Training & Fitness Gymnasium equipped with cardio equipment, resistance weights, and indoor courts.',
    position: [454, 796],
    color: '#ef4444',
    iconType: 'cross',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Ramped Entrance', 'Accessible Locker Rooms', 'Adaptive Fitness Gear'],
    entranceNodeId: 'node_ent_gym',
    aliases: ['Gym', 'Gymnasium', 'Fitness Center', 'Sports Training Center']
  },
  {
    id: 'guest_house',
    name: 'Guest House',
    code: 'GHOUSE',
    category: 'Dining',
    description: 'University VIP hospitality suites and dining facility for visiting dignitaries, academic scholars, and parents.',
    position: [1296, 240],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Step-Free Porch Entrance', 'Reception Lobby', 'Executive Dining'],
    entranceNodeId: 'node_ent_guest_house',
    aliases: ['Guest House', 'VIP Guest House', 'Guest House Dining']
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    code: 'AUD',
    category: 'Academic',
    description: 'University convention hall hosting convocations, theatrical events, national seminars, and cultural festivals.',
    position: [240, 260],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dedicated Accessible Entrance Ramp', 'Wheelchair Stage Access Lift', 'Front-Row Seating Spaces'],
    entranceNodeId: 'node_ent_auditorium',
    aliases: ['Auditorium', 'Convocation Hall', 'Main Auditorium', 'Events Center']
  }
];

// ---------------------------------------------------------------------------
// 2. CALIBRATED ROAD & WALKWAY GRAPH
// Strictly mapped to visible roads, corners, intersections, and building entrances
// ---------------------------------------------------------------------------
export const DEFAULT_SATELLITE_PATH_NODES: SatellitePathNode[] = [
  // --- Building Entrances ---
  { id: 'node_ent_sanga', name: 'Sanga Hostel Entrance', position: [1441, 420], isEntrance: true, buildingId: 'sanga_hostel' },
  { id: 'node_ent_kumba', name: 'Kumba Hostel Entrance', position: [1276, 442], isEntrance: true, buildingId: 'kumba_hostel' },
  { id: 'node_ent_hospital', name: 'Hospital Entrance', position: [1406, 245], isEntrance: true, buildingId: 'hospital' },
  { id: 'node_ent_girls', name: 'Girls Hostel Entrance', position: [1346, 150], isEntrance: true, buildingId: 'girls_hostel' },
  { id: 'node_gate_1', name: 'Gate No. 1 Entrance', position: [1226, 135], isEntrance: true, buildingId: 'gate_1' },
  { id: 'node_ent_mewar', name: 'Mewar University Main Entrance', position: [1106, 270], isEntrance: true, buildingId: 'main_building' },
  { id: 'node_ent_gandhi', name: 'Gandhi Museum Entrance', position: [926, 380], isEntrance: true, buildingId: 'gandhi_museum' },
  { id: 'node_gate_2', name: 'Gate No. 2 Entrance', position: [821, 320], isEntrance: true, buildingId: 'gate_2' },
  { id: 'node_ent_mess', name: 'Mess Main Entrance', position: [866, 620], isEntrance: true, buildingId: 'mess' },
  { id: 'node_ent_law', name: 'Law Block Entrance', position: [791, 750], isEntrance: true, buildingId: 'law_block' },
  { id: 'node_ent_fb', name: 'Football Ground Pavilion', position: [707, 488], isEntrance: true, buildingId: 'football_ground' },
  { id: 'node_ent_cricket', name: 'Cricket Ground Pavilion', position: [416, 580], isEntrance: true, buildingId: 'cricket_ground' },
  { id: 'node_ent_gym', name: 'Gym Entrance', position: [454, 796], isEntrance: true, buildingId: 'gym' },
  { id: 'node_ent_guest_house', name: 'Guest House Entrance', position: [1296, 240], isEntrance: true, buildingId: 'guest_house' },
  { id: 'node_ent_auditorium', name: 'Auditorium Portal', position: [240, 260], isEntrance: true, buildingId: 'auditorium' },

  // --- West Perimeter Highway ---
  { id: 'node_hwy_n', name: 'West Highway North Apex', position: [1436, 60] },
  { id: 'node_hwy_g1', name: 'West Highway at Gate 1', position: [1226, 70] },
  { id: 'node_hwy_mid', name: 'West Highway Mid Junction', position: [1016, 140] },
  { id: 'node_hwy_g2', name: 'West Highway at Gate 2', position: [821, 200] },
  { id: 'node_hwy_fb', name: 'West Highway beside Football', position: [676, 260] },
  { id: 'node_hwy_cricket', name: 'West Highway beside Cricket', position: [416, 360] },
  { id: 'node_hwy_s', name: 'West Highway South Apex', position: [186, 440] },

  // --- North Sector: Gate 1, Girls Hostel, Hospital, Hostels ---
  { id: 'node_rd_g1_avenue', name: 'Gate 1 Campus Boulevard', position: [1226, 180] },
  { id: 'node_rd_girls_approach', name: 'Girls Hostel Approach Road', position: [1306, 150] },
  { id: 'node_rd_hosp_junc', name: 'Hospital North-West Junction', position: [1396, 245] },
  { id: 'node_rd_north_avenue_mid', name: 'North Avenue East of Hospital', position: [1396, 340] },
  { id: 'node_rd_sanga_approach', name: 'Sanga Hostel Approach Road', position: [1396, 420] },
  { id: 'node_rd_kumba_approach', name: 'Kumba Hostel Approach Road', position: [1276, 380] },
  { id: 'node_rd_north_south_spine', name: 'North-South Academic Spine (North)', position: [1176, 380] },

  // --- Academic Core: Mewar University, Museum, Mess, Law ---
  { id: 'node_rd_univ_west_drive', name: 'University West Concourse', position: [1096, 350] },
  { id: 'node_rd_g2_concourse', name: 'Gate 2 Inbound Concourse', position: [876, 350] },
  { id: 'node_rd_museum_approach', name: 'Gandhi Museum Concourse', position: [926, 350] },
  { id: 'node_rd_central_crossroads', name: 'Central Campus Crossroads', position: [876, 460] },
  { id: 'node_rd_mess_approach', name: 'Avenue at Mess Entrance', position: [866, 550] },
  { id: 'node_rd_law_approach', name: 'Law Block Approach Walkway', position: [826, 680] },

  // --- Sports Sector: Football, Cricket, Gym, Auditorium ---
  { id: 'node_rd_fb_north', name: 'Football Ground North Perimeter', position: [796, 460] },
  { id: 'node_rd_fb_west', name: 'Football Ground West Perimeter', position: [707, 400] },
  { id: 'node_rd_fb_east', name: 'Football Ground East Perimeter', position: [707, 580] },
  { id: 'node_rd_fb_south', name: 'Football Ground South Perimeter', position: [616, 500] },
  { id: 'node_rd_cricket_north', name: 'Cricket Ground North Perimeter', position: [476, 540] },
  { id: 'node_rd_cricket_west', name: 'Cricket Ground West Perimeter', position: [416, 460] },
  { id: 'node_rd_cricket_east', name: 'Cricket Ground East Perimeter', position: [416, 700] },
  { id: 'node_rd_gym_approach', name: 'Gymnasium Approach Walkway', position: [454, 730] },
  { id: 'node_rd_aud_approach', name: 'Auditorium Approach Driveway', position: [240, 360] }
];

export const DEFAULT_SATELLITE_PATH_EDGES: SatellitePathEdge[] = [
  // --- West Perimeter Highway ---
  { id: 'e_hwy_n_g1', source: 'node_hwy_n', target: 'node_hwy_g1', distanceMeters: 95, isAccessible: true, description: 'West Highway North towards Gate 1' },
  { id: 'e_hwy_g1_mid', source: 'node_hwy_g1', target: 'node_hwy_mid', distanceMeters: 100, isAccessible: true, description: 'West Highway between Gate 1 and Gate 2' },
  { id: 'e_hwy_mid_g2', source: 'node_hwy_mid', target: 'node_hwy_g2', distanceMeters: 92, isAccessible: true, description: 'West Highway approaching Gate 2' },
  { id: 'e_hwy_g2_fb', source: 'node_hwy_g2', target: 'node_hwy_fb', distanceMeters: 70, isAccessible: true, description: 'West Highway beside Football Ground' },
  { id: 'e_hwy_fb_cricket', source: 'node_hwy_fb', target: 'node_hwy_cricket', distanceMeters: 125, isAccessible: true, description: 'West Highway beside Cricket Ground' },
  { id: 'e_hwy_cricket_s', source: 'node_hwy_cricket', target: 'node_hwy_s', distanceMeters: 110, isAccessible: true, description: 'West Highway Southern stretch' },

  // --- Gate 1 & North Sector Walkways ---
  { id: 'e_hwy_g1_turn', source: 'node_hwy_g1', target: 'node_gate_1', distanceMeters: 29, isAccessible: true, description: 'Turn into Gate No. 1' },
  { id: 'e_g1_avenue', source: 'node_gate_1', target: 'node_rd_g1_avenue', distanceMeters: 20, isAccessible: true, description: 'Gate 1 Entrance Portal' },
  { id: 'e_g1_girls', source: 'node_rd_g1_avenue', target: 'node_rd_girls_approach', distanceMeters: 38, isAccessible: true, description: 'Boulevard towards Girls Hostel' },
  { id: 'e_girls_ent', source: 'node_rd_girls_approach', target: 'node_ent_girls', distanceMeters: 18, isAccessible: true, description: 'Girls Hostel Entrance Walkway' },
  { id: 'e_girls_hosp', source: 'node_rd_girls_approach', target: 'node_rd_hosp_junc', distanceMeters: 59, isAccessible: true, description: 'Paved Road from Girls Hostel to Hospital' },
  { id: 'e_hosp_ent', source: 'node_rd_hosp_junc', target: 'node_ent_hospital', distanceMeters: 5, isAccessible: true, description: 'Hospital Entrance Drive' },
  { id: 'e_guesthouse_ent', source: 'node_rd_g1_avenue', target: 'node_ent_guest_house', distanceMeters: 42, isAccessible: true, description: 'Walkway to Guest House' },
  { id: 'e_hosp_north_mid', source: 'node_rd_hosp_junc', target: 'node_rd_north_avenue_mid', distanceMeters: 43, isAccessible: true, description: 'Avenue heading east towards Hostels' },
  { id: 'e_mid_sanga', source: 'node_rd_north_avenue_mid', target: 'node_rd_sanga_approach', distanceMeters: 36, isAccessible: true, description: 'Road leading to Sanga Hostel' },
  { id: 'e_sanga_ent', source: 'node_rd_sanga_approach', target: 'node_ent_sanga', distanceMeters: 20, isAccessible: true, description: 'Sanga Hostel Entrance Walkway' },
  { id: 'e_sanga_kumba', source: 'node_rd_sanga_approach', target: 'node_rd_kumba_approach', distanceMeters: 57, isAccessible: true, description: 'Connecting Road between Hostels' },
  { id: 'e_kumba_ent', source: 'node_rd_kumba_approach', target: 'node_ent_kumba', distanceMeters: 28, isAccessible: true, description: 'Kumba Hostel Entrance Walkway' },
  { id: 'e_kumba_spine', source: 'node_rd_kumba_approach', target: 'node_rd_north_south_spine', distanceMeters: 45, isAccessible: true, description: 'Walkway heading south towards University' },

  // --- University & Academic Core ---
  { id: 'e_spine_univ', source: 'node_rd_north_south_spine', target: 'node_rd_univ_west_drive', distanceMeters: 39, isAccessible: true, description: 'Spine Avenue along University facade' },
  { id: 'e_univ_ent', source: 'node_rd_univ_west_drive', target: 'node_ent_mewar', distanceMeters: 36, isAccessible: true, description: 'Mewar University Main Entrance Ramp' },
  { id: 'e_univ_museum', source: 'node_rd_univ_west_drive', target: 'node_rd_museum_approach', distanceMeters: 77, isAccessible: true, description: 'Boulevard towards Gandhi Museum' },
  { id: 'e_museum_ent', source: 'node_rd_museum_approach', target: 'node_ent_gandhi', distanceMeters: 14, isAccessible: true, description: 'Gandhi Museum Entrance Walkway' },
  { id: 'e_museum_g2', source: 'node_rd_museum_approach', target: 'node_rd_g2_concourse', distanceMeters: 23, isAccessible: true, description: 'Avenue towards Gate 2' },
  { id: 'e_g2_ent', source: 'node_gate_2', target: 'node_rd_g2_concourse', distanceMeters: 28, isAccessible: true, description: 'Gate No. 2 Entry Portal' },
  { id: 'e_hwy_g2_turn', source: 'node_hwy_g2', target: 'node_gate_2', distanceMeters: 54, isAccessible: true, description: 'Turn from Highway into Gate 2' },
  { id: 'e_g2_crossroads', source: 'node_rd_g2_concourse', target: 'node_rd_central_crossroads', distanceMeters: 50, isAccessible: true, description: 'Boulevard towards Central Crossroads' },
  { id: 'e_crossroads_mess', source: 'node_rd_central_crossroads', target: 'node_rd_mess_approach', distanceMeters: 41, isAccessible: true, description: 'Avenue towards Mess and Law Block' },
  { id: 'e_mess_ent', source: 'node_rd_mess_approach', target: 'node_ent_mess', distanceMeters: 32, isAccessible: true, description: 'Mess Main Entrance Walkway' },
  { id: 'e_mess_law', source: 'node_rd_mess_approach', target: 'node_rd_law_approach', distanceMeters: 61, isAccessible: true, description: 'Paved Avenue to Law Block' },
  { id: 'e_law_ent', source: 'node_rd_law_approach', target: 'node_ent_law', distanceMeters: 35, isAccessible: true, description: 'Law Block Entrance Ramp' },

  // --- Sports & South Campus Walkways ---
  { id: 'e_crossroads_fb_n', source: 'node_rd_central_crossroads', target: 'node_rd_fb_north', distanceMeters: 36, isAccessible: true, description: 'Road towards Football Ground' },
  { id: 'e_fb_n_w', source: 'node_rd_fb_north', target: 'node_rd_fb_west', distanceMeters: 48, isAccessible: true, description: 'Football Ground West Promenade' },
  { id: 'e_fb_n_e', source: 'node_rd_fb_north', target: 'node_rd_fb_east', distanceMeters: 67, isAccessible: true, description: 'Football Ground East Promenade' },
  { id: 'e_fb_w_ent', source: 'node_rd_fb_west', target: 'node_ent_fb', distanceMeters: 40, isAccessible: true, description: 'Football Ground Pavilion Entrance' },
  { id: 'e_fb_w_s', source: 'node_rd_fb_west', target: 'node_rd_fb_south', distanceMeters: 61, isAccessible: true, description: 'Football Ground South-West Perimeter' },
  { id: 'e_fb_e_s', source: 'node_rd_fb_east', target: 'node_rd_fb_south', distanceMeters: 55, isAccessible: true, description: 'Football Ground South-East Perimeter' },
  { id: 'e_fb_cricket', source: 'node_rd_fb_south', target: 'node_rd_cricket_north', distanceMeters: 66, isAccessible: true, description: 'Connecting Avenue towards Cricket Ground' },
  { id: 'e_cricket_ent', source: 'node_rd_cricket_north', target: 'node_ent_cricket', distanceMeters: 33, isAccessible: true, description: 'Cricket Ground Pavilion Entrance' },
  { id: 'e_cricket_n_w', source: 'node_rd_cricket_north', target: 'node_rd_cricket_west', distanceMeters: 45, isAccessible: true, description: 'Cricket Ground West Perimeter' },
  { id: 'e_cricket_n_e', source: 'node_rd_cricket_north', target: 'node_rd_cricket_east', distanceMeters: 77, isAccessible: true, description: 'Cricket Ground East Perimeter' },
  { id: 'e_cricket_w_hwy', source: 'node_rd_cricket_west', target: 'node_hwy_cricket', distanceMeters: 45, isAccessible: true, description: 'Exit from Cricket Ground to West Highway' },
  { id: 'e_cricket_e_gym', source: 'node_rd_cricket_east', target: 'node_rd_gym_approach', distanceMeters: 23, isAccessible: true, description: 'Avenue heading to Gymnasium' },
  { id: 'e_gym_ent', source: 'node_rd_gym_approach', target: 'node_ent_gym', distanceMeters: 30, isAccessible: true, description: 'Gym Entrance Ramp' },
  { id: 'e_hwy_s_aud', source: 'node_hwy_s', target: 'node_rd_aud_approach', distanceMeters: 43, isAccessible: true, description: 'Avenue to Auditorium' },
  { id: 'e_aud_ent', source: 'node_rd_aud_approach', target: 'node_ent_auditorium', distanceMeters: 45, isAccessible: true, description: 'Auditorium Entrance' }
];

export const SATELLITE_PATH_NODES: SatellitePathNode[] = DEFAULT_SATELLITE_PATH_NODES;
export const SATELLITE_PATH_EDGES: SatellitePathEdge[] = DEFAULT_SATELLITE_PATH_EDGES;

// Storage keys for custom network edits
export const NETWORK_STORAGE_KEY_NODES = 'accesspath_network_nodes_v2';
export const NETWORK_STORAGE_KEY_EDGES = 'accesspath_network_edges_v2';

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

// Storage keys for custom satellite location edits
export const SATELLITE_LOCATIONS_STORAGE_KEY = 'accesspath_satellite_locations_v2';

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

