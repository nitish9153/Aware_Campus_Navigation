/**
 * Mewar University Campus Path Geometry & Topology
 * Recreated with exact fidelity from the reference 3D map.
 */

export interface PathNode {
  id: string;
  name: string;
  x: number;
  z: number;
  isEntrance?: boolean;
  buildingId?: string;
}

export interface PathEdge {
  id: string;
  source: string;
  target: string;
  distance: number;
  isAccessible: boolean;
  description: string;
}

export interface PathRibbon {
  id: string;
  points: [number, number][]; // [x, z] coordinates along the ribbon centerline
  width: number;
}

// ---------------------------------------------------------------------------
// 1. EXACT GRAPH NODES (Junctions, Intersections & Entrances)
// Coordinate System:
// X: -42 (West perimeter road) to +42 (East boundary)
// Z: -80 (North hostels) to +90 (South auditorium)
// ---------------------------------------------------------------------------
export const CAMPUS_PATH_NODES: PathNode[] = [
  // --- North Zone: Girls Hostel, Hospital, Sanga, Kumbah ---
  { id: 'node_ent_girls_hostel', name: 'Girls Hostel Entrance', x: -26, z: -63, isEntrance: true, buildingId: 'girls_hostel' },
  { id: 'node_junc_north_road_girls', name: 'West Road - Girls Hostel Branch', x: -34, z: -63 },
  { id: 'node_junc_girls_hospital', name: 'Girls Hostel & Hospital Junction', x: -18, z: -63 },
  { id: 'node_ent_hospital', name: 'Hospital Entrance', x: -10, z: -63, isEntrance: true, buildingId: 'hospital' },
  { id: 'node_junc_hospital_east', name: 'Hospital East Crossroads', x: -2, z: -63 },
  { id: 'node_ent_sanga', name: 'Sanga Boys Hostel Entrance', x: 14, z: -65, isEntrance: true, buildingId: 'sanga_boys_hostel' },
  { id: 'node_junc_north_sanga', name: 'North Hostel Concourse', x: 14, z: -63 },
  { id: 'node_junc_kumbah_north', name: 'Kumbah North Path', x: 24, z: -63 },
  { id: 'node_ent_kumbah', name: 'Kumbah Hostel Entrance', x: 24, z: -45, isEntrance: true, buildingId: 'kumbah_hostel' },

  // --- Upper-Mid Zone: Guest House, Park, Temple ---
  { id: 'node_junc_west_road_guesthouse', name: 'West Road - Guest House Turn', x: -34, z: -45 },
  { id: 'node_ent_guest_house', name: 'Guest House Entrance', x: -25, z: -43, isEntrance: true, buildingId: 'guest_house' },
  { id: 'node_junc_park_west', name: 'Park West Walkway', x: -16, z: -45 },
  { id: 'node_ent_park', name: 'Park Center', x: -9, z: -45, isEntrance: true, buildingId: 'park' },
  { id: 'node_junc_park_east', name: 'Park & Temple Junction', x: -2, z: -45 },
  { id: 'node_ent_temple', name: 'Temple Entrance Ramp', x: 6, z: -38, isEntrance: true, buildingId: 'temple' },
  { id: 'node_junc_temple_east', name: 'Temple East Concourse', x: 14, z: -45 },
  { id: 'node_junc_kumbah_south', name: 'Kumbah South Crossroads', x: 24, z: -35 },

  // --- Engineering Complex & Central Quad ---
  { id: 'node_junc_west_road_eng_north', name: 'West Road - Engineering North Gate', x: -34, z: -30 },
  { id: 'node_junc_eng_north_walk', name: 'Engineering North Promenade', x: -14, z: -30 },
  { id: 'node_ent_eng_block_north', name: 'Engineering Block North Portal', x: -14, z: -27, isEntrance: true, buildingId: 'engineering_block' },
  { id: 'node_junc_eng_west_walk', name: 'Engineering West Flank', x: -25, z: -15 },
  { id: 'node_junc_eng_east_walk', name: 'Engineering East Flank', x: -3, z: -15 },
  { id: 'node_ent_eng_block', name: 'Engineering Block Main Entrance', x: -14, z: -6, isEntrance: true, buildingId: 'engineering_block' },
  { id: 'node_junc_eng_south_walk', name: 'Engineering South Promenade', x: -14, z: -6 },
  { id: 'node_junc_west_road_eng_south', name: 'West Road - Engineering South Gate', x: -34, z: -6 },

  // --- Mewar University & Computer Sector Block ---
  { id: 'node_ent_mewar_univ', name: 'Mewar University Main Facade', x: -2, z: 6, isEntrance: true, buildingId: 'mewar_university' },
  { id: 'node_junc_univ_central_plaza', name: 'Mewar University Central Plaza', x: 5, z: 6 },
  { id: 'node_ent_cs_block', name: 'Computer Sector Block Entrance', x: 18, z: -6, isEntrance: true, buildingId: 'computer_sector_block' },
  { id: 'node_junc_cs_south', name: 'Computer Sector South Walkway', x: 18, z: 6 },
  { id: 'node_ent_faculty_1', name: 'Faculty Block North Entrance', x: 32, z: -13, isEntrance: true, buildingId: 'faculty_block_1' },
  { id: 'node_junc_east_spine_north', name: 'East Spine North Terminal', x: 24, z: -13 },

  // --- Middle East Spine: Badel Hostel, Mess, Law Block, Law Park ---
  { id: 'node_junc_east_spine_badel', name: 'East Spine - Badel Hostel Junction', x: 24, z: 6 },
  { id: 'node_ent_badel_hostel', name: 'Badel Boys Hostel Entrance', x: 30, z: 6, isEntrance: true, buildingId: 'badel_boys_hostel' },
  { id: 'node_junc_east_spine_mess1', name: 'East Spine - Mess Junction', x: 24, z: 20 },
  { id: 'node_ent_mess_1', name: 'Mess Entrance', x: 31, z: 20, isEntrance: true, buildingId: 'mess_1' },
  { id: 'node_junc_east_spine_law', name: 'East Spine - Law Block Junction', x: 24, z: 34 },
  { id: 'node_ent_law_block', name: 'Law Block Entrance', x: 32, z: 34, isEntrance: true, buildingId: 'law_block' },
  { id: 'node_ent_law_park', name: 'Law Park Gate', x: 15, z: 20, isEntrance: true, buildingId: 'law_park' },
  { id: 'node_junc_law_park_west', name: 'Law Park West Walkway', x: 6, z: 20 },

  // --- Central Sports Zone: Football Ground ---
  { id: 'node_junc_central_football_n', name: 'Central Avenue - Football North Gate', x: 5, z: 10 },
  { id: 'node_ent_football_ground', name: 'Football Ground Main Gate', x: -6, z: 10, isEntrance: true, buildingId: 'football_ground' },
  { id: 'node_junc_fb_west', name: 'Football Ground West Perimeter', x: -16, z: 24 },
  { id: 'node_junc_fb_south', name: 'Football Ground South Perimeter', x: -6, z: 38 },
  { id: 'node_junc_west_road_football', name: 'West Road - Football Field Cross', x: -34, z: 24 },
  { id: 'node_junc_central_sports_mid', name: 'Central Avenue - Sports Mid Cross', x: 5, z: 38 },

  // --- South Sports Zone: Cricket Ground ---
  { id: 'node_junc_cricket_north', name: 'Cricket Ground North Ring', x: -2, z: 45 },
  { id: 'node_ent_cricket_ground', name: 'Cricket Ground Pavilion Entrance', x: -2, z: 48, isEntrance: true, buildingId: 'cricket_ground' },
  { id: 'node_junc_cricket_west', name: 'Cricket Ground West Ring', x: -14, z: 58 },
  { id: 'node_junc_cricket_south', name: 'Cricket Ground South Ring', x: -2, z: 70 },
  { id: 'node_junc_cricket_east', name: 'Cricket Ground East Ring', x: 10, z: 58 },
  { id: 'node_junc_west_road_cricket', name: 'West Road - Cricket Ground Access', x: -34, z: 58 },

  // --- South East Strip: Gym, Mess 2, Faculty Block South ---
  { id: 'node_junc_east_spine_gym', name: 'East Spine - Gym Junction', x: 23, z: 50 },
  { id: 'node_ent_gym', name: 'Gym Entrance', x: 27, z: 50, isEntrance: true, buildingId: 'gym' },
  { id: 'node_junc_east_spine_mess2', name: 'East Spine - Mess 2 Junction', x: 23, z: 64 },
  { id: 'node_ent_mess_2', name: 'Mess 2 Entrance', x: 29, z: 64, isEntrance: true, buildingId: 'mess_2' },
  { id: 'node_junc_east_spine_fac2', name: 'East Spine - Faculty South Junction', x: 23, z: 78 },
  { id: 'node_ent_faculty_2', name: 'Faculty Block South Entrance', x: 33, z: 78, isEntrance: true, buildingId: 'faculty_block_2' },

  // --- South Apex: Auditorium & South Concourse ---
  { id: 'node_junc_auditorium_plaza', name: 'Auditorium Grand Plaza', x: 8, z: 74 },
  { id: 'node_ent_auditorium', name: 'Auditorium Main Portal', x: 8, z: 77, isEntrance: true, buildingId: 'auditorium' },
  { id: 'node_junc_south_road_turn', name: 'South Road Auditorium Turn', x: -20, z: 82 },
  { id: 'node_junc_south_connector_east', name: 'South East Concourse Connector', x: 18, z: 74 }
];

// ---------------------------------------------------------------------------
// 2. CONNECTED GRAPH EDGES
// Strictly connecting neighboring path nodes along the visible white paths.
// ---------------------------------------------------------------------------
export const CAMPUS_PATH_EDGES: PathEdge[] = [
  // West Perimeter Road
  { id: 'e_road_1', source: 'node_junc_north_road_girls', target: 'node_junc_west_road_guesthouse', distance: 18, isAccessible: true, description: 'West Road (Past Girls Hostel)' },
  { id: 'e_road_2', source: 'node_junc_west_road_guesthouse', target: 'node_junc_west_road_eng_north', distance: 15, isAccessible: true, description: 'West Road (Past Guest House)' },
  { id: 'e_road_3', source: 'node_junc_west_road_eng_north', target: 'node_junc_west_road_eng_south', distance: 24, isAccessible: true, description: 'West Road (Past Engineering Block)' },
  { id: 'e_road_4', source: 'node_junc_west_road_eng_south', target: 'node_junc_west_road_football', distance: 30, isAccessible: true, description: 'West Road (Past Football Ground)' },
  { id: 'e_road_5', source: 'node_junc_west_road_football', target: 'node_junc_west_road_cricket', distance: 34, isAccessible: true, description: 'West Road (Past Cricket Ground)' },
  { id: 'e_road_6', source: 'node_junc_west_road_cricket', target: 'node_junc_south_road_turn', distance: 28, isAccessible: true, description: 'West Road Southern Curve' },
  { id: 'e_road_7', source: 'node_junc_south_road_turn', target: 'node_junc_auditorium_plaza', distance: 29, isAccessible: true, description: 'South Road to Auditorium Plaza' },

  // North Sector White Paths (Girls Hostel -> Hospital -> Sanga -> Kumbah)
  { id: 'e_p_road_girls', source: 'node_junc_north_road_girls', target: 'node_ent_girls_hostel', distance: 8, isAccessible: true, description: 'Entrance path to Girls Hostel' },
  { id: 'e_p_girls_hosp', source: 'node_ent_girls_hostel', target: 'node_junc_girls_hospital', distance: 8, isAccessible: true, description: 'Paved walk from Girls Hostel' },
  { id: 'e_p_gh_hosp_ent', source: 'node_junc_girls_hospital', target: 'node_ent_hospital', distance: 8, isAccessible: true, description: 'Entrance ramp to Hospital' },
  { id: 'e_p_hosp_cross', source: 'node_ent_hospital', target: 'node_junc_hospital_east', distance: 8, isAccessible: true, description: 'Hospital East Promenade' },
  { id: 'e_p_hosp_sanga', source: 'node_junc_hospital_east', target: 'node_junc_north_sanga', distance: 16, isAccessible: true, description: 'Walkway between Hospital and Sanga Hostel' },
  { id: 'e_p_sanga_ent', source: 'node_junc_north_sanga', target: 'node_ent_sanga', distance: 3, isAccessible: true, description: 'Sanga Boys Hostel Entrance' },
  { id: 'e_p_sanga_kumbah', source: 'node_junc_north_sanga', target: 'node_junc_kumbah_north', distance: 10, isAccessible: true, description: 'Walkway to Kumbah Hostel' },
  { id: 'e_p_kumbah_ent', source: 'node_junc_kumbah_north', target: 'node_ent_kumbah', distance: 18, isAccessible: true, description: 'Path to Kumbah Hostel' },
  { id: 'e_p_kumbah_south', source: 'node_ent_kumbah', target: 'node_junc_kumbah_south', distance: 10, isAccessible: true, description: 'Kumbah Hostel South Concourse' },

  // Upper-Mid Zone (Guest House, Park, Temple)
  { id: 'e_p_road_guesth', source: 'node_junc_west_road_guesthouse', target: 'node_ent_guest_house', distance: 9, isAccessible: true, description: 'Guest House entrance drive' },
  { id: 'e_p_guesth_parkw', source: 'node_ent_guest_house', target: 'node_junc_park_west', distance: 9, isAccessible: true, description: 'Walkway from Guest House to Park' },
  { id: 'e_p_parkw_park', source: 'node_junc_park_west', target: 'node_ent_park', distance: 7, isAccessible: true, description: 'Park promenade' },
  { id: 'e_p_park_parke', source: 'node_ent_park', target: 'node_junc_park_east', distance: 7, isAccessible: true, description: 'Park East Promenade' },
  { id: 'e_p_parke_temple', source: 'node_junc_park_east', target: 'node_ent_temple', distance: 10, isAccessible: true, description: 'Temple garden walk' },
  { id: 'e_p_temple_te', source: 'node_ent_temple', target: 'node_junc_temple_east', distance: 10, isAccessible: true, description: 'Temple East Promenade' },
  { id: 'e_p_te_kumbah', source: 'node_junc_temple_east', target: 'node_junc_kumbah_south', distance: 14, isAccessible: true, description: 'Walkway between Temple and Kumbah' },

  // North-South Connectors in Upper Zone
  { id: 'e_p_girls_guesth', source: 'node_junc_girls_hospital', target: 'node_junc_park_west', distance: 18, isAccessible: true, description: 'North-South walk between Girls Hostel and Park' },
  { id: 'e_p_hosp_temple', source: 'node_junc_hospital_east', target: 'node_junc_park_east', distance: 18, isAccessible: true, description: 'North-South avenue between Hospital and Temple' },

  // Engineering Complex Perimeter Ring
  { id: 'e_p_road_eng_n', source: 'node_junc_west_road_eng_north', target: 'node_junc_eng_north_walk', distance: 20, isAccessible: true, description: 'West entry to Engineering North' },
  { id: 'e_p_eng_n_portal', source: 'node_junc_eng_north_walk', target: 'node_ent_eng_block_north', distance: 3, isAccessible: true, description: 'Engineering North Portal' },
  { id: 'e_p_eng_n_w', source: 'node_junc_eng_north_walk', target: 'node_junc_eng_west_walk', distance: 18, isAccessible: true, description: 'Engineering West Perimeter Walk' },
  { id: 'e_p_eng_w_s', source: 'node_junc_eng_west_walk', target: 'node_junc_eng_south_walk', distance: 15, isAccessible: true, description: 'Engineering Southwest Walk' },
  { id: 'e_p_eng_s_road', source: 'node_junc_eng_south_walk', target: 'node_junc_west_road_eng_south', distance: 20, isAccessible: true, description: 'Engineering South road link' },
  { id: 'e_p_eng_s_portal', source: 'node_junc_eng_south_walk', target: 'node_ent_eng_block', distance: 2, isAccessible: true, description: 'Engineering Main Entrance' },
  { id: 'e_p_eng_n_e', source: 'node_junc_eng_north_walk', target: 'node_junc_eng_east_walk', distance: 18, isAccessible: true, description: 'Engineering East Perimeter Walk' },
  { id: 'e_p_eng_e_s', source: 'node_junc_eng_east_walk', target: 'node_junc_eng_south_walk', distance: 14, isAccessible: true, description: 'Engineering Southeast Walk' },

  // Connectors from Temple/Park into Engineering
  { id: 'e_p_park_eng_n', source: 'node_ent_park', target: 'node_junc_eng_north_walk', distance: 16, isAccessible: true, description: 'Walk from Park to Engineering' },
  { id: 'e_p_temple_eng_e', source: 'node_ent_temple', target: 'node_junc_eng_east_walk', distance: 24, isAccessible: true, description: 'Walk from Temple to Engineering East' },

  // Mewar University & Central Plaza
  { id: 'e_p_eng_univ', source: 'node_junc_eng_south_walk', target: 'node_ent_mewar_univ', distance: 16, isAccessible: true, description: 'Central walkway between Engineering & Mewar Univ' },
  { id: 'e_p_univ_plaza', source: 'node_ent_mewar_univ', target: 'node_junc_univ_central_plaza', distance: 7, isAccessible: true, description: 'Mewar University Central Plaza' },
  { id: 'e_p_plaza_cs', source: 'node_junc_univ_central_plaza', target: 'node_junc_cs_south', distance: 13, isAccessible: true, description: 'Avenue to Computer Sector Block' },
  { id: 'e_p_cs_ent', source: 'node_junc_cs_south', target: 'node_ent_cs_block', distance: 12, isAccessible: true, description: 'Computer Sector Block Entrance' },

  // East Spine: Computer Block -> Faculty North -> Badel -> Mess -> Law
  { id: 'e_p_cs_east_spine', source: 'node_ent_cs_block', target: 'node_junc_east_spine_north', distance: 9, isAccessible: true, description: 'Computer Block to East Spine' },
  { id: 'e_p_spine_fac1', source: 'node_junc_east_spine_north', target: 'node_ent_faculty_1', distance: 8, isAccessible: true, description: 'Path to Faculty Block North' },
  { id: 'e_p_kumbah_east_spine', source: 'node_junc_kumbah_south', target: 'node_junc_east_spine_north', distance: 22, isAccessible: true, description: 'East avenue from Kumbah Hostel' },
  { id: 'e_p_spine_n_badel', source: 'node_junc_east_spine_north', target: 'node_junc_east_spine_badel', distance: 19, isAccessible: true, description: 'East Spine between Faculty & Badel Hostel' },
  { id: 'e_p_badel_ent', source: 'node_junc_east_spine_badel', target: 'node_ent_badel_hostel', distance: 6, isAccessible: true, description: 'Badel Boys Hostel Entrance' },
  { id: 'e_p_spine_badel_mess', source: 'node_junc_east_spine_badel', target: 'node_junc_east_spine_mess1', distance: 14, isAccessible: true, description: 'East Spine to Mess' },
  { id: 'e_p_mess1_ent', source: 'node_junc_east_spine_mess1', target: 'node_ent_mess_1', distance: 7, isAccessible: true, description: 'Mess Entrance' },
  { id: 'e_p_spine_mess_law', source: 'node_junc_east_spine_mess1', target: 'node_junc_east_spine_law', distance: 14, isAccessible: true, description: 'East Spine to Law Block' },
  { id: 'e_p_law_ent', source: 'node_junc_east_spine_law', target: 'node_ent_law_block', distance: 8, isAccessible: true, description: 'Law Block Entrance' },

  // Law Park & Central Connectors
  { id: 'e_p_cs_lawpark', source: 'node_junc_cs_south', target: 'node_ent_law_park', distance: 14, isAccessible: true, description: 'Walk from Computer Block to Law Park' },
  { id: 'e_p_lawpark_east', source: 'node_ent_law_park', target: 'node_junc_east_spine_mess1', distance: 9, isAccessible: true, description: 'Law Park path to Mess' },
  { id: 'e_p_lawpark_west', source: 'node_ent_law_park', target: 'node_junc_law_park_west', distance: 9, isAccessible: true, description: 'Law Park to Central Sports Avenue' },
  { id: 'e_p_univ_football_n', source: 'node_junc_univ_central_plaza', target: 'node_junc_central_football_n', distance: 8, isAccessible: true, description: 'Avenue leading past Mewar Univ to Football' },
  { id: 'e_p_fn_lpw', source: 'node_junc_central_football_n', target: 'node_junc_law_park_west', distance: 10, isAccessible: true, description: 'Central walkway along Law Park' },
  { id: 'e_p_lpw_sports_mid', source: 'node_junc_law_park_west', target: 'node_junc_central_sports_mid', distance: 18, isAccessible: true, description: 'Central walkway to Sports Mid Junction' },

  // Football Ground Perimeter Ring
  { id: 'e_p_fn_fb_gate', source: 'node_junc_central_football_n', target: 'node_ent_football_ground', distance: 11, isAccessible: true, description: 'Football Ground North Gate' },
  { id: 'e_p_fb_gate_w', source: 'node_ent_football_ground', target: 'node_junc_fb_west', distance: 17, isAccessible: true, description: 'Football Ground West Perimeter' },
  { id: 'e_p_fb_w_road', source: 'node_junc_fb_west', target: 'node_junc_west_road_football', distance: 18, isAccessible: true, description: 'Football Ground to West Road' },
  { id: 'e_p_fb_w_s', source: 'node_junc_fb_west', target: 'node_junc_fb_south', distance: 17, isAccessible: true, description: 'Football Ground South Perimeter' },
  { id: 'e_p_fb_s_mid', source: 'node_junc_fb_south', target: 'node_junc_central_sports_mid', distance: 11, isAccessible: true, description: 'Football South to Central Avenue' },

  // Cross Connector between Central Avenue & Law Block
  { id: 'e_p_sports_mid_law', source: 'node_junc_central_sports_mid', target: 'node_junc_east_spine_law', distance: 19, isAccessible: true, description: 'Crossway between Sports Mid & Law Block' },

  // Cricket Ground Enclosing Ring
  { id: 'e_p_mid_cricket_n', source: 'node_junc_central_sports_mid', target: 'node_junc_cricket_north', distance: 9, isAccessible: true, description: 'Path to Cricket Ground' },
  { id: 'e_p_cricket_n_ent', source: 'node_junc_cricket_north', target: 'node_ent_cricket_ground', distance: 3, isAccessible: true, description: 'Cricket Pavilion Entrance' },
  { id: 'e_p_cricket_n_w', source: 'node_junc_cricket_north', target: 'node_junc_cricket_west', distance: 18, isAccessible: true, description: 'Cricket Ground Northwest Ring' },
  { id: 'e_p_cricket_w_road', source: 'node_junc_cricket_west', target: 'node_junc_west_road_cricket', distance: 20, isAccessible: true, description: 'Cricket West Ring to West Road' },
  { id: 'e_p_cricket_w_s', source: 'node_junc_cricket_west', target: 'node_junc_cricket_south', distance: 18, isAccessible: true, description: 'Cricket Ground Southwest Ring' },
  { id: 'e_p_cricket_n_e', source: 'node_junc_cricket_north', target: 'node_junc_cricket_east', distance: 18, isAccessible: true, description: 'Cricket Ground Northeast Ring' },
  { id: 'e_p_cricket_e_s', source: 'node_junc_cricket_east', target: 'node_junc_cricket_south', distance: 18, isAccessible: true, description: 'Cricket Ground Southeast Ring' },

  // South-East Strip: Gym, Mess 2, Faculty South
  { id: 'e_p_law_gym', source: 'node_junc_east_spine_law', target: 'node_junc_east_spine_gym', distance: 16, isAccessible: true, description: 'East Spine between Law & Gym' },
  { id: 'e_p_gym_ent', source: 'node_junc_east_spine_gym', target: 'node_ent_gym', distance: 4, isAccessible: true, description: 'Gym Entrance' },
  { id: 'e_p_cricket_e_gym', source: 'node_junc_cricket_east', target: 'node_junc_east_spine_gym', distance: 15, isAccessible: true, description: 'Crossway between Cricket Ground & Gym' },
  { id: 'e_p_gym_mess2', source: 'node_junc_east_spine_gym', target: 'node_junc_east_spine_mess2', distance: 14, isAccessible: true, description: 'East Spine to Mess 2' },
  { id: 'e_p_mess2_ent', source: 'node_junc_east_spine_mess2', target: 'node_ent_mess_2', distance: 6, isAccessible: true, description: 'Mess 2 Entrance' },
  { id: 'e_p_mess2_fac2', source: 'node_junc_east_spine_mess2', target: 'node_junc_east_spine_fac2', distance: 14, isAccessible: true, description: 'East Spine to Faculty South' },
  { id: 'e_p_fac2_ent', source: 'node_junc_east_spine_fac2', target: 'node_ent_faculty_2', distance: 10, isAccessible: true, description: 'Faculty Block South Entrance' },

  // Auditorium & Southern Terminal
  { id: 'e_p_cricket_s_aud', source: 'node_junc_cricket_south', target: 'node_junc_auditorium_plaza', distance: 11, isAccessible: true, description: 'Cricket South to Auditorium Plaza' },
  { id: 'e_p_aud_plaza_ent', source: 'node_junc_auditorium_plaza', target: 'node_ent_auditorium', distance: 3, isAccessible: true, description: 'Auditorium Main Portal' },
  { id: 'e_p_aud_connector_e', source: 'node_junc_auditorium_plaza', target: 'node_junc_south_connector_east', distance: 10, isAccessible: true, description: 'Auditorium East Promenade' },
  { id: 'e_p_connector_fac2', source: 'node_junc_south_connector_east', target: 'node_junc_east_spine_fac2', distance: 7, isAccessible: true, description: 'Auditorium link to Faculty South' }
];

// ---------------------------------------------------------------------------
// 3. CONTINUOUS WHITE RIBBON PATHWAYS (For high-fidelity 3D rendering)
// These define the exact visual continuous white path lines seen on the map.
// ---------------------------------------------------------------------------
export const CAMPUS_PATH_RIBBONS: PathRibbon[] = [
  // Ribbon 1: North Horizontal Spine (Girls Hostel past Hospital to Sanga & Kumbah)
  {
    id: 'ribbon_north_horizontal',
    points: [[-34, -63], [-26, -63], [-10, -63], [14, -63], [24, -63], [24, -45]],
    width: 2.8
  },
  // Ribbon 2: Upper Mid Path (Guest House across Park to Temple & East)
  {
    id: 'ribbon_guesthouse_temple',
    points: [[-34, -45], [-25, -43], [-16, -45], [-9, -45], [-2, -45], [6, -38], [14, -45], [24, -35]],
    width: 2.6
  },
  // Ribbon 3: Engineering Block North Promenade
  {
    id: 'ribbon_eng_north',
    points: [[-34, -30], [-14, -30], [-14, -27]],
    width: 2.6
  },
  // Ribbon 4: Engineering Block Surrounding Flank
  {
    id: 'ribbon_eng_loop',
    points: [[-14, -30], [-25, -15], [-14, -6], [-3, -15], [-14, -30]],
    width: 2.6
  },
  // Ribbon 5: Engineering to Mewar University to Central Plaza
  {
    id: 'ribbon_eng_univ_plaza',
    points: [[-34, -6], [-14, -6], [-2, 6], [5, 6]],
    width: 3.2
  },
  // Ribbon 6: Central Avenue Spine (From Mewar University past Football and Cricket to Auditorium)
  {
    id: 'ribbon_central_spine',
    points: [[5, 6], [5, 10], [6, 20], [5, 38], [-2, 45], [-2, 70], [8, 74], [8, 77]],
    width: 3.4
  },
  // Ribbon 7: East Spine (Faculty North -> Badel -> Mess -> Law -> Gym -> Mess 2 -> Faculty South)
  {
    id: 'ribbon_east_spine',
    points: [[24, -35], [24, -13], [32, -13], [24, -13], [24, 6], [30, 6], [24, 6], [24, 20], [31, 20], [24, 20], [24, 34], [32, 34], [24, 34], [23, 50], [27, 50], [23, 50], [23, 64], [29, 64], [23, 64], [23, 78], [33, 78], [23, 78], [18, 74], [8, 74]],
    width: 2.8
  },
  // Ribbon 8: Football Ground Perimeter Ring
  {
    id: 'ribbon_football_ring',
    points: [[5, 10], [-6, 10], [-16, 24], [-6, 38], [5, 38], [-6, 38], [-16, 24], [-34, 24]],
    width: 2.4
  },
  // Ribbon 9: Cricket Ground Enclosing Ring
  {
    id: 'ribbon_cricket_ring',
    points: [[-2, 45], [-14, 58], [-34, 58], [-14, 58], [-2, 70], [10, 58], [-2, 45]],
    width: 2.4
  },
  // Ribbon 10: Law Park Surrounding Loop
  {
    id: 'ribbon_law_park_loop',
    points: [[5, 6], [18, 6], [18, -6], [18, 6], [15, 20], [24, 20], [15, 20], [6, 20]],
    width: 2.4
  },
  // Ribbon 11: Crossways (North-South Park Walkways)
  {
    id: 'ribbon_park_ns',
    points: [[-18, -63], [-16, -45]],
    width: 2.4
  },
  {
    id: 'ribbon_hospital_temple_ns',
    points: [[-2, -63], [-2, -45], [6, -38]],
    width: 2.4
  },
  {
    id: 'ribbon_sports_mid_cross',
    points: [[5, 38], [24, 34]],
    width: 2.6
  },
  {
    id: 'ribbon_cricket_east_gym_cross',
    points: [[10, 58], [23, 50]],
    width: 2.4
  }
];

// ---------------------------------------------------------------------------
// 4. GREEN LAWN PATCHES (To reproduce the exact campus ground aesthetic)
// In the original map: warm sandy/yellow ground base + green lawn islands!
// ---------------------------------------------------------------------------
export interface CampusLawnPatch {
  id: string;
  points: [number, number][]; // [x, z] polygon coordinates
  type: 'lawn' | 'park' | 'sports_ground';
}

export const CAMPUS_LAWN_PATCHES: CampusLawnPatch[] = [
  // North-West Lawn (Between Girls Hostel and Guest House)
  {
    id: 'lawn_nw',
    points: [[-32, -61], [-20, -61], [-18, -47], [-32, -47]],
    type: 'lawn'
  },
  // Park Main Lawn (Between Guest House, Hospital and Temple)
  {
    id: 'lawn_park_main',
    points: [[-14, -61], [-4, -61], [-4, -47], [-14, -47]],
    type: 'park'
  },
  // North-East Lawn (Between Temple, Sanga, Kumbah)
  {
    id: 'lawn_ne_temple',
    points: [[0, -61], [12, -61], [12, -47], [0, -47]],
    type: 'lawn'
  },
  // Lawn North of Engineering
  {
    id: 'lawn_eng_north',
    points: [[-32, -43], [-4, -43], [-4, -32], [-32, -32]],
    type: 'lawn'
  },
  // Law Park Green Area (Beside Football & Law Block)
  {
    id: 'lawn_law_park',
    points: [[7, 8], [22, 8], [22, 32], [7, 32]],
    type: 'park'
  },
  // East Lawn (Between Badel Hostel & Mess)
  {
    id: 'lawn_east_mid',
    points: [[26, 8], [38, 8], [38, 18], [26, 18]],
    type: 'lawn'
  },
  // Southeast Lawn (Between Law Block & Gym)
  {
    id: 'lawn_east_south',
    points: [[25, 36], [38, 36], [38, 48], [25, 48]],
    type: 'lawn'
  },
  // South Lawn (Around Auditorium)
  {
    id: 'lawn_auditorium_surround',
    points: [[-18, 72], [6, 72], [6, 88], [-18, 88]],
    type: 'lawn'
  }
];
