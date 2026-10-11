/**
 * Mewar University Satellite Map Dataset
 * Coordinated strictly to the uploaded 1024 x 1536 Google satellite map image.
 * Uses Leaflet L.CRS.Simple where bounds are [[0, 0], [1536, 1024]].
 * Latitude = 0 (bottom) to 1536 (top)
 * Longitude = 0 (left) to 1024 (right)
 */

export interface SatelliteLocation {
  id: string;
  name: string;
  hindiName?: string;
  code: string;
  category: 'Hostel' | 'Academic' | 'Dining' | 'Sports' | 'Medical' | 'Worship' | 'Gate' | 'Green Area' | 'Administration';
  description: string;
  position: [number, number]; // [lat, lng] in Leaflet CRS.Simple (lat = 1536 - y_pixel, lng = x_pixel)
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
export const MAP_IMAGE_URL = '/mewar-satellite-map.png';

// Scale factor: approximately 0.45 meters per pixel in the satellite image
export const METERS_PER_PIXEL = 0.45;

export function calculateEdgeDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const dx = p1[1] - p2[1];
  const dy = p1[0] - p2[0];
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  return Math.max(5, Math.round(distPixels * METERS_PER_PIXEL));
}

// ---------------------------------------------------------------------------
// 1. ALL CAMPUS LOCATIONS IDENTIFIED FROM SATELLITE IMAGE
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
    position: [1475, 385],
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
    name: 'Kumbha Hostel',
    hindiName: 'कुम्भा हॉस्टल',
    code: 'KBH',
    category: 'Hostel',
    description: 'Multi-wing residence named after Maharana Kumbha, situated east of the main academic avenue.',
    position: [1301, 455],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dedicated Entrance Ramp', 'Ground Floor Accessible Restrooms', 'Common Room'],
    entranceNodeId: 'node_ent_kumba',
    aliases: ['Kumbha Hostel', 'Kumba hostel', 'Kumba', 'Kumbha']
  },
  {
    id: 'girls_hostel',
    name: 'Girls Hostel',
    code: 'GH',
    category: 'Hostel',
    description: 'Secure multi-story residential block for female students with 24/7 guard desk, biometric access, and inner courtyard.',
    position: [1336, 185],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Automated Sliding Door', 'Step-Free Ramp', 'Elevator', '24/7 Security'],
    entranceNodeId: 'node_ent_girls_hostel',
    aliases: ['Girls Hostel', 'GH', 'Womens Hostel']
  },
  {
    id: 'hospital',
    name: 'Hospital',
    code: 'HOSP',
    category: 'Medical',
    description: 'University Health & Medical Center with round-the-clock emergency care, doctor consultations, and ambulance station.',
    position: [1436, 250],
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
    id: 'guest_house',
    name: 'Guest House',
    code: 'GHOUSE',
    category: 'Dining',
    description: 'University VIP hospitality suites and dining facility for visiting dignitaries, academic scholars, and parents.',
    position: [1260, 240],
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
    id: 'gate_1',
    name: 'Gate No. 1',
    code: 'GATE_1',
    category: 'Gate',
    description: 'Northern main campus entrance gate linking directly to the national highway, with guard cabin and visitor registration.',
    position: [1231, 165],
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
    id: 'gate_2',
    name: 'Gate No. 2',
    code: 'GATE_2',
    category: 'Gate',
    description: 'Central campus entrance gate directly opening towards Gandhi Museum and the central administrative quad.',
    position: [866, 280],
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
    id: 'mewar_university',
    name: 'Mewar University',
    hindiName: 'मेवाड़ विश्वविद्यालय',
    code: 'MU_MAIN',
    category: 'Administration',
    description: 'Central administrative and academic headquarters housing Vice Chancellor chambers, Registrar, Admissions, and Academic Directorate.',
    position: [1060, 380],
    color: '#2563eb',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Main Front Entrance Ramp', 'Passenger Elevators', 'Accessible Information Desk', 'Braille Floor Directory'],
    entranceNodeId: 'node_ent_mewar_univ',
    aliases: ['Mewar University', 'Main Building', 'Admin Block', 'Central Academic Block']
  },
  {
    id: 'main_building',
    name: 'Main Building',
    hindiName: 'मुख्य भवन',
    code: 'MAIN_BLD',
    category: 'Administration',
    description: 'The iconic central campus building containing the central administrative offices, conference halls, and registrar division.',
    position: [1060, 380],
    color: '#2563eb',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Main Front Entrance Ramp', 'Passenger Elevators', 'Accessible Information Desk', 'Braille Floor Directory'],
    entranceNodeId: 'node_ent_mewar_univ',
    aliases: ['Main Building', 'Mewar University', 'Administrative Complex', 'Main Campus Office']
  },
  {
    id: 'gandhi_museum',
    name: 'Gandhi Museum',
    hindiName: 'गांधी म्यूज़ियम',
    code: 'MUSEUM',
    category: 'Academic',
    description: 'Cultural memorial and archival museum dedicated to Mahatma Gandhi, displaying historical artifacts and research literature.',
    position: [932, 375],
    color: '#0284c7',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Level Ground Access', 'Tactile Display Aids', 'Audio Guides'],
    entranceNodeId: 'node_ent_gandhi_museum',
    aliases: ['Gandhi Museum', 'Museum', 'Gandhi Smriti', 'Cultural Museum']
  },
  {
    id: 'engineering_block',
    name: 'Engineering Block',
    code: 'ENG',
    category: 'Academic',
    description: 'Major STEM academic complex featuring high-tech robotics labs, mechanical workshops, CAD suites, and lecture halls.',
    position: [1155, 335],
    color: '#ea580c',
    iconType: 'gear',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Accessible Lab Benches', 'Central Elevators', 'Dual Handrail Corridors'],
    entranceNodeId: 'node_ent_eng_block',
    aliases: ['Engineering Block', 'Engineering', 'Faculty of Engineering', 'Engg Block']
  },
  {
    id: 'computer_sector_block',
    name: 'Computer Sector Block',
    code: 'CS_IT',
    category: 'Academic',
    description: 'Advanced computing research center, artificial intelligence labs, cloud data centers, and IT development spaces.',
    position: [950, 565],
    color: '#06b6d4',
    iconType: 'monitor',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Ground Floor Accessible Labs', 'Wide Sliding Doors', 'Elevator Access'],
    entranceNodeId: 'node_ent_cs_block',
    aliases: ['Computer Sector Block', 'Computer Sector', 'CS Block', 'IT Department', 'Computer Science']
  },
  {
    id: 'mess',
    name: 'Mess',
    code: 'MESS_1',
    category: 'Dining',
    description: 'Spacious campus dining hall with silver-paneled roof catering to students and staff with nutritious multi-cuisine meals.',
    position: [880, 590],
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
    code: 'LAW',
    category: 'Academic',
    description: 'Faculty of Legal Studies featuring state-of-the-art moot courtroom, legal aid clinic, and legal jurisprudence library.',
    position: [800, 720],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Moot Court Ramp Access', 'Designated Wheelchair Jury Desk', 'Braille Signage'],
    entranceNodeId: 'node_ent_law_block',
    aliases: ['Law Block', 'Faculty of Law', 'Law Department', 'Law College']
  },
  {
    id: 'law_park',
    name: 'Law Park',
    code: 'LPK',
    category: 'Green Area',
    description: 'Shaded botanical lawn adjacent to Law Block and Football Ground, popular for open-air study, debates, and relaxation.',
    position: [770, 625],
    color: '#22c55e',
    iconType: 'tree',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Paved Perimeter Walkway', 'Rest Benches', 'Shaded Gazebos'],
    entranceNodeId: 'node_ent_law_park',
    aliases: ['Law Park', 'Park near Law Block', 'Law Garden']
  },
  {
    id: 'football_ground',
    name: 'Football Ground',
    code: 'FB_FLD',
    category: 'Sports',
    description: 'Official collegiate grass soccer stadium with perimeter spectator stands, floodlights, and paved jogging path.',
    position: [770, 430],
    color: '#10b981',
    iconType: 'ball',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Accessible Spectator Area', 'Level Field Access', 'Paved Perimeter Path'],
    entranceNodeId: 'node_ent_football',
    aliases: ['Football Ground', 'Football Field', 'Soccer Ground', 'Soccer Field']
  },
  {
    id: 'cricket_ground',
    name: 'Cricket Ground',
    code: 'CRK_FLD',
    category: 'Sports',
    description: 'Expansive cricket arena featuring regulation pitch, turf boundary, practice nets, and spectator seating.',
    position: [530, 580],
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
    code: 'GYM',
    category: 'Sports',
    description: 'University Sports Training & Fitness Gymnasium equipped with cardio equipment, resistance weights, and indoor badminton court.',
    position: [460, 780],
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
    id: 'temple',
    name: 'Temple',
    code: 'TMPL',
    category: 'Worship',
    description: 'Tranquil campus shrine for peaceful meditation, prayer, and cultural celebrations, surrounded by native flora.',
    position: [1200, 290],
    color: '#3b82f6',
    iconType: 'worship',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Dedicated Entrance Ramp', 'Handrail Guided Pathway', 'Peaceful Garden Setting'],
    entranceNodeId: 'node_ent_temple',
    aliases: ['Temple', 'Mandir', 'Campus Temple', 'Shrine', 'Prayer Area']
  },
  {
    id: 'park',
    name: 'Park',
    code: 'PRK',
    category: 'Green Area',
    description: 'Lush landscaped green quad with flowering trees, paved circular walkways, and student reading pavilions.',
    position: [1240, 200],
    color: '#22c55e',
    iconType: 'tree',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Paved Walking Circuits', 'Accessible Rest Benches', 'Garden Lighting'],
    entranceNodeId: 'node_ent_park',
    aliases: ['Park', 'Campus Park', 'Green Park', 'Botanical Garden']
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    code: 'AUD',
    category: 'Academic',
    description: 'Grand university convention hall hosting convocation ceremonies, theatrical events, national seminars, and cultural festivals.',
    position: [240, 200],
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
// 2. DEFAULT VERIFIED ROAD & WALKWAY GRAPH
// Strictly mapped to visible roads, corners, intersections, and building entrances
// ---------------------------------------------------------------------------
export const DEFAULT_SATELLITE_PATH_NODES: SatellitePathNode[] = [
  // --- North Sector: Sanga Hostel & Kumbha Hostel ---
  { id: 'node_ent_sanga', name: 'Sanga Hostel Entrance', position: [1475, 385], isEntrance: true, buildingId: 'sanga_hostel' },
  { id: 'node_rd_sanga_corner', name: 'Sanga North Driveway Corner', position: [1475, 342] },
  { id: 'node_rd_sanga_hospital', name: 'Sanga - Hospital Avenue Junction', position: [1386, 342] },
  { id: 'node_rd_sanga_mid', name: 'Sanga - Kumbha Walkway Junction', position: [1361, 342] },
  { id: 'node_rd_kumba_nw', name: 'Kumbha North-West Walkway Turn', position: [1361, 415] },
  { id: 'node_rd_kumba_w_mid', name: 'Kumbha West Walkway Access', position: [1301, 415] },
  { id: 'node_ent_kumba', name: 'Kumbha Hostel Entrance', position: [1301, 455], isEntrance: true, buildingId: 'kumba_hostel' },
  { id: 'node_rd_kumba_sw', name: 'Kumbha South-West Corner', position: [1286, 415] },
  { id: 'node_rd_kumba_s_corner', name: 'Kumbha South Avenue Corner', position: [1246, 432] },
  { id: 'node_rd_kumba_s_east', name: 'Kumbha South Avenue East', position: [1246, 520] },
  { id: 'node_rd_kumba_cross', name: 'North Campus 4-Way Intersection', position: [1286, 342] },

  // --- Hospital & Girls Hostel Sector ---
  { id: 'node_ent_hospital', name: 'Hospital Main Entrance', position: [1436, 250], isEntrance: true, buildingId: 'hospital' },
  { id: 'node_rd_hospital_front', name: 'Hospital Entrance Road', position: [1386, 250] },
  { id: 'node_rd_girls_hosp_junc', name: 'Girls Hostel - Hospital Junction', position: [1286, 235] },
  { id: 'node_ent_girls_hostel', name: 'Girls Hostel Entrance', position: [1336, 185], isEntrance: true, buildingId: 'girls_hostel' },
  { id: 'node_rd_girls_front', name: 'Girls Hostel Approach Road', position: [1286, 185] },
  { id: 'node_gate_1', name: 'Gate No. 1 Entrance', position: [1231, 165], isEntrance: true, buildingId: 'gate_1' },

  // --- Guest House, Park, Temple ---
  { id: 'node_ent_guest_house', name: 'Guest House Entrance', position: [1260, 240], isEntrance: true, buildingId: 'guest_house' },
  { id: 'node_ent_temple', name: 'Temple Entrance', position: [1200, 290], isEntrance: true, buildingId: 'temple' },
  { id: 'node_ent_park', name: 'Park Entrance', position: [1240, 200], isEntrance: true, buildingId: 'park' },

  // --- West Perimeter Highway ---
  { id: 'node_hwy_north', name: 'West Road North Apex', position: [1486, 45] },
  { id: 'node_hwy_g1', name: 'West Road at Gate 1', position: [1231, 120] },
  { id: 'node_hwy_mid', name: 'West Road Mid Highway', position: [1050, 200] },
  { id: 'node_hwy_g2', name: 'West Road at Gate 2', position: [866, 240] },
  { id: 'node_hwy_fb', name: 'West Road at Football Corner', position: [686, 320] },
  { id: 'node_hwy_cricket', name: 'West Road at Cricket Corner', position: [380, 420] },
  { id: 'node_hwy_south', name: 'West Road South Apex', position: [100, 520] },

  // --- Gate 2 & Academic Core ---
  { id: 'node_gate_2', name: 'Gate No. 2 Entrance', position: [866, 280], isEntrance: true, buildingId: 'gate_2' },
  { id: 'node_rd_g2_avenue', name: 'Gate 2 Central Avenue', position: [866, 350] },
  { id: 'node_rd_univ_nw', name: 'Mewar University North-West Approach', position: [1180, 342] },
  { id: 'node_ent_eng_block', name: 'Engineering Block Entrance', position: [1155, 335], isEntrance: true, buildingId: 'engineering_block' },
  { id: 'node_rd_univ_west', name: 'Mewar University West Concourse', position: [1060, 345] },
  { id: 'node_ent_mewar_univ', name: 'Mewar University Main Entrance', position: [1060, 380], isEntrance: true, buildingId: 'mewar_university' },
  { id: 'node_rd_univ_east', name: 'Mewar University East Road', position: [1060, 470] },
  { id: 'node_ent_cs_block', name: 'Computer Sector Block Entrance', position: [950, 565], isEntrance: true, buildingId: 'computer_sector_block' },
  { id: 'node_rd_museum_front', name: 'Gandhi Museum Concourse', position: [932, 345] },
  { id: 'node_ent_gandhi_museum', name: 'Gandhi Museum Entrance', position: [932, 375], isEntrance: true, buildingId: 'gandhi_museum' },
  { id: 'node_rd_central_cross', name: 'Central Campus Crossroads', position: [866, 430] },
  { id: 'node_rd_mess_approach', name: 'Central Avenue at Mess', position: [866, 550] },
  { id: 'node_ent_mess', name: 'Mess Main Entrance', position: [880, 590], isEntrance: true, buildingId: 'mess' },
  { id: 'node_rd_law_approach', name: 'Law Block Approach Road', position: [866, 680] },
  { id: 'node_ent_law_block', name: 'Law Block Entrance', position: [800, 720], isEntrance: true, buildingId: 'law_block' },
  { id: 'node_ent_law_park', name: 'Law Park Gate', position: [770, 625], isEntrance: true, buildingId: 'law_park' },

  // --- Sports & South Campus ---
  { id: 'node_rd_fb_n', name: 'Football Ground North Walkway', position: [866, 430] },
  { id: 'node_rd_fb_w', name: 'Football Ground West Walkway', position: [770, 370] },
  { id: 'node_rd_fb_e', name: 'Football Ground East Walkway', position: [770, 560] },
  { id: 'node_rd_fb_s', name: 'Football Ground South Walkway', position: [686, 470] },
  { id: 'node_ent_football', name: 'Football Ground Pavilion Entrance', position: [770, 430], isEntrance: true, buildingId: 'football_ground' },

  { id: 'node_rd_cricket_n', name: 'Cricket Ground North Perimeter', position: [686, 560] },
  { id: 'node_rd_cricket_w', name: 'Cricket Ground West Perimeter', position: [530, 480] },
  { id: 'node_rd_cricket_e', name: 'Cricket Ground East Perimeter', position: [530, 680] },
  { id: 'node_rd_cricket_s', name: 'Cricket Ground South Perimeter', position: [380, 580] },
  { id: 'node_ent_cricket', name: 'Cricket Ground Main Pavilion', position: [530, 580], isEntrance: true, buildingId: 'cricket_ground' },

  { id: 'node_rd_gym_approach', name: 'Gym Access Walkway', position: [460, 720] },
  { id: 'node_ent_gym', name: 'Gym Entrance', position: [460, 780], isEntrance: true, buildingId: 'gym' },
  { id: 'node_ent_auditorium', name: 'Auditorium Main Portal', position: [240, 200], isEntrance: true, buildingId: 'auditorium' },
  { id: 'node_rd_aud_approach', name: 'Auditorium Approach Road', position: [240, 380] }
];

export const DEFAULT_SATELLITE_PATH_EDGES: SatellitePathEdge[] = [
  // --- Sanga & Kumbha verified roads ---
  { id: 'e_sanga_ent_corner', source: 'node_ent_sanga', target: 'node_rd_sanga_corner', distanceMeters: 19, isAccessible: true, description: 'Paved driveway from Sanga Hostel Entrance' },
  { id: 'e_sanga_corner_hosp', source: 'node_rd_sanga_corner', target: 'node_rd_sanga_hospital', distanceMeters: 40, isAccessible: true, description: 'Avenue heading south past Sanga Hostel' },
  { id: 'e_sanga_hosp_mid', source: 'node_rd_sanga_hospital', target: 'node_rd_sanga_mid', distanceMeters: 11, isAccessible: true, description: 'Avenue past Hospital east facade' },
  { id: 'e_sanga_mid_kumba_nw', source: 'node_rd_sanga_mid', target: 'node_rd_kumba_nw', distanceMeters: 33, isAccessible: true, description: 'Verified paved pedestrian walkway between Sanga and Kumbha' },
  { id: 'e_kumba_nw_w_mid', source: 'node_rd_kumba_nw', target: 'node_rd_kumba_w_mid', distanceMeters: 27, isAccessible: true, description: 'Paved walkway west of Kumbha Hostel building' },
  { id: 'e_kumba_w_mid_ent', source: 'node_rd_kumba_w_mid', target: 'node_ent_kumba', distanceMeters: 18, isAccessible: true, description: 'Ramped entrance walkway into Kumbha Hostel' },
  { id: 'e_kumba_w_mid_sw', source: 'node_rd_kumba_w_mid', target: 'node_rd_kumba_sw', distanceMeters: 7, isAccessible: true, description: 'Paved access path around Kumbha west corner' },
  { id: 'e_sanga_mid_cross', source: 'node_rd_sanga_mid', target: 'node_rd_kumba_cross', distanceMeters: 34, isAccessible: true, description: 'Avenue leading south to 4-Way intersection' },
  { id: 'e_cross_kumba_sw', source: 'node_rd_kumba_cross', target: 'node_rd_kumba_sw', distanceMeters: 33, isAccessible: true, description: 'East-west road connection to Kumbha Hostel' },
  { id: 'e_kumba_sw_s_corner', source: 'node_rd_kumba_sw', target: 'node_rd_kumba_s_corner', distanceMeters: 20, isAccessible: true, description: 'Road curving south past Kumbha Hostel' },
  { id: 'e_kumba_s_corner_east', source: 'node_rd_kumba_s_corner', target: 'node_rd_kumba_s_east', distanceMeters: 40, isAccessible: true, description: 'Road in front of Kumbha Annex' },
  { id: 'e_kumba_s_east_univ_e', source: 'node_rd_kumba_s_east', target: 'node_rd_univ_east', distanceMeters: 87, isAccessible: true, description: 'Road from Kumbha Annex to University East Road' },

  // --- Hospital & Girls Hostel ---
  { id: 'e_hosp_ent_road', source: 'node_ent_hospital', target: 'node_rd_hospital_front', distanceMeters: 23, isAccessible: true, description: 'Paved entrance spur to Hospital' },
  { id: 'e_hosp_front_sanga', source: 'node_rd_hospital_front', target: 'node_rd_sanga_hospital', distanceMeters: 41, isAccessible: true, description: 'Cross-walkway from Hospital to Sanga Avenue' },
  { id: 'e_hosp_front_junc', source: 'node_rd_hospital_front', target: 'node_rd_girls_hosp_junc', distanceMeters: 45, isAccessible: true, description: 'Paved road south from Hospital' },
  { id: 'e_girls_junc_cross', source: 'node_rd_girls_hosp_junc', target: 'node_rd_kumba_cross', distanceMeters: 48, isAccessible: true, description: 'Avenue from Girls/Hospital junction to 4-Way intersection' },
  { id: 'e_girls_junc_front', source: 'node_rd_girls_hosp_junc', target: 'node_rd_girls_front', distanceMeters: 23, isAccessible: true, description: 'Connecting road to Girls Hostel front' },
  { id: 'e_girls_ent_front', source: 'node_ent_girls_hostel', target: 'node_rd_girls_front', distanceMeters: 23, isAccessible: true, description: 'Main paved entrance to Girls Hostel' },
  { id: 'e_girls_front_gate1', source: 'node_rd_girls_front', target: 'node_gate_1', distanceMeters: 26, isAccessible: true, description: 'Avenue from Gate 1 to Girls Hostel' },
  { id: 'e_gate1_hwy', source: 'node_gate_1', target: 'node_hwy_g1', distanceMeters: 20, isAccessible: true, description: 'Exit avenue connecting Gate 1 to West Road' },

  // --- Guest House, Park, Temple ---
  { id: 'e_guesthouse_junc', source: 'node_ent_guest_house', target: 'node_rd_girls_hosp_junc', distanceMeters: 12, isAccessible: true, description: 'Walkway to Guest House' },
  { id: 'e_park_gate1', source: 'node_ent_park', target: 'node_gate_1', distanceMeters: 16, isAccessible: true, description: 'Garden path to Park' },
  { id: 'e_temple_univ_nw', source: 'node_ent_temple', target: 'node_rd_univ_nw', distanceMeters: 25, isAccessible: true, description: 'Paved ramp to Temple' },

  // --- West Highway ---
  { id: 'e_hwy_n_g1', source: 'node_hwy_north', target: 'node_hwy_g1', distanceMeters: 120, isAccessible: true, description: 'West Road towards Gate 1' },
  { id: 'e_hwy_g1_mid', source: 'node_hwy_g1', target: 'node_hwy_mid', distanceMeters: 89, isAccessible: true, description: 'West Road past Gate 1' },
  { id: 'e_hwy_mid_g2', source: 'node_hwy_mid', target: 'node_hwy_g2', distanceMeters: 85, isAccessible: true, description: 'West Road heading south to Gate 2' },
  { id: 'e_hwy_g2_gate2', source: 'node_hwy_g2', target: 'node_gate_2', distanceMeters: 18, isAccessible: true, description: 'Turn into Gate No. 2' },
  { id: 'e_hwy_g2_fb', source: 'node_hwy_g2', target: 'node_hwy_fb', distanceMeters: 89, isAccessible: true, description: 'West Road beside Football Ground' },
  { id: 'e_hwy_fb_cricket', source: 'node_hwy_fb', target: 'node_hwy_cricket', distanceMeters: 145, isAccessible: true, description: 'West Road beside Cricket Ground' },
  { id: 'e_hwy_cricket_south', source: 'node_hwy_cricket', target: 'node_hwy_south', distanceMeters: 134, isAccessible: true, description: 'West Road southern stretch' },

  // --- Academic Core ---
  { id: 'e_cross_univ_nw', source: 'node_rd_kumba_cross', target: 'node_rd_univ_nw', distanceMeters: 48, isAccessible: true, description: 'Central Avenue south towards University' },
  { id: 'e_univ_nw_eng', source: 'node_rd_univ_nw', target: 'node_ent_eng_block', distanceMeters: 12, isAccessible: true, description: 'Promenade to Engineering Block' },
  { id: 'e_univ_nw_west', source: 'node_rd_univ_nw', target: 'node_rd_univ_west', distanceMeters: 54, isAccessible: true, description: 'Avenue along University west facade' },
  { id: 'e_univ_west_ent', source: 'node_rd_univ_west', target: 'node_ent_mewar_univ', distanceMeters: 16, isAccessible: true, description: 'Main central entrance portal to Mewar University' },
  { id: 'e_univ_west_museum', source: 'node_rd_univ_west', target: 'node_rd_museum_front', distanceMeters: 58, isAccessible: true, description: 'Promenade past Gandhi Museum' },
  { id: 'e_museum_front_ent', source: 'node_rd_museum_front', target: 'node_ent_gandhi_museum', distanceMeters: 14, isAccessible: true, description: 'Main entrance walkway to Gandhi Museum' },
  { id: 'e_museum_g2_ave', source: 'node_rd_museum_front', target: 'node_rd_g2_avenue', distanceMeters: 30, isAccessible: true, description: 'Central Avenue towards Gate 2' },
  { id: 'e_gate2_ave', source: 'node_gate_2', target: 'node_rd_g2_avenue', distanceMeters: 32, isAccessible: true, description: 'Gate 2 entry boulevard' },
  { id: 'e_g2_ave_cross', source: 'node_rd_g2_avenue', target: 'node_rd_central_cross', distanceMeters: 36, isAccessible: true, description: 'Central Crossroads connecting to Mess and Sports' },
  { id: 'e_univ_west_east', source: 'node_rd_univ_west', target: 'node_rd_univ_east', distanceMeters: 56, isAccessible: true, description: 'East promenade through Academic Block' },
  { id: 'e_univ_east_cross', source: 'node_rd_univ_east', target: 'node_rd_central_cross', distanceMeters: 90, isAccessible: true, description: 'Avenue from University East to Central Crossroads' },
  { id: 'e_univ_east_cs', source: 'node_rd_univ_east', target: 'node_ent_cs_block', distanceMeters: 65, isAccessible: true, description: 'Walkway to Computer Sector Block' },

  // --- Mess & Law Block ---
  { id: 'e_cross_mess', source: 'node_rd_central_cross', target: 'node_rd_mess_approach', distanceMeters: 54, isAccessible: true, description: 'Avenue towards Mess and Law Block' },
  { id: 'e_mess_ent', source: 'node_rd_mess_approach', target: 'node_ent_mess', distanceMeters: 19, isAccessible: true, description: 'Double-door entrance to Mess' },
  { id: 'e_mess_law', source: 'node_rd_mess_approach', target: 'node_rd_law_approach', distanceMeters: 59, isAccessible: true, description: 'Walkway east towards Law Block' },
  { id: 'e_law_ent', source: 'node_rd_law_approach', target: 'node_ent_law_block', distanceMeters: 35, isAccessible: true, description: 'Main entrance ramp to Law Block' },
  { id: 'e_mess_law_park', source: 'node_rd_mess_approach', target: 'node_ent_law_park', distanceMeters: 54, isAccessible: true, description: 'Paved path to Law Park' },

  // --- Football Ground Perimeter ---
  { id: 'e_cross_fb_w', source: 'node_rd_central_cross', target: 'node_rd_fb_w', distanceMeters: 51, isAccessible: true, description: 'Football Ground west approach' },
  { id: 'e_fb_w_ent', source: 'node_rd_fb_w', target: 'node_ent_football', distanceMeters: 27, isAccessible: true, description: 'Main gate to Football Ground' },
  { id: 'e_cross_fb_e', source: 'node_rd_central_cross', target: 'node_rd_fb_e', distanceMeters: 73, isAccessible: true, description: 'Football Ground east walkway' },
  { id: 'e_fb_w_s', source: 'node_rd_fb_w', target: 'node_rd_fb_s', distanceMeters: 59, isAccessible: true, description: 'Football Ground southwest perimeter path' },
  { id: 'e_fb_e_s', source: 'node_rd_fb_e', target: 'node_rd_fb_s', distanceMeters: 56, isAccessible: true, description: 'Football Ground southeast perimeter path' },

  // --- Cricket Ground & Gym ---
  { id: 'e_fb_s_cricket_n', source: 'node_rd_fb_s', target: 'node_rd_cricket_n', distanceMeters: 41, isAccessible: true, description: 'Connecting walkway between Football and Cricket Grounds' },
  { id: 'e_cricket_n_ent', source: 'node_rd_cricket_n', target: 'node_ent_cricket', distanceMeters: 71, isAccessible: true, description: 'Entrance to Cricket Ground Pavilion' },
  { id: 'e_cricket_n_w', source: 'node_rd_cricket_n', target: 'node_rd_cricket_w', distanceMeters: 79, isAccessible: true, description: 'Cricket Ground west boundary road' },
  { id: 'e_cricket_n_e', source: 'node_rd_cricket_n', target: 'node_rd_cricket_e', distanceMeters: 88, isAccessible: true, description: 'Cricket Ground east boundary road' },
  { id: 'e_cricket_w_s', source: 'node_rd_cricket_w', target: 'node_rd_cricket_s', distanceMeters: 81, isAccessible: true, description: 'Cricket Ground southwest road' },
  { id: 'e_cricket_e_s', source: 'node_rd_cricket_e', target: 'node_rd_cricket_s', distanceMeters: 81, isAccessible: true, description: 'Cricket Ground southeast road' },
  { id: 'e_cricket_e_gym', source: 'node_rd_cricket_e', target: 'node_rd_gym_approach', distanceMeters: 37, isAccessible: true, description: 'Paved walkway to Gymnasium' },
  { id: 'e_gym_ent', source: 'node_rd_gym_approach', target: 'node_ent_gym', distanceMeters: 27, isAccessible: true, description: 'Ramped entrance to Gym' },
  { id: 'e_cricket_w_hwy', source: 'node_rd_cricket_w', target: 'node_hwy_cricket', distanceMeters: 73, isAccessible: true, description: 'Exit from Cricket Ground to West Road' },

  // --- Auditorium ---
  { id: 'e_hwy_s_aud', source: 'node_hwy_south', target: 'node_rd_aud_approach', distanceMeters: 89, isAccessible: true, description: 'Driveway to Auditorium' },
  { id: 'e_aud_approach_ent', source: 'node_rd_aud_approach', target: 'node_ent_auditorium', distanceMeters: 81, isAccessible: true, description: 'Main portal to Auditorium' }
];

export const SATELLITE_PATH_NODES: SatellitePathNode[] = DEFAULT_SATELLITE_PATH_NODES;
export const SATELLITE_PATH_EDGES: SatellitePathEdge[] = DEFAULT_SATELLITE_PATH_EDGES;

// Storage keys for custom network edits
export const NETWORK_STORAGE_KEY_NODES = 'accesspath_network_nodes_v1';
export const NETWORK_STORAGE_KEY_EDGES = 'accesspath_network_edges_v1';

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
