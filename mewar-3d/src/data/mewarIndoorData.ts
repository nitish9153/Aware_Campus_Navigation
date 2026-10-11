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

  // 3. Kumbha Hostel (2 Floors)
  {
    id: 'kumba_hostel',
    name: 'Kumbha Hostel',
    category: 'Hostel',
    description: 'Multi-wing residence named after Maharana Kumbha, situated east of main avenue [Demo Data].',
    outdoorEntranceNodeId: 'node_ent_kumba',
    floors: [
      {
        id: 'fl_kumba_0',
        buildingId: 'kumba_hostel',
        floorNumber: 0,
        floorName: 'Ground Floor',
        code: 'GF',
        corridorNodes: [
          { id: 'node_c_kumba_gf_ent', floorId: 'fl_kumba_0', type: 'entrance', label: 'Kumbha Main Entrance', x: 50, y: 88, isAccessible: true },
          { id: 'node_c_kumba_gf_center', floorId: 'fl_kumba_0', type: 'corridor', label: 'Central Corridor', x: 50, y: 50, isAccessible: true },
          { id: 'node_c_kumba_gf_elev', floorId: 'fl_kumba_0', type: 'elevator', label: 'Elevator (Ground)', x: 42, y: 35, isAccessible: true, connectorGroup: 'kumba_elev' },
          { id: 'node_c_kumba_gf_stairs', floorId: 'fl_kumba_0', type: 'stairs', label: 'Stairs (Ground)', x: 58, y: 35, isAccessible: false, connectorGroup: 'kumba_stairs' }
        ],
        corridorEdges: [
          { id: 'e_kumba_gf_1', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_ent', target: 'node_c_kumba_gf_center', distanceMeters: 7, isAccessible: true, description: 'Entrance corridor' },
          { id: 'e_kumba_gf_2', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_center', target: 'node_c_kumba_gf_elev', distanceMeters: 4, isAccessible: true, description: 'Lift approach' },
          { id: 'e_kumba_gf_3', floorId: 'fl_kumba_0', source: 'node_c_kumba_gf_center', target: 'node_c_kumba_gf_stairs', distanceMeters: 4, isAccessible: false, description: 'Stairway approach' }
        ],
        rooms: [
          {
            id: 'room_kumba_101',
            roomNumber: '101',
            name: 'Kumbha Reception & Office [Demo]',
            type: 'Administrative',
            description: 'Guest sign-in and caretaker counter.',
            x: 20,
            y: 40,
            width: 25,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_kumba_gf_center',
            isAccessible: true,
            accessibilityNotes: 'Direct ramp access'
          },
          {
            id: 'room_kumba_102',
            roomNumber: '102',
            name: 'Resident Suite 102 [Demo]',
            type: 'Hostel Room',
            description: 'Double student room with study desks.',
            x: 60,
            y: 40,
            width: 25,
            height: 25,
            doorLocation: { x: 50, y: 50 },
            doorCorridorNodeId: 'node_c_kumba_gf_center',
            isAccessible: true,
            accessibilityNotes: 'Step-free entrance'
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
