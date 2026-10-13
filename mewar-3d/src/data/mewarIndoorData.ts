import type { IndoorBuilding, BuildingFloor, FloorRoom } from '../types/indoor';

export const INDOOR_STORAGE_KEY = 'accesspath_indoor_buildings_v1';
export const BACKEND_API_BASE = 'http://127.0.0.1:8000';

/**
 * Default Demo Indoor Buildings Dataset
 * Note: Clearly labeled simulation / demo structure until verified university blueprints are imported.
 */
export const DEFAULT_INDOOR_BUILDINGS: IndoorBuilding[] = [
  // 1. Engineering Block (3 Floors)
  {
    id: 'engineering_block',
    name: 'Engineering Block',
    category: 'Academic',
    description: 'Premier STEM complex with multi-story robotics labs, smart lecture theaters, and department faculty suites [Demo Data].',
    outdoorEntranceNodeId: 'node_ent_eng_block',
    floors: [
      {
        id: 'fl_eng_0',
        buildingId: 'engineering_block',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        corridorNodes: [
          { id: 'node_c_eng_gf_ent', floorId: 'fl_eng_0', type: 'entrance', label: 'Main North Entrance', x: 50, y: 88, isAccessible: true },
          { id: 'node_c_eng_gf_mid_s', floorId: 'fl_eng_0', type: 'corridor', label: 'South Lobby', x: 50, y: 70, isAccessible: true },
          { id: 'node_c_eng_gf_center', floorId: 'fl_eng_0', type: 'corridor', label: 'Central Corridor Cross', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_eng_gf_mid_n', floorId: 'fl_eng_0', type: 'corridor', label: 'North Corridor Hub', x: 50, y: 25, isAccessible: true },
          { id: 'node_c_eng_gf_west', floorId: 'fl_eng_0', type: 'corridor', label: 'West Workshop Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_eng_gf_east', floorId: 'fl_eng_0', type: 'corridor', label: 'East Electronics Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_eng_gf_elev', floorId: 'fl_eng_0', type: 'elevator', label: 'Elevator E1 (Ground)', x: 42, y: 35, isAccessible: true, connectorGroup: 'eng_elev_1' },
          { id: 'node_c_eng_gf_stairs', floorId: 'fl_eng_0', type: 'stairs', label: 'Main Staircase S1 (Ground)', x: 58, y: 35, isAccessible: false, connectorGroup: 'eng_stairs_1' }
        ],
        corridorEdges: [
          { id: 'e_eng_gf_1', floorId: 'fl_eng_0', source: 'node_c_eng_gf_ent', target: 'node_c_eng_gf_mid_s', distanceMeters: 6, isAccessible: true, description: 'Entrance foyer' },
          { id: 'e_eng_gf_2', floorId: 'fl_eng_0', source: 'node_c_eng_gf_mid_s', target: 'node_c_eng_gf_center', distanceMeters: 7, isAccessible: true, description: 'Central hallway' },
          { id: 'e_eng_gf_3', floorId: 'fl_eng_0', source: 'node_c_eng_gf_center', target: 'node_c_eng_gf_west', distanceMeters: 9, isAccessible: true, description: 'West wing corridor' },
          { id: 'e_eng_gf_4', floorId: 'fl_eng_0', source: 'node_c_eng_gf_center', target: 'node_c_eng_gf_east', distanceMeters: 9, isAccessible: true, description: 'East wing corridor' },
          { id: 'e_eng_gf_5', floorId: 'fl_eng_0', source: 'node_c_eng_gf_center', target: 'node_c_eng_gf_elev', distanceMeters: 5, isAccessible: true, description: 'Elevator foyer' },
          { id: 'e_eng_gf_6', floorId: 'fl_eng_0', source: 'node_c_eng_gf_center', target: 'node_c_eng_gf_stairs', distanceMeters: 5, isAccessible: false, description: 'Staircase access' },
          { id: 'e_eng_gf_7', floorId: 'fl_eng_0', source: 'node_c_eng_gf_elev', target: 'node_c_eng_gf_mid_n', distanceMeters: 4, isAccessible: true, description: 'North corridor link' },
          { id: 'e_eng_gf_8', floorId: 'fl_eng_0', source: 'node_c_eng_gf_stairs', target: 'node_c_eng_gf_mid_n', distanceMeters: 4, isAccessible: false, description: 'North corridor link' }
        ],
        rooms: [
          {
            id: 'room_eng_001',
            roomNumber: '001',
            name: 'Mechanical & Robotics Workshop [Demo]',
            type: 'Computer Lab',
            description: 'Heavy machinery and advanced mechatronics assembly laboratory with wide double doors.',
            x: 10,
            y: 40,
            width: 20,
            height: 25,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_eng_gf_west',
            isAccessible: true,
            accessibilityNotes: 'Level threshold, 950mm wide sliding doors'
          },
          {
            id: 'room_eng_002',
            roomNumber: '002',
            name: 'Electronics Circuit Laboratory [Demo]',
            type: 'Computer Lab',
            description: 'Digital signal processing and PCB fabrication workstations.',
            x: 75,
            y: 40,
            width: 20,
            height: 25,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_eng_gf_east',
            isAccessible: true,
            accessibilityNotes: 'Accessible lab benches, anti-static level flooring'
          },
          {
            id: 'room_eng_003',
            roomNumber: '003',
            name: 'Department Office & Helpdesk [Demo]',
            type: 'Administrative',
            description: 'Student academic inquiries, laboratory admissions, and staff assistance.',
            x: 65,
            y: 70,
            width: 25,
            height: 18,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_eng_gf_mid_s',
            isAccessible: true,
            accessibilityNotes: 'Low-height reception desk, wide double door'
          },
          {
            id: 'room_eng_004',
            roomNumber: '004',
            name: 'Accessible Restrooms & Washroom [Demo]',
            type: 'Restroom',
            description: 'Unisex ADA wheelchair accessible restrooms with grab bars.',
            x: 15,
            y: 70,
            width: 20,
            height: 18,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_eng_gf_mid_s',
            isAccessible: true,
            accessibilityNotes: 'Automatic door opener, grab bars, emergency alarm cord'
          }
        ]
      },
      {
        id: 'fl_eng_1',
        buildingId: 'engineering_block',
        floorNumber: 1,
        floorName: 'First Floor',
        code: '1F',
        corridorNodes: [
          { id: 'node_c_eng_1f_elev', floorId: 'fl_eng_1', type: 'elevator', label: 'Elevator E1 (1st Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'eng_elev_1' },
          { id: 'node_c_eng_1f_stairs', floorId: 'fl_eng_1', type: 'stairs', label: 'Main Staircase S1 (1st Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'eng_stairs_1' },
          { id: 'node_c_eng_1f_center', floorId: 'fl_eng_1', type: 'corridor', label: '1st Floor Central Cross', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_eng_1f_west', floorId: 'fl_eng_1', type: 'corridor', label: 'West Computer Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_eng_1f_east', floorId: 'fl_eng_1', type: 'corridor', label: 'East Lecture Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_eng_1f_north', floorId: 'fl_eng_1', type: 'corridor', label: 'North Faculty Wing', x: 50, y: 20, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_eng_1f_1', floorId: 'fl_eng_1', source: 'node_c_eng_1f_elev', target: 'node_c_eng_1f_center', distanceMeters: 5, isAccessible: true, description: 'Elevator landing' },
          { id: 'e_eng_1f_2', floorId: 'fl_eng_1', source: 'node_c_eng_1f_stairs', target: 'node_c_eng_1f_center', distanceMeters: 5, isAccessible: false, description: 'Stair landing' },
          { id: 'e_eng_1f_3', floorId: 'fl_eng_1', source: 'node_c_eng_1f_center', target: 'node_c_eng_1f_west', distanceMeters: 9, isAccessible: true, description: 'Hallway to Labs' },
          { id: 'e_eng_1f_4', floorId: 'fl_eng_1', source: 'node_c_eng_1f_center', target: 'node_c_eng_1f_east', distanceMeters: 9, isAccessible: true, description: 'Hallway to Lecture Halls' },
          { id: 'e_eng_1f_5', floorId: 'fl_eng_1', source: 'node_c_eng_1f_center', target: 'node_c_eng_1f_north', distanceMeters: 10, isAccessible: true, description: 'Faculty corridor' }
        ],
        rooms: [
          {
            id: 'room_eng_101',
            roomNumber: '101',
            name: 'Computer Programming Lab 1 [Demo]',
            type: 'Computer Lab',
            description: 'Software development lab with 60 high-performance workstations and projector.',
            x: 10,
            y: 35,
            width: 22,
            height: 25,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_eng_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Wheelchair accessible computer rows, braille door sign'
          },
          {
            id: 'room_eng_102',
            roomNumber: '102',
            name: 'AI & Data Science Research Lab [Demo]',
            type: 'Computer Lab',
            description: 'High-compute GPU research workstations for deep learning & NLP projects.',
            x: 10,
            y: 65,
            width: 22,
            height: 25,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_eng_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Step-free entrance, tactile path guidance'
          },
          {
            id: 'room_eng_103',
            roomNumber: '103',
            name: 'Smart Lecture Hall 103 [Demo]',
            type: 'Classroom',
            description: '120-seat tiered lecture hall with dual presentation screens and microphones.',
            x: 72,
            y: 35,
            width: 22,
            height: 25,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_eng_1f_east',
            isAccessible: true,
            accessibilityNotes: 'Front row designated wheelchair desks and hearing loop system'
          },
          {
            id: 'room_eng_104',
            roomNumber: '104',
            name: 'Faculty Staff Offices [Demo]',
            type: 'Faculty Office',
            description: 'Consultation rooms for Professors of Computer Science and Mechanical Engineering.',
            x: 72,
            y: 65,
            width: 22,
            height: 25,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_eng_1f_east',
            isAccessible: true,
            accessibilityNotes: 'Braille room plaque, wide doorway'
          },
          {
            id: 'room_eng_105',
            roomNumber: '105',
            name: 'Embedded Systems & IoT Lab [Demo]',
            type: 'Computer Lab',
            description: 'Microcontroller prototyping lab with oscilloscopes and FPGA dev kits.',
            x: 40,
            y: 10,
            width: 24,
            height: 18,
            doorLocation: { x: 50, y: 20 },
            doorCorridorNodeId: 'node_c_eng_1f_north',
            isAccessible: true,
            accessibilityNotes: 'Level threshold, adjustable height test benches'
          }
        ]
      },
      {
        id: 'fl_eng_2',
        buildingId: 'engineering_block',
        floorNumber: 2,
        floorName: 'Second Floor',
        code: '2F',
        corridorNodes: [
          { id: 'node_c_eng_2f_elev', floorId: 'fl_eng_2', type: 'elevator', label: 'Elevator E1 (2nd Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'eng_elev_1' },
          { id: 'node_c_eng_2f_stairs', floorId: 'fl_eng_2', type: 'stairs', label: 'Main Staircase S1 (2nd Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'eng_stairs_1' },
          { id: 'node_c_eng_2f_center', floorId: 'fl_eng_2', type: 'corridor', label: '2nd Floor Central Concourse', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_eng_2f_west', floorId: 'fl_eng_2', type: 'corridor', label: 'CAD Studio Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_eng_2f_east', floorId: 'fl_eng_2', type: 'corridor', label: 'Library & Seminar Wing', x: 75, y: 50, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_eng_2f_1', floorId: 'fl_eng_2', source: 'node_c_eng_2f_elev', target: 'node_c_eng_2f_center', distanceMeters: 5, isAccessible: true, description: 'Elevator foyer' },
          { id: 'e_eng_2f_2', floorId: 'fl_eng_2', source: 'node_c_eng_2f_stairs', target: 'node_c_eng_2f_center', distanceMeters: 5, isAccessible: false, description: 'Stair landing' },
          { id: 'e_eng_2f_3', floorId: 'fl_eng_2', source: 'node_c_eng_2f_center', target: 'node_c_eng_2f_west', distanceMeters: 9, isAccessible: true, description: 'Hallway to CAD Studio' },
          { id: 'e_eng_2f_4', floorId: 'fl_eng_2', source: 'node_c_eng_2f_center', target: 'node_c_eng_2f_east', distanceMeters: 9, isAccessible: true, description: 'Hallway to Library & Seminar' }
        ],
        rooms: [
          {
            id: 'room_eng_201',
            roomNumber: '201',
            name: 'CAD & 3D Modeling Studio [Demo]',
            type: 'Computer Lab',
            description: 'Advanced computer-aided design suite with high-refresh monitors and drawing tablets.',
            x: 10,
            y: 40,
            width: 24,
            height: 30,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_eng_2f_west',
            isAccessible: true,
            accessibilityNotes: 'Step-free entrance with wide corridor clearance'
          },
          {
            id: 'room_eng_202',
            roomNumber: '202',
            name: 'Engineering Digital Library [Demo]',
            type: 'Library',
            description: 'Quiet study reading room with research journals and digital IEEE database access.',
            x: 70,
            y: 35,
            width: 25,
            height: 25,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_eng_2f_east',
            isAccessible: true,
            accessibilityNotes: 'Low reading tables and braille book catalogue'
          },
          {
            id: 'room_eng_203',
            roomNumber: '203',
            name: 'Grand Seminar Hall [Demo]',
            type: 'Seminar Hall',
            description: 'Auditorium style chamber for symposiums, guest lectures, and student project defense.',
            x: 70,
            y: 65,
            width: 25,
            height: 25,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_eng_2f_east',
            isAccessible: true,
            accessibilityNotes: 'Ramped stage access, accessible podium, wheelchair spots'
          }
        ]
      }
    ]
  },

  // 2. Sanga Hostel (2 Floors)
  {
    id: 'sanga_hostel',
    name: 'Sanga Hostel',
    category: 'Hostel',
    description: 'Premier male student residence block with courtyard, study lounge, and accessible rooms [Demo Data].',
    outdoorEntranceNodeId: 'node_ent_sanga',
    floors: [
      {
        id: 'fl_sanga_0',
        buildingId: 'sanga_hostel',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        corridorNodes: [
          { id: 'node_c_sanga_gf_ent', floorId: 'fl_sanga_0', type: 'entrance', label: 'Hostel Main Porch', x: 50, y: 88, isAccessible: true },
          { id: 'node_c_sanga_gf_lobby', floorId: 'fl_sanga_0', type: 'corridor', label: 'Reception Foyer', x: 50, y: 70, isAccessible: true },
          { id: 'node_c_sanga_gf_cross', floorId: 'fl_sanga_0', type: 'corridor', label: 'Central Corridor', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_sanga_gf_west', floorId: 'fl_sanga_0', type: 'corridor', label: 'West Resident Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_sanga_gf_east', floorId: 'fl_sanga_0', type: 'corridor', label: 'East Resident Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_sanga_gf_elev', floorId: 'fl_sanga_0', type: 'elevator', label: 'Hostel Lift (Ground)', x: 42, y: 35, isAccessible: true, connectorGroup: 'sanga_elev' },
          { id: 'node_c_sanga_gf_stairs', floorId: 'fl_sanga_0', type: 'stairs', label: 'Hostel Stairway (Ground)', x: 58, y: 35, isAccessible: false, connectorGroup: 'sanga_stairs' }
        ],
        corridorEdges: [
          { id: 'e_sanga_gf_1', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_ent', target: 'node_c_sanga_gf_lobby', distanceMeters: 5, isAccessible: true, description: 'Front foyer' },
          { id: 'e_sanga_gf_2', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_lobby', target: 'node_c_sanga_gf_cross', distanceMeters: 6, isAccessible: true, description: 'Lobby hallway' },
          { id: 'e_sanga_gf_3', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_cross', target: 'node_c_sanga_gf_west', distanceMeters: 8, isAccessible: true, description: 'West resident corridor' },
          { id: 'e_sanga_gf_4', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_cross', target: 'node_c_sanga_gf_east', distanceMeters: 8, isAccessible: true, description: 'East resident corridor' },
          { id: 'e_sanga_gf_5', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_cross', target: 'node_c_sanga_gf_elev', distanceMeters: 4, isAccessible: true, description: 'Elevator landing' },
          { id: 'e_sanga_gf_6', floorId: 'fl_sanga_0', source: 'node_c_sanga_gf_cross', target: 'node_c_sanga_gf_stairs', distanceMeters: 4, isAccessible: false, description: 'Stair landing' }
        ],
        rooms: [
          {
            id: 'room_sanga_101',
            roomNumber: '101',
            name: 'Warden Office & Registration [Demo]',
            type: 'Administrative',
            description: 'Chief hostel warden and resident advisor office.',
            x: 65,
            y: 72,
            width: 25,
            height: 18,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_sanga_gf_lobby',
            isAccessible: true,
            accessibilityNotes: 'Step-free access, 900mm wide doorway'
          },
          {
            id: 'room_sanga_102',
            roomNumber: '102',
            name: 'Student Common Lounge & TV Room [Demo]',
            type: 'Seminar Hall',
            description: 'Recreation room with seating, chess tables, and entertainment.',
            x: 10,
            y: 70,
            width: 25,
            height: 20,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_sanga_gf_lobby',
            isAccessible: true,
            accessibilityNotes: 'Double-leaf entrance, smooth vinyl flooring'
          },
          {
            id: 'room_sanga_103',
            roomNumber: '103',
            name: 'Resident Room 103 (Accessible Suite) [Demo]',
            type: 'Hostel Room',
            description: 'Specially fitted ground floor resident room for students with mobility needs.',
            x: 12,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_sanga_gf_west',
            isAccessible: true,
            accessibilityNotes: 'Extra-wide doorway, roll-in private shower, grab rails'
          },
          {
            id: 'room_sanga_104',
            roomNumber: '104',
            name: 'Resident Room 104 [Demo]',
            type: 'Hostel Room',
            description: 'Double occupancy student resident room.',
            x: 72,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_sanga_gf_east',
            isAccessible: true,
            accessibilityNotes: 'Standard level doorway'
          }
        ]
      },
      {
        id: 'fl_sanga_1',
        buildingId: 'sanga_hostel',
        floorNumber: 1,
        floorName: 'First Floor',
        code: '1F',
        corridorNodes: [
          { id: 'node_c_sanga_1f_elev', floorId: 'fl_sanga_1', type: 'elevator', label: 'Hostel Lift (1st Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'sanga_elev' },
          { id: 'node_c_sanga_1f_stairs', floorId: 'fl_sanga_1', type: 'stairs', label: 'Hostel Stairway (1st Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'sanga_stairs' },
          { id: 'node_c_sanga_1f_cross', floorId: 'fl_sanga_1', type: 'corridor', label: '1st Floor Hallway', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_sanga_1f_west', floorId: 'fl_sanga_1', type: 'corridor', label: 'West Wing Hallway', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_sanga_1f_east', floorId: 'fl_sanga_1', type: 'corridor', label: 'East Wing Hallway', x: 75, y: 50, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_sanga_1f_1', floorId: 'fl_sanga_1', source: 'node_c_sanga_1f_elev', target: 'node_c_sanga_1f_cross', distanceMeters: 4, isAccessible: true, description: 'Lift exit' },
          { id: 'e_sanga_1f_2', floorId: 'fl_sanga_1', source: 'node_c_sanga_1f_stairs', target: 'node_c_sanga_1f_cross', distanceMeters: 4, isAccessible: false, description: 'Stair landing' },
          { id: 'e_sanga_1f_3', floorId: 'fl_sanga_1', source: 'node_c_sanga_1f_cross', target: 'node_c_sanga_1f_west', distanceMeters: 8, isAccessible: true, description: 'West resident corridor' },
          { id: 'e_sanga_1f_4', floorId: 'fl_sanga_1', source: 'node_c_sanga_1f_cross', target: 'node_c_sanga_1f_east', distanceMeters: 8, isAccessible: true, description: 'East resident corridor' }
        ],
        rooms: [
          {
            id: 'room_sanga_201',
            roomNumber: '201',
            name: 'Resident Room 201 [Demo]',
            type: 'Hostel Room',
            description: 'Double occupancy student room with balcony overlooking the garden.',
            x: 12,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_sanga_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Step-free level door'
          },
          {
            id: 'room_sanga_202',
            roomNumber: '202',
            name: 'Quiet Study & Reading Room [Demo]',
            type: 'Library',
            description: 'Dedicated 24-hour study hall with individual carrels and power sockets.',
            x: 72,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_sanga_1f_east',
            isAccessible: true,
            accessibilityNotes: 'Wide doorway with push bar'
          }
        ]
      }
    ]
  },

  // 3. Kumbah Hostel (Ground Floor Rooms 1-16 + 1st Floor)
  {
    id: 'kumba_hostel',
    name: 'Kumbah Hostel',
    category: 'Hostel',
    description: 'Premier student residential block named after Maharana Kumbha. Features ground floor Rooms 1–16, central corridor, and washrooms at both ends.',
    outdoorEntranceNodeId: 'node_ent_kumba',
    outdoorBuildingId: 'kumba_hostel',
    floors: [
      {
        id: 'fl_kumba_0',
        buildingId: 'kumba_hostel',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        floorPlanImageUrl: '/maps/kumbah-ground-floor.png',
        corridorNodes: [
          { id: 'node_c_kumba_gf_ent', floorId: 'fl_kumba_0', type: 'entrance', label: 'Hostel Ground Floor Entrance', x: 53.7, y: 27.1, isAccessible: true },
          { id: 'node_c_kumba_gf_junction', floorId: 'fl_kumba_0', type: 'corridor', label: 'Central Corridor Entrance Cross', x: 56.2, y: 38.1, isAccessible: true },
          { id: 'node_c_kumba_gf_washroom_w', floorId: 'fl_kumba_0', type: 'corridor', label: 'West Washroom Entrance (Left End)', x: 16.5, y: 58.5, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_1_2', floorId: 'fl_kumba_0', type: 'corridor', label: 'West Corridor (Rooms 1 & 2)', x: 27.8, y: 57.9, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_3_4', floorId: 'fl_kumba_0', type: 'corridor', label: 'West Corridor (Rooms 3 & 4)', x: 37.1, y: 53.5, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_5_6', floorId: 'fl_kumba_0', type: 'corridor', label: 'West Corridor (Rooms 5 & 6)', x: 45.9, y: 49.8, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_7_8', floorId: 'fl_kumba_0', type: 'corridor', label: 'Mid-West Corridor (Rooms 7 & 8)', x: 54.7, y: 45.4, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_9_10', floorId: 'fl_kumba_0', type: 'corridor', label: 'Mid-East Corridor (Rooms 9 & 10)', x: 68.4, y: 39.6, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_11_12', floorId: 'fl_kumba_0', type: 'corridor', label: 'East Corridor (Rooms 11 & 12)', x: 76.7, y: 35.2, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_13_14', floorId: 'fl_kumba_0', type: 'corridor', label: 'East Corridor (Rooms 13 & 14)', x: 84.5, y: 31.5, isAccessible: true },
          { id: 'node_c_kumba_gf_sp_15_16', floorId: 'fl_kumba_0', type: 'corridor', label: 'East Corridor (Rooms 15 & 16)', x: 92.3, y: 27.8, isAccessible: true },
          { id: 'node_c_kumba_gf_washroom_e', floorId: 'fl_kumba_0', type: 'corridor', label: 'East Washroom Entrance (Right End)', x: 93.3, y: 26.4, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_kumba_gf_ent_junc', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_ent', target: 'node_c_kumba_gf_junction', distanceMeters: 4, isAccessible: true, description: 'Hostel Main Entrance to Central Corridor' },
          { id: 'e_kumba_gf_junc_w', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_junction', target: 'node_c_kumba_gf_sp_7_8', distanceMeters: 3, isAccessible: true, description: 'Corridor heading West toward Rooms 1–8' },
          { id: 'e_kumba_gf_sp_7_5', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_7_8', target: 'node_c_kumba_gf_sp_5_6', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 5 & 6' },
          { id: 'e_kumba_gf_sp_5_3', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_5_6', target: 'node_c_kumba_gf_sp_3_4', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 3 & 4' },
          { id: 'e_kumba_gf_sp_3_1', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_3_4', target: 'node_c_kumba_gf_sp_1_2', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 1 & 2' },
          { id: 'e_kumba_gf_sp_1_wash', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_1_2', target: 'node_c_kumba_gf_washroom_w', distanceMeters: 5, isAccessible: true, description: 'West Corridor approach to West Washroom' },
          { id: 'e_kumba_gf_junc_e', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_junction', target: 'node_c_kumba_gf_sp_9_10', distanceMeters: 4, isAccessible: true, description: 'Corridor heading East toward Rooms 9–16' },
          { id: 'e_kumba_gf_sp_9_11', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_9_10', target: 'node_c_kumba_gf_sp_11_12', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 11 & 12' },
          { id: 'e_kumba_gf_sp_11_13', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_11_12', target: 'node_c_kumba_gf_sp_13_14', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 13 & 14' },
          { id: 'e_kumba_gf_sp_13_15', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_13_14', target: 'node_c_kumba_gf_sp_15_16', distanceMeters: 4, isAccessible: true, description: 'Central Corridor past Rooms 15 & 16' },
          { id: 'e_kumba_gf_sp_15_wash', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_sp_15_16', target: 'node_c_kumba_gf_washroom_e', distanceMeters: 3, isAccessible: true, description: 'East Corridor approach to East Washroom' }
        ],
        rooms: [
          // Odd Rooms (Top Row: 1, 3, 5, 7, 9, 11, 13, 15)
          {
            id: 'room_kumba_1',
            roomNumber: '1',
            name: 'Room 1 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 1 in North-West wing of Kumbah Hostel Ground Floor.',
            x: 13.5,
            y: 35.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 25.2, y: 52.8 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_1_2',
            isAccessible: true,
            accessibilityNotes: 'Step-free level threshold, 900mm wide doorway'
          },
          {
            id: 'room_kumba_3',
            roomNumber: '3',
            name: 'Room 3 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 3 along the top corridor row.',
            x: 23.5,
            y: 31.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 34.8, y: 48.4 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_3_4',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_5',
            roomNumber: '5',
            name: 'Room 5 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 5 along the top corridor row.',
            x: 32.5,
            y: 27.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 43.5, y: 44.7 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_5_6',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_7',
            roomNumber: '7',
            name: 'Room 7 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 7 situated immediately west of the hostel main entrance.',
            x: 41.5,
            y: 23.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 52.0, y: 40.3 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_7_8',
            isAccessible: true,
            accessibilityNotes: 'Step-free level doorway adjacent to entrance foyer'
          },
          {
            id: 'room_kumba_9',
            roomNumber: '9',
            name: 'Room 9 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 9 situated immediately east of the hostel main entrance.',
            x: 55.5,
            y: 18.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 66.4, y: 34.5 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_9_10',
            isAccessible: true,
            accessibilityNotes: 'Step-free level doorway'
          },
          {
            id: 'room_kumba_11',
            roomNumber: '11',
            name: 'Room 11 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 11 along the top corridor row.',
            x: 64.5,
            y: 15.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 74.2, y: 30.8 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_11_12',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_13',
            roomNumber: '13',
            name: 'Room 13 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 13 along the top corridor row.',
            x: 72.5,
            y: 11.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 81.8, y: 27.1 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_13_14',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_15',
            roomNumber: '15',
            name: 'Room 15 (Top Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 15 in the North-East wing near East Washroom.',
            x: 80.5,
            y: 8.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 89.8, y: 24.6 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_15_16',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },

          // Even Rooms (Bottom Row: 2, 4, 6, 8, 10, 12, 14, 16)
          {
            id: 'room_kumba_2',
            roomNumber: '2',
            name: 'Room 2 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 2 in the South-West wing of Kumbah Hostel Ground Floor.',
            x: 20.0,
            y: 60.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 30.8, y: 63.8 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_1_2',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_4',
            roomNumber: '4',
            name: 'Room 4 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 4 along the bottom corridor row.',
            x: 29.5,
            y: 56.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 39.6, y: 59.4 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_3_4',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_6',
            roomNumber: '6',
            name: 'Room 6 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 6 along the bottom corridor row.',
            x: 39.0,
            y: 51.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 48.6, y: 55.0 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_5_6',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_8',
            roomNumber: '8',
            name: 'Room 8 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 8 directly opposite the entrance corridor.',
            x: 48.5,
            y: 47.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 57.6, y: 50.6 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_7_8',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_10',
            roomNumber: '10',
            name: 'Room 10 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 10 along the bottom corridor row.',
            x: 60.5,
            y: 42.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 70.8, y: 44.7 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_9_10',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_12',
            roomNumber: '12',
            name: 'Room 12 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 12 along the bottom corridor row.',
            x: 70.0,
            y: 37.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 79.3, y: 40.3 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_11_12',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_14',
            roomNumber: '14',
            name: 'Room 14 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 14 along the bottom corridor row.',
            x: 78.5,
            y: 33.0,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 87.4, y: 35.9 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_13_14',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },
          {
            id: 'room_kumba_16',
            roomNumber: '16',
            name: 'Room 16 (Bottom Row)',
            type: 'Hostel Room',
            description: 'Resident Student Room 16 in the South-East wing near East Washroom.',
            x: 87.0,
            y: 28.5,
            width: 9.5,
            height: 17.5,
            doorLocation: { x: 95.2, y: 31.5 },
            doorCorridorNodeId: 'node_c_kumba_gf_sp_15_16',
            isAccessible: true,
            accessibilityNotes: 'Step-free doorway'
          },

          // Washrooms
          {
            id: 'room_kumba_washroom_west',
            roomNumber: 'W-WR',
            name: 'West Washroom (Left End)',
            type: 'Restroom',
            description: 'Communal restrooms and washroom facility located at the West end of the ground floor corridor.',
            x: 2.0,
            y: 52.0,
            width: 14.0,
            height: 26.0,
            doorLocation: { x: 16.5, y: 58.5 },
            doorCorridorNodeId: 'node_c_kumba_gf_washroom_w',
            isAccessible: true,
            accessibilityNotes: 'Step-free level entry, accessible fixtures'
          },
          {
            id: 'room_kumba_washroom_east',
            roomNumber: 'E-WR',
            name: 'East Washroom (Right End)',
            type: 'Restroom',
            description: 'Communal restrooms and washroom facility located at the East end of the ground floor corridor.',
            x: 90.0,
            y: 13.0,
            width: 9.0,
            height: 20.0,
            doorLocation: { x: 92.5, y: 26.8 },
            doorCorridorNodeId: 'node_c_kumba_gf_washroom_e',
            isAccessible: true,
            accessibilityNotes: 'Step-free entry, accessible basin'
          }
        ]
      },
      {
        id: 'fl_kumba_1',
        buildingId: 'kumba_hostel',
        floorNumber: 1,
        floorName: 'First Floor',
        code: '1F',
        corridorNodes: [
          { id: 'node_c_kumba_1f_elev', floorId: 'fl_kumba_1', type: 'elevator', label: 'Elevator (1st Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'kumba_elev' },
          { id: 'node_c_kumba_1f_stairs', floorId: 'fl_kumba_1', type: 'stairs', label: 'Stairs (1st Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'kumba_stairs' },
          { id: 'node_c_kumba_1f_center', floorId: 'fl_kumba_1', type: 'corridor', label: '1st Floor Corridor', x: 50, y: 50, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_kumba_1f_1', floorId: 'fl_kumba_1', source: 'node_c_kumba_1f_elev', target: 'node_c_kumba_1f_center', distanceMeters: 4, isAccessible: true, description: 'Lift access' },
          { id: 'e_kumba_1f_2', floorId: 'fl_kumba_1', source: 'node_c_kumba_1f_stairs', target: 'node_c_kumba_1f_center', distanceMeters: 4, isAccessible: false, description: 'Stairs access' }
        ],
        rooms: [
          {
            id: 'room_kumba_201',
            roomNumber: '201',
            name: 'Resident Suite 201 [Demo]',
            type: 'Hostel Room',
            description: 'Resident room on the first floor.',
            x: 20,
            y: 40,
            width: 25,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_kumba_1f_center',
            isAccessible: true,
            accessibilityNotes: 'Accessible via elevator'
          },
          {
            id: 'room_kumba_202',
            roomNumber: '202',
            name: 'Common Study Lounge [Demo]',
            type: 'Library',
            description: 'Group study room with whiteboard.',
            x: 60,
            y: 40,
            width: 25,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_kumba_1f_center',
            isAccessible: true,
            accessibilityNotes: 'Accessible via elevator'
          }
        ]
      }
    ]
  },

  // 4. Mewar University Main Administrative Building (2 Floors)
  {
    id: 'mewar_university',
    name: 'Mewar University Main Building',
    category: 'Administration',
    description: 'Central administrative headquarters, Vice Chancellor chambers, and Admissions [Demo Data].',
    outdoorEntranceNodeId: 'node_ent_mewar_univ',
    floors: [
      {
        id: 'fl_mu_0',
        buildingId: 'mewar_university',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        corridorNodes: [
          { id: 'node_c_mu_gf_ent', floorId: 'fl_mu_0', type: 'entrance', label: 'Grand Central Portal', x: 50, y: 88, isAccessible: true },
          { id: 'node_c_mu_gf_atrium', floorId: 'fl_mu_0', type: 'corridor', label: 'Central Marble Atrium', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_mu_gf_elev', floorId: 'fl_mu_0', type: 'elevator', label: 'VIP Glass Lift (Ground)', x: 40, y: 35, isAccessible: true, connectorGroup: 'mu_elev' },
          { id: 'node_c_mu_gf_stairs', floorId: 'fl_mu_0', type: 'stairs', label: 'Ceremonial Staircase (Ground)', x: 60, y: 35, isAccessible: false, connectorGroup: 'mu_stairs' }
        ],
        corridorEdges: [
          { id: 'e_mu_gf_1', floorId: 'fl_mu_0', source: 'node_c_mu_gf_ent', target: 'node_c_mu_gf_atrium', distanceMeters: 6, isAccessible: true, description: 'Grand foyer entrance' },
          { id: 'e_mu_gf_2', floorId: 'fl_mu_0', source: 'node_c_mu_gf_atrium', target: 'node_c_mu_gf_elev', distanceMeters: 4, isAccessible: true, description: 'Glass elevator foyer' },
          { id: 'e_mu_gf_3', floorId: 'fl_mu_0', source: 'node_c_mu_gf_atrium', target: 'node_c_mu_gf_stairs', distanceMeters: 4, isAccessible: false, description: 'Grand stairs' }
        ],
        rooms: [
          {
            id: 'room_mu_g01',
            roomNumber: 'G-01',
            name: 'Central Admissions & Student Welfare [Demo]',
            type: 'Administrative',
            description: 'Admissions counseling, enrollment verification, and fee counters.',
            x: 15,
            y: 40,
            width: 28,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_mu_gf_atrium',
            isAccessible: true,
            accessibilityNotes: 'Low height counter, automatic sliding glass doors'
          },
          {
            id: 'room_mu_g02',
            roomNumber: 'G-02',
            name: 'Registrar & Academic Affairs Office [Demo]',
            type: 'Administrative',
            description: 'University registrar, transcripts, and official certifications.',
            x: 60,
            y: 40,
            width: 28,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_mu_gf_atrium',
            isAccessible: true,
            accessibilityNotes: 'Zero threshold doorway with tactile signs'
          }
        ]
      },
      {
        id: 'fl_mu_1',
        buildingId: 'mewar_university',
        floorNumber: 1,
        floorName: 'First Floor',
        code: '1F',
        corridorNodes: [
          { id: 'node_c_mu_1f_elev', floorId: 'fl_mu_1', type: 'elevator', label: 'VIP Glass Lift (1st Floor)', x: 40, y: 35, isAccessible: true, connectorGroup: 'mu_elev' },
          { id: 'node_c_mu_1f_stairs', floorId: 'fl_mu_1', type: 'stairs', label: 'Ceremonial Staircase (1st Floor)', x: 60, y: 35, isAccessible: false, connectorGroup: 'mu_stairs' },
          { id: 'node_c_mu_1f_gallery', floorId: 'fl_mu_1', type: 'corridor', label: 'Executive Gallery', x: 50, y: 50, isAccessible: true }
        ],
        corridorEdges: [
          { id: 'e_mu_1f_1', floorId: 'fl_mu_1', source: 'node_c_mu_1f_elev', target: 'node_c_mu_1f_gallery', distanceMeters: 4, isAccessible: true, description: 'Executive lift landing' },
          { id: 'e_mu_1f_2', floorId: 'fl_mu_1', source: 'node_c_mu_1f_stairs', target: 'node_c_mu_1f_gallery', distanceMeters: 4, isAccessible: false, description: 'Stairs landing' }
        ],
        rooms: [
          {
            id: 'room_mu_101',
            roomNumber: '101',
            name: 'Vice Chancellor Chambers [Demo]',
            type: 'Administrative',
            description: 'Executive chambers and formal conference room.',
            x: 15,
            y: 35,
            width: 28,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_mu_1f_gallery',
            isAccessible: true,
            accessibilityNotes: 'Wide double mahogany doors, level access'
          },
          {
            id: 'room_mu_102',
            roomNumber: '102',
            name: 'Academic Senate Boardroom [Demo]',
            type: 'Seminar Hall',
            description: 'Official university governance and faculty senate meeting hall.',
            x: 60,
            y: 35,
            width: 28,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_mu_1f_gallery',
            isAccessible: true,
            accessibilityNotes: 'Wheelchair board table seating, hearing loop'
          }
        ]
      }
    ]
  },

  // 4. Kumbah Hostel (Ground Floor, First Floor, Second Floor)
  {
    id: 'kumbah_hostel',
    name: 'Kumbah Hostel',
    category: 'Hostel',
    description: 'Maharana Kumbha Hostel — Premier multi-story boys residence block with inner courtyards, resident rooms, study lounges, dining hall, and ramped access.',
    outdoorEntranceNodeId: 'node_ent_kumbah',
    floors: [
      {
        id: 'fl_kumbah_0',
        buildingId: 'kumbah_hostel',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        corridorNodes: [
          { id: 'node_c_kb_gf_ent', floorId: 'fl_kumbah_0', type: 'entrance', label: 'Main Porch & Ramp Entrance', x: 50, y: 88, isAccessible: true },
          { id: 'node_c_kb_gf_lobby', floorId: 'fl_kumbah_0', type: 'corridor', label: 'Reception Foyer', x: 50, y: 70, isAccessible: true },
          { id: 'node_c_kb_gf_cross', floorId: 'fl_kumbah_0', type: 'corridor', label: 'Central Corridor Cross', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_kb_gf_west', floorId: 'fl_kumbah_0', type: 'corridor', label: 'West Resident Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_kb_gf_east', floorId: 'fl_kumbah_0', type: 'corridor', label: 'East Resident Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_kb_gf_elev', floorId: 'fl_kumbah_0', type: 'elevator', label: 'Kumbah Elevator E1 (Ground)', x: 42, y: 35, isAccessible: true, connectorGroup: 'kumbah_elev' },
          { id: 'node_c_kb_gf_stairs', floorId: 'fl_kumbah_0', type: 'stairs', label: 'Main Staircase S1 (Ground)', x: 58, y: 35, isAccessible: false, connectorGroup: 'kumbah_stairs' }
        ],
        corridorEdges: [
          { id: 'e_kb_gf_1', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_ent', target: 'node_c_kb_gf_lobby', distanceMeters: 5, isAccessible: true, description: 'Ramped entrance porch to foyer' },
          { id: 'e_kb_gf_2', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_lobby', target: 'node_c_kb_gf_cross', distanceMeters: 6, isAccessible: true, description: 'Lobby connecting corridor' },
          { id: 'e_kb_gf_3', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_cross', target: 'node_c_kb_gf_west', distanceMeters: 8, isAccessible: true, description: 'West resident corridor' },
          { id: 'e_kb_gf_4', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_cross', target: 'node_c_kb_gf_east', distanceMeters: 8, isAccessible: true, description: 'East resident corridor' },
          { id: 'e_kb_gf_5', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_cross', target: 'node_c_kb_gf_elev', distanceMeters: 4, isAccessible: true, description: 'Elevator foyer' },
          { id: 'e_kb_gf_6', floorId: 'fl_kumbah_0', source: 'node_c_kb_gf_cross', target: 'node_c_kb_gf_stairs', distanceMeters: 4, isAccessible: false, description: 'Staircase flight landing' }
        ],
        rooms: [
          {
            id: 'room_kb_001',
            roomNumber: '001',
            name: 'Warden Office & Student Helpdesk',
            type: 'Administrative',
            description: 'Chief Hostel Warden office, resident registration, and inquiries.',
            x: 65,
            y: 70,
            width: 25,
            height: 18,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_kb_gf_lobby',
            isAccessible: true,
            accessibilityNotes: 'Step-free entrance, low reception counter'
          },
          {
            id: 'room_kb_002',
            roomNumber: '002',
            name: 'Resident Room 002 (Accessible Suite)',
            type: 'Hostel Room',
            description: 'Designated ground floor mobility-friendly student resident suite.',
            x: 10,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_gf_west',
            isAccessible: true,
            accessibilityNotes: 'Wide 950mm sliding door, roll-in bathroom threshold'
          },
          {
            id: 'room_kb_003',
            roomNumber: '003',
            name: 'Resident Room 003',
            type: 'Hostel Room',
            description: 'Standard double occupancy ground floor resident room.',
            x: 10,
            y: 65,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_gf_west',
            isAccessible: true,
            accessibilityNotes: 'Level threshold entryway'
          },
          {
            id: 'room_kb_004',
            roomNumber: '004',
            name: 'Hostel Dining Hall & Mess Pantry',
            type: 'Dining Hall',
            description: 'Ground floor student dining area and drinking water station.',
            x: 75,
            y: 40,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_gf_east',
            isAccessible: true,
            accessibilityNotes: 'Double swing doors, wheelchair clearance dining tables'
          },
          {
            id: 'room_kb_005',
            roomNumber: '005',
            name: 'Resident Room 005',
            type: 'Hostel Room',
            description: 'Standard double occupancy resident room with garden view.',
            x: 75,
            y: 65,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_gf_east',
            isAccessible: true,
            accessibilityNotes: 'Standard door, level entrance'
          },
          {
            id: 'room_kb_006',
            roomNumber: '006',
            name: 'Accessible Restroom & Shower Bay',
            type: 'Restroom',
            description: 'ADA compliant ground floor wheelchair restroom with support grab rails.',
            x: 10,
            y: 15,
            width: 22,
            height: 20,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_gf_west',
            isAccessible: true,
            accessibilityNotes: 'Emergency call pull cord, grab rails'
          }
        ]
      },
      {
        id: 'fl_kumbah_1',
        buildingId: 'kumbah_hostel',
        floorNumber: 1,
        floorName: 'First Floor',
        code: '1F',
        corridorNodes: [
          { id: 'node_c_kb_1f_lobby', floorId: 'fl_kumbah_1', type: 'corridor', label: '1st Floor Lobby', x: 50, y: 70, isAccessible: true },
          { id: 'node_c_kb_1f_cross', floorId: 'fl_kumbah_1', type: 'corridor', label: 'Central Corridor Cross', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_kb_1f_west', floorId: 'fl_kumbah_1', type: 'corridor', label: 'West Resident Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_kb_1f_east', floorId: 'fl_kumbah_1', type: 'corridor', label: 'East Resident Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_kb_1f_elev', floorId: 'fl_kumbah_1', type: 'elevator', label: 'Kumbah Elevator E1 (1st Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'kumbah_elev' },
          { id: 'node_c_kb_1f_stairs', floorId: 'fl_kumbah_1', type: 'stairs', label: 'Main Staircase S1 (1st Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'kumbah_stairs' }
        ],
        corridorEdges: [
          { id: 'e_kb_1f_1', floorId: 'fl_kumbah_1', source: 'node_c_kb_1f_lobby', target: 'node_c_kb_1f_cross', distanceMeters: 6, isAccessible: true, description: 'Lobby hall' },
          { id: 'e_kb_1f_2', floorId: 'fl_kumbah_1', source: 'node_c_kb_1f_cross', target: 'node_c_kb_1f_west', distanceMeters: 8, isAccessible: true, description: 'West resident corridor' },
          { id: 'e_kb_1f_3', floorId: 'fl_kumbah_1', source: 'node_c_kb_1f_cross', target: 'node_c_kb_1f_east', distanceMeters: 8, isAccessible: true, description: 'East resident corridor' },
          { id: 'e_kb_1f_4', floorId: 'fl_kumbah_1', source: 'node_c_kb_1f_cross', target: 'node_c_kb_1f_elev', distanceMeters: 4, isAccessible: true, description: 'Elevator foyer' },
          { id: 'e_kb_1f_5', floorId: 'fl_kumbah_1', source: 'node_c_kb_1f_cross', target: 'node_c_kb_1f_stairs', distanceMeters: 4, isAccessible: false, description: 'Stair landing' }
        ],
        rooms: [
          {
            id: 'room_kb_101',
            roomNumber: '101',
            name: 'Resident Room 101',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 10,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_102',
            roomNumber: '102',
            name: 'Resident Room 102',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 10,
            y: 65,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_103',
            roomNumber: '103',
            name: 'Resident Room 103',
            type: 'Hostel Room',
            description: 'Single occupancy study room.',
            x: 10,
            y: 15,
            width: 22,
            height: 20,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_1f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_104',
            roomNumber: '104',
            name: 'Student Study & Quiet Reading Hall',
            type: 'Library',
            description: 'Quiet study lounge with Wi-Fi, reference desks, and reading carrels.',
            x: 65,
            y: 70,
            width: 25,
            height: 20,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_kb_1f_lobby',
            isAccessible: true,
            accessibilityNotes: 'Wide door, study carrels with wheelchair clearance'
          },
          {
            id: 'room_kb_105',
            roomNumber: '105',
            name: 'Resident Room 105',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 75,
            y: 40,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_1f_east',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_106',
            roomNumber: '106',
            name: 'Resident Room 106',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 75,
            y: 65,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_1f_east',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          }
        ]
      },
      {
        id: 'fl_kumbah_2',
        buildingId: 'kumbah_hostel',
        floorNumber: 2,
        floorName: 'Second Floor',
        code: '2F',
        corridorNodes: [
          { id: 'node_c_kb_2f_lobby', floorId: 'fl_kumbah_2', type: 'corridor', label: '2nd Floor Lobby', x: 50, y: 70, isAccessible: true },
          { id: 'node_c_kb_2f_cross', floorId: 'fl_kumbah_2', type: 'corridor', label: 'Central Corridor Cross', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_kb_2f_west', floorId: 'fl_kumbah_2', type: 'corridor', label: 'West Resident Wing', x: 25, y: 50, isAccessible: true },
          { id: 'node_c_kb_2f_east', floorId: 'fl_kumbah_2', type: 'corridor', label: 'East Resident Wing', x: 75, y: 50, isAccessible: true },
          { id: 'node_c_kb_2f_elev', floorId: 'fl_kumbah_2', type: 'elevator', label: 'Kumbah Elevator E1 (2nd Floor)', x: 42, y: 35, isAccessible: true, connectorGroup: 'kumbah_elev' },
          { id: 'node_c_kb_2f_stairs', floorId: 'fl_kumbah_2', type: 'stairs', label: 'Main Staircase S1 (2nd Floor)', x: 58, y: 35, isAccessible: false, connectorGroup: 'kumbah_stairs' }
        ],
        corridorEdges: [
          { id: 'e_kb_2f_1', floorId: 'fl_kumbah_2', source: 'node_c_kb_2f_lobby', target: 'node_c_kb_2f_cross', distanceMeters: 6, isAccessible: true, description: 'Lobby hall' },
          { id: 'e_kb_2f_2', floorId: 'fl_kumbah_2', source: 'node_c_kb_2f_cross', target: 'node_c_kb_2f_west', distanceMeters: 8, isAccessible: true, description: 'West resident corridor' },
          { id: 'e_kb_2f_3', floorId: 'fl_kumbah_2', source: 'node_c_kb_2f_cross', target: 'node_c_kb_2f_east', distanceMeters: 8, isAccessible: true, description: 'East resident corridor' },
          { id: 'e_kb_2f_4', floorId: 'fl_kumbah_2', source: 'node_c_kb_2f_cross', target: 'node_c_kb_2f_elev', distanceMeters: 4, isAccessible: true, description: 'Elevator foyer' },
          { id: 'e_kb_2f_5', floorId: 'fl_kumbah_2', source: 'node_c_kb_2f_cross', target: 'node_c_kb_2f_stairs', distanceMeters: 4, isAccessible: false, description: 'Stair landing' }
        ],
        rooms: [
          {
            id: 'room_kb_201',
            roomNumber: '201',
            name: 'Resident Room 201',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 10,
            y: 40,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_2f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_202',
            roomNumber: '202',
            name: 'Resident Room 202',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 10,
            y: 65,
            width: 22,
            height: 22,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_2f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_203',
            roomNumber: '203',
            name: 'Resident Room 203',
            type: 'Hostel Room',
            description: 'Single student resident room.',
            x: 10,
            y: 15,
            width: 22,
            height: 20,
            doorLocation: { x: 25, y: 50 },
            doorCorridorNodeId: 'node_c_kb_2f_west',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_204',
            roomNumber: '204',
            name: 'Recreation Lounge & TV Room',
            type: 'Seminar Hall',
            description: 'Indoor games room with table tennis, carrom, and student seating.',
            x: 65,
            y: 70,
            width: 25,
            height: 20,
            doorLocation: { x: 50, y: 70 },
            doorCorridorNodeId: 'node_c_kb_2f_lobby',
            isAccessible: true,
            accessibilityNotes: 'Wide entrance, elevator accessible'
          },
          {
            id: 'room_kb_205',
            roomNumber: '205',
            name: 'Resident Room 205',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 75,
            y: 40,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_2f_east',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          },
          {
            id: 'room_kb_206',
            roomNumber: '206',
            name: 'Resident Room 206',
            type: 'Hostel Room',
            description: 'Double student resident room.',
            x: 75,
            y: 65,
            width: 20,
            height: 22,
            doorLocation: { x: 75, y: 50 },
            doorCorridorNodeId: 'node_c_kb_2f_east',
            isAccessible: true,
            accessibilityNotes: 'Accessible via Elevator E1'
          }
        ]
      }
    ]
  }
];

/**
 * Load indoor buildings from LocalStorage or Default Demo Data.
 * Also initiates background sync with the backend if available.
 */
export function loadIndoorBuildings(): IndoorBuilding[] {
  try {
    const raw = localStorage.getItem(INDOOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading indoor data from localStorage:', err);
  }
  return DEFAULT_INDOOR_BUILDINGS;
}

/**
 * Save indoor buildings to LocalStorage and asynchronously persist to backend server.
 */
export async function saveIndoorBuildings(buildings: IndoorBuilding[]): Promise<boolean> {
  // 1. Save locally for instant UI update
  try {
    localStorage.setItem(INDOOR_STORAGE_KEY, JSON.stringify(buildings));
  } catch (err) {
    console.error('Error saving indoor data to localStorage:', err);
  }

  // 2. Persist to backend REST API
  try {
    const res = await fetch(`${BACKEND_API_BASE}/api/mewar/indoor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildings })
    });
    if (res.ok) {
      return true;
    }
  } catch {
    // Backend offline / development mode - local persistence succeeded
  }

  return true;
}

/**
 * Reset indoor buildings to the verified default structure.
 */
export async function resetIndoorBuildings(): Promise<IndoorBuilding[]> {
  try {
    localStorage.removeItem(INDOOR_STORAGE_KEY);
  } catch {
    // Ignore
  }

  try {
    await fetch(`${BACKEND_API_BASE}/api/mewar/indoor/reset`, { method: 'POST' });
  } catch {
    // Ignore
  }

  return DEFAULT_INDOOR_BUILDINGS;
}

/**
 * Fetch latest indoor data from backend server if available.
 */
export async function fetchBackendIndoorData(): Promise<IndoorBuilding[] | null> {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/api/mewar/indoor`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.buildings) && data.buildings.length > 0) {
        localStorage.setItem(INDOOR_STORAGE_KEY, JSON.stringify(data.buildings));
        return data.buildings;
      }
    }
  } catch {
    // Fall back to local
  }
  return null;
}

/**
 * Find room across all buildings and floors by room ID or room number
 */
export function findRoomHierarchy(
  buildings: IndoorBuilding[],
  query: string
): { building: IndoorBuilding; floor: BuildingFloor; room: FloorRoom } | null {
  const q = query.toLowerCase().trim();
  for (const b of buildings) {
    for (const f of b.floors) {
      for (const r of f.rooms) {
        if (
          r.id.toLowerCase() === q ||
          r.roomNumber.toLowerCase() === q ||
          r.name.toLowerCase().includes(q)
        ) {
          return { building: b, floor: f, room: r };
        }
      }
    }
  }
  return null;
}
