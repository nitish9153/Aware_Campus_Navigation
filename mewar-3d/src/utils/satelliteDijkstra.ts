import {
  DEFAULT_SATELLITE_PATH_NODES,
  DEFAULT_SATELLITE_PATH_EDGES,
  type SatellitePathNode,
  type SatellitePathEdge
} from '../data/mewarSatelliteData';

export interface SatelliteRouteStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  isAccessible: boolean;
}

export interface SatelliteRouteResult {
  status: 'verified' | 'unverified';
  isVerified: boolean;
  message?: string;
  nodeIds: string[];
  coordinates: [number, number][]; // [lat, lng] in Leaflet CRS.Simple
  totalDistanceMeters: number;
  estimatedWalkingMin: number;
  estimatedWheelchairMin: number;
  isFullyAccessible: boolean;
  steps: SatelliteRouteStep[];
  warnings: string[];
}

interface AdjacencyItem {
  targetNodeId: string;
  edge: SatellitePathEdge;
}

/**
 * Snaps any coordinate [lat, lng] or location to the nearest verified walkable node on the road network.
 */
export function snapToNearestWalkableNode(
  point: [number, number],
  nodes: SatellitePathNode[] = DEFAULT_SATELLITE_PATH_NODES
): SatellitePathNode | null {
  if (nodes.length === 0) return null;

  let nearestNode: SatellitePathNode | null = null;
  let minDistanceSq = Infinity;

  for (const node of nodes) {
    const dLat = node.position[0] - point[0];
    const dLng = node.position[1] - point[1];
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearestNode = node;
    }
  }

  return nearestNode;
}

/**
 * Calculates the shortest valid walking route on the verified road network using Dijkstra's algorithm.
 * Snaps endpoints to verified walkable nodes.
 * If no verified road or pedestrian connection exists, returns a result with status: 'unverified'
 * and an empty coordinate array so that NO straight line or fabricated path is drawn.
 */
export function calculateSatelliteRoute(
  startIdentifier: string | [number, number],
  destIdentifier: string | [number, number],
  wheelchairOnly: boolean = false,
  networkNodes: SatellitePathNode[] = DEFAULT_SATELLITE_PATH_NODES,
  networkEdges: SatellitePathEdge[] = DEFAULT_SATELLITE_PATH_EDGES
): SatelliteRouteResult {
  const nodeMap = new Map<string, SatellitePathNode>(
    networkNodes.map(n => [n.id, n])
  );

  // 1. Resolve start node (with automatic snapping to verified walkable path)
  let startNode: SatellitePathNode | null = null;
  if (typeof startIdentifier === 'string') {
    startNode = nodeMap.get(startIdentifier) || null;
  } else if (Array.isArray(startIdentifier)) {
    startNode = snapToNearestWalkableNode(startIdentifier, networkNodes);
  }

  // 2. Resolve destination node (with automatic snapping to verified walkable path)
  let destNode: SatellitePathNode | null = null;
  if (typeof destIdentifier === 'string') {
    destNode = nodeMap.get(destIdentifier) || null;
  } else if (Array.isArray(destIdentifier)) {
    destNode = snapToNearestWalkableNode(destIdentifier, networkNodes);
  }

  // If endpoints cannot be resolved or snapped to the verified network
  if (!startNode || !destNode) {
    return {
      status: 'unverified',
      isVerified: false,
      message: 'Route needs verification',
      nodeIds: [],
      coordinates: [],
      totalDistanceMeters: 0,
      estimatedWalkingMin: 0,
      estimatedWheelchairMin: 0,
      isFullyAccessible: false,
      steps: [],
      warnings: ['Route needs verification: Endpoints could not be snapped to verified road network.']
    };
  }

  const startNodeId = startNode.id;
  const destNodeId = destNode.id;

  // Same node
  if (startNodeId === destNodeId) {
    return {
      status: 'verified',
      isVerified: true,
      message: 'Already at destination',
      nodeIds: [startNodeId],
      coordinates: [startNode.position],
      totalDistanceMeters: 0,
      estimatedWalkingMin: 0,
      estimatedWheelchairMin: 0,
      isFullyAccessible: true,
      steps: [
        {
          stepNumber: 1,
          instruction: `You are already at ${startNode.name}.`,
          distanceMeters: 0,
          isAccessible: true
        }
      ],
      warnings: []
    };
  }

  // Build Adjacency List for the road & walkway network
  const adj = new Map<string, AdjacencyItem[]>();
  networkNodes.forEach(n => adj.set(n.id, []));

  networkEdges.forEach(edge => {
    // If in wheelchair accessible mode, strictly skip non-accessible segments
    if (wheelchairOnly && !edge.isAccessible) {
      return;
    }

    if (!adj.has(edge.source) || !adj.has(edge.target)) {
      return;
    }

    const srcList = adj.get(edge.source)!;
    srcList.push({ targetNodeId: edge.target, edge });

    const tgtList = adj.get(edge.target)!;
    tgtList.push({ targetNodeId: edge.source, edge });
  });

  // Dijkstra shortest path calculation
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: SatellitePathEdge } | null>();
  const unvisited = new Set<string>();

  networkNodes.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortestDist = Infinity;

    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < shortestDist) {
        shortestDist = dist;
        currentId = nodeId;
      }
    });

    if (currentId === null || shortestDist === Infinity) {
      break;
    }

    if (currentId === destNodeId) {
      break;
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const { targetNodeId, edge } of neighbors) {
      if (!unvisited.has(targetNodeId)) continue;

      const alt = shortestDist + edge.distanceMeters;
      const currentDestDist = distances.get(targetNodeId) ?? Infinity;

      if (alt < currentDestDist) {
        distances.set(targetNodeId, alt);
        previous.set(targetNodeId, { nodeId: currentId, edge });
      }
    }
  }

  // If no path was found on the verified road graph:
  const destDist = distances.get(destNodeId);
  if (destDist === undefined || destDist === Infinity) {
    return {
      status: 'unverified',
      isVerified: false,
      message: 'Route needs verification',
      nodeIds: [],
      coordinates: [],
      totalDistanceMeters: 0,
      estimatedWalkingMin: 0,
      estimatedWheelchairMin: 0,
      isFullyAccessible: false,
      steps: [],
      warnings: [
        'Route needs verification: No verified road or pedestrian walkway connects these locations.',
        wheelchairOnly ? 'Try switching to Standard Walking mode to check if non-step-free paths exist.' : 'Admin verification required to map path connections.'
      ]
    };
  }

  // Reconstruct path along verified edges
  const pathNodeIds: string[] = [];
  const edgesUsed: SatellitePathEdge[] = [];
  let curr: string | null = destNodeId;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    const prevEntry = previous.get(curr);
    if (prevEntry) {
      edgesUsed.unshift(prevEntry.edge);
      curr = prevEntry.nodeId;
    } else {
      curr = null;
    }
  }

  // Coordinates strictly along verified nodes
  const coordinates: [number, number][] = pathNodeIds.map(id => {
    const node = nodeMap.get(id);
    return node ? node.position : [0, 0];
  });

  const totalDistanceMeters = Math.round(
    edgesUsed.reduce((sum, e) => sum + e.distanceMeters, 0)
  );

  // Calibrated walking: ~75 m/min (~4.5 km/h)
  const estimatedWalkingMin = Math.max(1, Math.round(totalDistanceMeters / 75));
  // Wheelchair speed: ~60 m/min (~3.6 km/h)
  const estimatedWheelchairMin = Math.max(1, Math.round(totalDistanceMeters / 60));

  const isFullyAccessible = edgesUsed.every(e => e.isAccessible);

  // Generate turn-by-turn navigation instructions along roads and walkways
  const steps: SatelliteRouteStep[] = [];
  steps.push({
    stepNumber: 1,
    instruction: `Depart from ${startNode.name}.`,
    distanceMeters: 0,
    isAccessible: true
  });

  edgesUsed.forEach((edge, idx) => {
    const nextNodeId = pathNodeIds[idx + 1];
    const nextNode = nodeMap.get(nextNodeId);
    steps.push({
      stepNumber: idx + 2,
      instruction: `Follow ${edge.description} towards ${nextNode?.name || 'next waypoint'} (${edge.distanceMeters}m).`,
      distanceMeters: edge.distanceMeters,
      isAccessible: edge.isAccessible
    });
  });

  steps.push({
    stepNumber: steps.length + 1,
    instruction: `Arrive at destination: ${destNode.name}.`,
    distanceMeters: 0,
    isAccessible: true
  });

  const warnings: string[] = [];
  if (!isFullyAccessible) {
    warnings.push('Warning: Route includes segments with stairs or uneven pavers.');
  }

  return {
    status: 'verified',
    isVerified: true,
    message: 'Route verified',
    nodeIds: pathNodeIds,
    coordinates,
    totalDistanceMeters,
    estimatedWalkingMin,
    estimatedWheelchairMin,
    isFullyAccessible,
    steps,
    warnings
  };
}
