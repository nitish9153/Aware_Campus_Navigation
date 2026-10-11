/**
 * Indoor Navigation & Multi-Floor Building Data Types
 * Supports hierarchical Building -> Floor -> Room representation,
 * corridor waypoint networks, door connectors, and accessibility metadata.
 */

export type RoomType =
  | 'Classroom'
  | 'Computer Lab'
  | 'Faculty Office'
  | 'Library'
  | 'Seminar Hall'
  | 'Restroom'
  | 'Elevator'
  | 'Stairs'
  | 'Cafeteria / Mess'
  | 'Administrative'
  | 'Hostel Room'
  | 'Other';

export interface FloorRoom {
  id: string;
  roomNumber: string; // e.g. "101", "102", "G-01", "Lab 2"
  name: string; // e.g. "Robotics & AI Research Lab"
  type: RoomType;
  description?: string;
  // Normalized floor coordinates (0 to 100 percentage of floor plan dimensions)
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
  doorLocation: {
    x: number; // percentage
    y: number; // percentage
  };
  doorCorridorNodeId: string; // ID of the corridor node this door connects to
  isAccessible: boolean; // Step-free door width > 850mm, level threshold
  accessibilityNotes?: string;
}

export type CorridorNodeType = 'entrance' | 'corridor' | 'door' | 'elevator' | 'stairs';

export interface FloorCorridorNode {
  id: string;
  floorId: string;
  type: CorridorNodeType;
  label?: string;
  // Normalized coordinates (0 - 100 percentage)
  x: number;
  y: number;
  isAccessible: boolean;
  // If elevator or stairs, connects to matching connectorId on other floors
  connectorGroup?: string; // e.g. "elevator_central", "stairs_north"
}

export interface FloorCorridorEdge {
  id: string;
  floorId: string;
  source: string; // FloorCorridorNode ID
  target: string; // FloorCorridorNode ID
  distanceMeters: number;
  isAccessible: boolean; // Step-free corridor (no interior steps)
  description?: string;
}

export interface BuildingFloor {
  id: string;
  buildingId: string;
  floorNumber: number; // e.g. 0 for Ground, 1 for First Floor, 2 for Second Floor
  floorName: string; // e.g. "Ground Floor", "First Floor", "Second Floor"
  code: string; // e.g. "GF", "1F", "2F"
  floorPlanImageUrl?: string | null; // Optional custom uploaded floor plan image
  rooms: FloorRoom[];
  corridorNodes: FloorCorridorNode[];
  corridorEdges: FloorCorridorEdge[];
}

export interface IndoorBuilding {
  id: string; // matches buildingId in outdoor map (e.g. "engineering_block")
  name: string; // e.g. "Engineering Block"
  category: string;
  description: string;
  outdoorEntranceNodeId: string; // Connects to the outdoor road network node
  outdoorBuildingId?: string; // Optional alias to outdoor landmark id
  floors: BuildingFloor[];
}

export interface IndoorStep {
  stepNumber: number;
  floorName: string;
  instruction: string;
  distanceMeters: number;
  isAccessible: boolean;
  isFloorChange?: boolean;
}

export interface IndoorRouteResult {
  status: 'verified' | 'unverified';
  isVerified: boolean;
  message?: string;
  buildingId: string;
  startFloorId: string;
  destFloorId: string;
  destRoom: FloorRoom;
  totalIndoorDistanceMeters: number;
  floorPaths: {
    floorId: string;
    floorName: string;
    floorNumber: number;
    coordinates: [number, number][]; // [x, y] in percentage (0 - 100)
    nodeIds: string[];
  }[];
  steps: IndoorStep[];
  floorChangeInstructions?: string[];
  isFullyAccessible: boolean;
  warnings: string[];
}

export interface CombinedCampusRoute {
  building: IndoorBuilding;
  destFloor: BuildingFloor;
  destRoom: FloorRoom;
  outdoorRoute: import('../utils/satelliteDijkstra').SatelliteRouteResult;
  indoorRoute: IndoorRouteResult;
}
