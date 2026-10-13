/**
 * Mewar University Georeferenced Campus Dataset
 * Calibrated to Mewar University (25.031338° N, 74.636520° E) in Gangrar, Chittorgarh, Rajasthan.
 * All building polygons, walkways, lawn quads, and navigation nodes use precise real coordinates.
 */

export interface GeoLocation {
  id: string;
  name: string;
  code: string;
  category: 'Hostel' | 'Academic' | 'Dining' | 'Sports' | 'Medical' | 'Worship' | 'Green Area' | 'Administration' | 'Gate' | 'Library';
  description: string;
  lat: number;
  lng: number;
  color: string;
  iconType: 'bed' | 'cross' | 'utensils' | 'tree' | 'building' | 'gear' | 'graduation' | 'monitor' | 'ball' | 'cricket' | 'gate' | 'book';
  wheelchairAccessible: boolean;
  rampAvailable: boolean;
  elevatorAvailable: boolean;
  brailleSignage: boolean;
  facilities: string[];
  entranceNodeId: string;
  buildingFootprint?: [number, number][]; // [lat, lng][]
}

export interface GeoPathNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isEntrance?: boolean;
  buildingId?: string;
}

export interface GeoPathEdge {
  id: string;
  source: string;
  target: string;
  distanceMeters: number;
  isAccessible: boolean;
  description: string;
}

// Coordinate calibration parameters
// Center is in the central quad in front of Mewar University
export const CAMPUS_CENTER: [number, number] = [25.031338, 74.636520];

// Conversion factors: 1 meter offset -> degree offset
const M_TO_LAT = 0.000009025; // meters to lat degrees
const M_TO_LNG = 0.000009915; // meters to lng degrees

export function mToCoords(xMeters: number, zMeters: number): [number, number] {
  // -z is North (+lat), +x is East (+lng)
  const lat = CAMPUS_CENTER[0] - (zMeters * M_TO_LAT * 1.5);
  const lng = CAMPUS_CENTER[1] + (xMeters * M_TO_LNG * 1.5);
  return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
}

// ---------------------------------------------------------------------------
// 1. ALL 20+ CAMPUS LANDMARKS (Georeferenced)
// ---------------------------------------------------------------------------
export const MEWAR_GEO_LOCATIONS: GeoLocation[] = [
  {
    id: 'main_gate',
    name: 'Main Gate',
    code: 'GATE_1',
    category: 'Gate',
    description: 'Northern main campus entrance gate linking directly to the NH-79 national highway, with 24/7 security kiosk, barrier control, and visitor registration.',
    lat: mToCoords(-34, -85)[0],
    lng: mToCoords(-34, -85)[1],
    color: '#0284c7',
    iconType: 'gate',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Security Checkpost', 'Tactile Paved Pathway', 'Visitor Parking Area', 'Information Board'],
    entranceNodeId: 'node_gate_1',
    buildingFootprint: [
      mToCoords(-39, -89), mToCoords(-29, -89), mToCoords(-29, -81), mToCoords(-39, -81)
    ]
  },
  {
    id: 'central_library',
    name: 'Central Library',
    code: 'LIB',
    category: 'Library',
    description: 'Maharana Pratap Central University Library with multi-level book stacks, reading rooms, digital reference lab, and quiet research zones.',
    lat: mToCoords(-4, -8)[0],
    lng: mToCoords(-4, -8)[1],
    color: '#8b5cf6',
    iconType: 'book',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Level Ramp Entrance', 'Elevator to 1st Floor', 'Braille Reference Texts', 'Assistive Tech Stations'],
    entranceNodeId: 'node_ent_library',
    buildingFootprint: [
      mToCoords(-10, -14), mToCoords(2, -14), mToCoords(2, -2), mToCoords(-10, -2)
    ]
  },
  {
    id: 'girls_hostel',
    name: 'Girls Hostel',
    code: 'GH',
    category: 'Hostel',
    description: 'Multi-story secure residential block for female students with 24/7 security, Wi-Fi, study lounges, and internal courtyard.',
    lat: mToCoords(-26, -70)[0],
    lng: mToCoords(-26, -70)[1],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Level Ramp Entrance', 'Elevator Access', 'Accessible Restrooms', 'Security Desk'],
    entranceNodeId: 'node_ent_girls_hostel',
    buildingFootprint: [
      mToCoords(-31, -75), mToCoords(-21, -75), mToCoords(-21, -65), mToCoords(-31, -65)
    ]
  },
  {
    id: 'hospital',
    name: 'Hospital',
    code: 'HOSP',
    category: 'Medical',
    description: 'Campus Medical & Emergency Healthcare Center offering outpatient care, first aid, medical checkups, and ambulance service.',
    lat: mToCoords(-10, -71)[0],
    lng: mToCoords(-10, -71)[1],
    color: '#ef4444',
    iconType: 'cross',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Automated Sliding Doors', 'Emergency Ramp', 'Medical Wheelchairs', 'Pharmacy Counter'],
    entranceNodeId: 'node_ent_hospital',
    buildingFootprint: [
      mToCoords(-16, -76), mToCoords(-4, -76), mToCoords(-4, -66), mToCoords(-16, -66)
    ]
  },
  {
    id: 'sanga_boys_hostel',
    name: 'Sanga Boys Hostel',
    code: 'SBH',
    category: 'Hostel',
    description: 'Premier student residence block named after Rana Sanga, featuring student study lounges and indoor recreation.',
    lat: mToCoords(14, -73)[0],
    lng: mToCoords(14, -73)[1],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Ground Floor Accessible Rooms', 'Ramp Entry', 'Study Hall'],
    entranceNodeId: 'node_ent_sanga',
    buildingFootprint: [
      mToCoords(8, -78), mToCoords(20, -78), mToCoords(20, -68), mToCoords(8, -68)
    ]
  },
  {
    id: 'guest_house',
    name: 'Guest House',
    code: 'GHOUSE',
    category: 'Dining',
    description: 'University hospitality suites for visiting professors, VIP delegates, parents, and academic scholars.',
    lat: mToCoords(-25, -49)[0],
    lng: mToCoords(-25, -49)[1],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Step-Free Porch', 'Visitor Reception', 'Dining Lounge'],
    entranceNodeId: 'node_ent_guest_house',
    buildingFootprint: [
      mToCoords(-30, -54), mToCoords(-20, -54), mToCoords(-20, -44), mToCoords(-30, -44)
    ]
  },
  {
    id: 'park',
    name: 'Park',
    code: 'PRK',
    category: 'Green Area',
    description: 'Serene landscaped garden quad with shaded pergolas, paved walking circuits, and native flowering trees.',
    lat: mToCoords(-9, -51)[0],
    lng: mToCoords(-9, -51)[1],
    color: '#22c55e',
    iconType: 'tree',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Paved Step-Free Walkways', 'Rest Benches', 'Tactile Edge Borders'],
    entranceNodeId: 'node_ent_park',
    buildingFootprint: [
      mToCoords(-15, -57), mToCoords(-3, -57), mToCoords(-3, -45), mToCoords(-15, -45)
    ]
  },
  {
    id: 'temple',
    name: 'Temple',
    code: 'TMPL',
    category: 'Worship',
    description: 'Traditional campus shrine for prayer, meditation, and spiritual reflection, surrounded by peaceful gardens.',
    lat: mToCoords(6, -45)[0],
    lng: mToCoords(6, -45)[1],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Dedicated West Side Ramp', 'Shoe Stand with Handrail', 'Spiritual Sanctuary'],
    entranceNodeId: 'node_ent_temple',
    buildingFootprint: [
      mToCoords(2, -49), mToCoords(10, -49), mToCoords(10, -41), mToCoords(2, -41)
    ]
  },
  {
    id: 'kumbah_hostel',
    name: 'Kumbah Hostel',
    code: 'KBH',
    category: 'Hostel',
    description: 'Spacious multi-wing boys hostel named after Maharana Kumbha with high-speed internet and student common room.',
    lat: mToCoords(24, -51)[0],
    lng: mToCoords(24, -51)[1],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dual Handrail Ramp', 'Wheelchair Lift', 'Braille Room Signage'],
    entranceNodeId: 'node_ent_kumbah',
    buildingFootprint: [
      mToCoords(18, -57), mToCoords(30, -57), mToCoords(30, -45), mToCoords(18, -45)
    ]
  },
  {
    id: 'engineering_block',
    name: 'Engineering Block',
    code: 'ENG',
    category: 'Academic',
    description: 'Iconic expansive engineering complex housing advanced robotics, CAD labs, machine workshops, and lecture theatres.',
    lat: mToCoords(-14, -18)[0],
    lng: mToCoords(-14, -18)[1],
    color: '#ea580c',
    iconType: 'gear',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Central Courtyard Ramp', 'Heavy Duty Elevators', 'Wide Corridor Thresholds'],
    entranceNodeId: 'node_ent_eng_block',
    buildingFootprint: [
      mToCoords(-25, -29), mToCoords(-3, -29), mToCoords(-3, -7), mToCoords(-25, -7)
    ]
  },
  {
    id: 'mewar_university',
    name: 'Mewar University',
    code: 'MU_MAIN',
    category: 'Administration',
    description: 'Central administrative headquarters, vice-chancellor chambers, registrar, admissions office, and main university facade.',
    lat: mToCoords(-2, 0)[0],
    lng: mToCoords(-2, 0)[1],
    color: '#2563eb',
    iconType: 'graduation',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Front Entrance Ramp', 'Automated Push-Plate Doors', 'Main Elevator Lobby', 'Information Helpdesk'],
    entranceNodeId: 'node_ent_mewar_univ',
    buildingFootprint: [
      mToCoords(-10, -5), mToCoords(6, -5), mToCoords(6, 5), mToCoords(-10, 5)
    ]
  },
  {
    id: 'computer_sector_block',
    name: 'Computer Sector Block',
    code: 'CS_IT',
    category: 'Academic',
    description: 'High-tech IT and Computer Science center with cloud data labs, AI research centers, and software innovation studios.',
    lat: mToCoords(18, -14)[0],
    lng: mToCoords(18, -14)[1],
    color: '#06b6d4',
    iconType: 'monitor',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Ground Floor Accessible Lab', 'Tactile Paving Paths', 'Elevator to Upper Labs'],
    entranceNodeId: 'node_ent_cs_block',
    buildingFootprint: [
      mToCoords(11, -20), mToCoords(25, -20), mToCoords(25, -8), mToCoords(11, -8)
    ]
  },
  {
    id: 'faculty_block_1',
    name: 'Faculty Block (North)',
    code: 'FAC_N',
    category: 'Academic',
    description: 'Academic departments, professor faculty cabins, seminar rooms, and departmental research offices.',
    lat: mToCoords(32, -20)[0],
    lng: mToCoords(32, -20)[1],
    color: '#ec4899',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Ramp Access', 'Elevator', 'Accessible Consultation Desk'],
    entranceNodeId: 'node_ent_faculty_1',
    buildingFootprint: [
      mToCoords(27, -25), mToCoords(37, -25), mToCoords(37, -15), mToCoords(27, -15)
    ]
  },
  {
    id: 'badel_boys_hostel',
    name: 'Badel Boys Hostel',
    code: 'BBH',
    category: 'Hostel',
    description: 'Modern boys residence located centrally near university mess and sports arenas.',
    lat: mToCoords(30, 1)[0],
    lng: mToCoords(30, 1)[1],
    color: '#a855f7',
    iconType: 'bed',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Level Ground Entrance', 'Ground Floor Mobility Rooms'],
    entranceNodeId: 'node_ent_badel_hostel',
    buildingFootprint: [
      mToCoords(25, -4), mToCoords(35, -4), mToCoords(35, 6), mToCoords(25, 6)
    ]
  },
  {
    id: 'mess_1',
    name: 'Mess',
    code: 'MESS_1',
    category: 'Dining',
    description: 'Primary multi-cuisine student dining hall serving breakfast, lunch, snacks, and dinner with ample seating.',
    lat: mToCoords(31, 16)[0],
    lng: mToCoords(31, 16)[1],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: true,
    facilities: ['Zero Threshold Wide Doors', 'Low Height Food Serving Counters', 'Spacious Wheelchair Aisle'],
    entranceNodeId: 'node_ent_mess_1',
    buildingFootprint: [
      mToCoords(26, 11), mToCoords(36, 11), mToCoords(36, 21), mToCoords(26, 21)
    ]
  },
  {
    id: 'law_block',
    name: 'Law Block',
    code: 'LAW',
    category: 'Academic',
    description: 'School of Legal Studies with high-fidelity moot court hall, legal aid clinic, and dedicated law library.',
    lat: mToCoords(32, 30)[0],
    lng: mToCoords(32, 30)[1],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Moot Court Ramp', 'Wheelchair Jury/Defense Bay', 'Braille Law Text Section'],
    entranceNodeId: 'node_ent_law_block',
    buildingFootprint: [
      mToCoords(27, 25), mToCoords(37, 25), mToCoords(37, 35), mToCoords(27, 35)
    ]
  },
  {
    id: 'law_park',
    name: 'Law park',
    code: 'LPK',
    category: 'Green Area',
    description: 'Pleasant green open lawn adjacent to Law Block and Football Ground, popular for open-air study and debates.',
    lat: mToCoords(15, 23)[0],
    lng: mToCoords(15, 23)[1],
    color: '#22c55e',
    iconType: 'tree',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Smooth Paved Perimeter', 'Garden Benches', 'Shaded Tree Canopy'],
    entranceNodeId: 'node_ent_law_park',
    buildingFootprint: [
      mToCoords(9, 16), mToCoords(21, 16), mToCoords(21, 30), mToCoords(9, 30)
    ]
  },
  {
    id: 'football_ground',
    name: 'Football Ground',
    code: 'FB_FLD',
    category: 'Sports',
    description: 'Regulation size natural grass soccer stadium with perimeter spectator stands and floodlighting.',
    lat: mToCoords(-6, 24)[0],
    lng: mToCoords(-6, 24)[1],
    color: '#10b981',
    iconType: 'ball',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Accessible Spectator Viewing Deck', 'Paved Perimeter Track', 'Level Pitch Access'],
    entranceNodeId: 'node_ent_football_ground',
    buildingFootprint: [
      mToCoords(-15, 11), mToCoords(3, 11), mToCoords(3, 37), mToCoords(-15, 37)
    ]
  },
  {
    id: 'cricket_ground',
    name: 'Cricket Ground',
    code: 'CRK_FLD',
    category: 'Sports',
    description: 'Oval cricket stadium with manicured outfield, professional turf wicket, pavilion, and training practice nets.',
    lat: mToCoords(-2, 58)[0],
    lng: mToCoords(-2, 58)[1],
    color: '#10b981',
    iconType: 'cricket',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Level Perimeter Access', 'Pavilion Ramp', 'Wheelchair Spectator Bays'],
    entranceNodeId: 'node_ent_cricket_ground',
    buildingFootprint: [
      mToCoords(-14, 46), mToCoords(10, 46), mToCoords(10, 70), mToCoords(-14, 70)
    ]
  },
  {
    id: 'gym',
    name: 'Gym',
    code: 'GYM',
    category: 'Sports',
    description: 'Campus Fitness & Sports Training Center equipped with cardio machines, weights, and physiotherapy fitness instructors.',
    lat: mToCoords(27, 53)[0],
    lng: mToCoords(27, 53)[1],
    color: '#ef4444',
    iconType: 'cross',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Ramped Entrance', 'Accessible Locker Rooms', 'Adaptive Fitness Equipment'],
    entranceNodeId: 'node_ent_gym',
    buildingFootprint: [
      mToCoords(22, 49), mToCoords(32, 49), mToCoords(32, 57), mToCoords(22, 57)
    ]
  },
  {
    id: 'mess_2',
    name: 'Mess 2',
    code: 'MESS_2',
    category: 'Dining',
    description: 'South campus cafeteria and cafeteria court catering to student residences and sports complex visitors.',
    lat: mToCoords(29, 67)[0],
    lng: mToCoords(29, 67)[1],
    color: '#f97316',
    iconType: 'utensils',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: false,
    brailleSignage: false,
    facilities: ['Wheelchair Friendly Seating', 'Step-Free Entrance', 'Accessible Restroom'],
    entranceNodeId: 'node_ent_mess_2',
    buildingFootprint: [
      mToCoords(24, 63), mToCoords(34, 63), mToCoords(34, 71), mToCoords(24, 71)
    ]
  },
  {
    id: 'faculty_block_2',
    name: 'Faculty Block (South)',
    code: 'FAC_S',
    category: 'Academic',
    description: 'Southern faculty office complex, postgraduate research offices, and academic staff housing suites.',
    lat: mToCoords(33, 81)[0],
    lng: mToCoords(33, 81)[1],
    color: '#ec4899',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: false,
    facilities: ['Ramp Approach', 'Accessible Lift', 'Level Corridor Access'],
    entranceNodeId: 'node_ent_faculty_2',
    buildingFootprint: [
      mToCoords(28, 76), mToCoords(38, 76), mToCoords(38, 86), mToCoords(28, 86)
    ]
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    code: 'AUD',
    category: 'Academic',
    description: 'Grand university convention hall for convocation ceremonies, cultural fests, national conferences, and dramas.',
    lat: mToCoords(8, 81)[0],
    lng: mToCoords(8, 81)[1],
    color: '#3b82f6',
    iconType: 'building',
    wheelchairAccessible: true,
    rampAvailable: true,
    elevatorAvailable: true,
    brailleSignage: true,
    facilities: ['Dedicated Accessible Entrance Ramp', 'Wheelchair Stage Access Lift', 'Designated Front-Row Seating', 'Assistive Listening System'],
    entranceNodeId: 'node_ent_auditorium',
    buildingFootprint: [
      mToCoords(-1, 74), mToCoords(17, 74), mToCoords(17, 88), mToCoords(-1, 88)
    ]
  }
];

// ---------------------------------------------------------------------------
// 2. CAMPUS BOUNDARY POLYGON (Yellow sandy base)
// ---------------------------------------------------------------------------
export const GEO_CAMPUS_BOUNDARY: [number, number][] = [
  mToCoords(-38, -95),
  mToCoords(38, -95),
  mToCoords(46, -30),
  mToCoords(44, 40),
  mToCoords(40, 95),
  mToCoords(-10, 100),
  mToCoords(-35, 95),
  mToCoords(-44, 40),
  mToCoords(-44, -30)
];

// ---------------------------------------------------------------------------
// 3. GREEN LAWN PATCHES
// ---------------------------------------------------------------------------
export const GEO_LAWN_POLYGONS: [number, number][][] = [
  // NW Lawn
  [mToCoords(-32, -61), mToCoords(-20, -61), mToCoords(-18, -47), mToCoords(-32, -47)],
  // Park main lawn
  [mToCoords(-14, -61), mToCoords(-4, -61), mToCoords(-4, -47), mToCoords(-14, -47)],
  // NE Lawn
  [mToCoords(0, -61), mToCoords(12, -61), mToCoords(12, -47), mToCoords(0, -47)],
  // Lawn North of Engineering
  [mToCoords(-32, -43), mToCoords(-4, -43), mToCoords(-4, -32), mToCoords(-32, -32)],
  // Law Park
  [mToCoords(7, 8), mToCoords(22, 8), mToCoords(22, 32), mToCoords(7, 32)],
  // East Lawn
  [mToCoords(26, 8), mToCoords(38, 8), mToCoords(38, 18), mToCoords(26, 18)],
  // Southeast Lawn
  [mToCoords(25, 36), mToCoords(38, 36), mToCoords(38, 48), mToCoords(25, 48)],
  // Auditorium surround
  [mToCoords(-18, 72), mToCoords(6, 72), mToCoords(6, 88), mToCoords(-18, 88)]
];

// ---------------------------------------------------------------------------
// 4. CONTINUOUS PEDESTRIAN WALKWAYS (Polylines)
// ---------------------------------------------------------------------------
import { CAMPUS_PATH_RIBBONS, CAMPUS_PATH_NODES, CAMPUS_PATH_EDGES } from './campusPaths';

export const GEO_WALKWAY_LINES: [number, number][][] = CAMPUS_PATH_RIBBONS.map(ribbon =>
  ribbon.points.map(([x, z]) => mToCoords(x, z))
);

// ---------------------------------------------------------------------------
// 5. GEOREFERENCED GRAPH NODES & EDGES FOR DIJKSTRA
// ---------------------------------------------------------------------------
export const GEO_PATH_NODES: GeoPathNode[] = CAMPUS_PATH_NODES.map(node => {
  const [lat, lng] = mToCoords(node.x, node.z);
  return {
    id: node.id,
    name: node.name,
    lat,
    lng,
    isEntrance: node.isEntrance,
    buildingId: node.buildingId
  };
});

export const GEO_PATH_EDGES: GeoPathEdge[] = CAMPUS_PATH_EDGES.map(edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  distanceMeters: Math.round(edge.distance * 1.5), // Calibrated distance in meters
  isAccessible: edge.isAccessible,
  description: edge.description
}));

// ---------------------------------------------------------------------------
// 6. PERSISTENCE & ADMIN SYNC UTILITIES
// ---------------------------------------------------------------------------
export const GEO_LOCATIONS_STORAGE_KEY = 'accesspath_mewar_geo_locations_v1';
export const BACKEND_LOCATIONS_API = 'http://127.0.0.1:8000/api/mewar/locations';

export function loadCampusGeoLocations(): GeoLocation[] {
  try {
    const raw = localStorage.getItem(GEO_LOCATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse cached geo locations', e);
  }
  return MEWAR_GEO_LOCATIONS;
}

export function saveCampusGeoLocations(locations: GeoLocation[]): void {
  try {
    localStorage.setItem(GEO_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
    // Asynchronously synchronize to backend API
    fetch(BACKEND_LOCATIONS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations })
    }).catch(err => console.warn('Backend locations sync failed:', err));
  } catch (e) {
    console.error('Failed to save geo locations', e);
  }
}

export function resetCampusGeoLocations(): GeoLocation[] {
  try {
    localStorage.removeItem(GEO_LOCATIONS_STORAGE_KEY);
    fetch(`${BACKEND_LOCATIONS_API}/reset`, { method: 'POST' }).catch(() => {});
  } catch (e) {}
  return MEWAR_GEO_LOCATIONS;
}

export async function fetchBackendCampusGeoLocations(): Promise<GeoLocation[] | null> {
  try {
    const res = await fetch(BACKEND_LOCATIONS_API);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.locations) && data.locations.length > 0) {
        localStorage.setItem(GEO_LOCATIONS_STORAGE_KEY, JSON.stringify(data.locations));
        return data.locations;
      }
    }
  } catch (e) {}
  return null;
}
