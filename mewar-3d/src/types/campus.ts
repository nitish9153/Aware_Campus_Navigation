export type LocationCategory = 
  | 'Hostel'
  | 'Academic'
  | 'Dining'
  | 'Sports'
  | 'Medical'
  | 'Worship'
  | 'Green Area'
  | 'Administration';

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  category: LocationCategory;
  description: string;
  iconType: string;
  color: string;
  position: [number, number, number]; // [x, y, z] in 3D space
  size: [number, number, number];     // [width, height, depth]
  shape?: 'box' | 'u_shape' | 'l_shape' | 'circle' | 'dome' | 'compound';
  stories: number;
  wheelchairAccessible: boolean;
  rampAvailable: boolean;
  elevatorAvailable: boolean;
  brailleSignage: boolean;
  facilities: string[];
  entranceNodeId: string;
  badgeLabel?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  position: [number, number, number];
  isAccessible: boolean;
  buildingId?: string;
  type: 'road' | 'pathway' | 'entrance' | 'ramp' | 'sports';
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distance: number; // approximate meters
  isAccessible: boolean;
  hasStairs: boolean;
  stairCount?: number;
  rampAvailable?: boolean;
  slopeGrade?: number; // percentage
  surface: 'asphalt' | 'paved_concrete' | 'paver_tiles' | 'grass' | 'gravel';
  description: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distance: number;
  isAccessible: boolean;
  hasStairs: boolean;
  surface: string;
}

export interface RouteResult {
  nodeIds: string[];
  points: [number, number, number][];
  totalDistance: number;
  estimatedWalkingMin: number;
  estimatedWheelchairMin: number;
  isFullyAccessible: boolean;
  steps: RouteStep[];
  warnings: string[];
}
