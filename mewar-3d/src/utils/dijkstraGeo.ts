import { GEO_PATH_NODES, GEO_PATH_EDGES, type GeoPathNode, type GeoPathEdge } from '../data/mewarGeoData';

export interface GeoRouteStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  isAccessible: boolean;
}

export interface GeoRouteResult {
  nodeIds: string[];
  coordinates: [number, number][]; // [lat, lng][] along actual walkways
  totalDistanceMeters: number;
  estimatedWalkingMin: number;
  estimatedWheelchairMin: number;
  isFullyAccessible: boolean;
  steps: GeoRouteStep[];
  warnings: string[];
}

interface AdjacencyItem {
  targetNodeId: string;
  edge: GeoPathEdge;
}

export function calculateGeoRoute(
  startNodeId: string,
  destNodeId: string,
  wheelchairOnly: boolean = true
): GeoRouteResult | null {
  if (startNodeId === destNodeId) {
    const node = GEO_PATH_NODES.find(n => n.id === startNodeId);
    if (!node) return null;
    return {
      nodeIds: [startNodeId],
      coordinates: [[node.lat, node.lng]],
      totalDistanceMeters: 0,
      estimatedWalkingMin: 0,
      estimatedWheelchairMin: 0,
      isFullyAccessible: true,
      steps: [{
        stepNumber: 1,
        instruction: 'You have arrived at your destination.',
        distanceMeters: 0,
        isAccessible: true
      }],
      warnings: []
    };
  }

  // Build Adjacency List
  const adj = new Map<string, AdjacencyItem[]>();
  GEO_PATH_NODES.forEach(n => adj.set(n.id, []));

  GEO_PATH_EDGES.forEach(edge => {
    if (wheelchairOnly && !edge.isAccessible) {
      return;
    }

    const srcList = adj.get(edge.source) || [];
    srcList.push({ targetNodeId: edge.target, edge });
    adj.set(edge.source, srcList);

    const tgtList = adj.get(edge.target) || [];
    tgtList.push({ targetNodeId: edge.source, edge });
    adj.set(edge.target, tgtList);
  });

  // Dijkstra distances and previous pointers
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: GeoPathEdge } | null>();
  const unvisited = new Set<string>();

  GEO_PATH_NODES.forEach(n => {
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
      if (alt < (distances.get(targetNodeId) ?? Infinity)) {
        distances.set(targetNodeId, alt);
        previous.set(targetNodeId, { nodeId: currentId, edge });
      }
    }
  }

  if (distances.get(destNodeId) === Infinity) {
    if (wheelchairOnly) {
      // Fallback to relaxed
      const fallback = calculateGeoRoute(startNodeId, destNodeId, false);
      if (fallback) {
        fallback.warnings.push('⚠️ Strict wheelchair-accessible route unavailable. Showing standard route with assistance.');
        fallback.isFullyAccessible = false;
        return fallback;
      }
    }
    return null;
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const pathEdges: GeoPathEdge[] = [];
  let curr: string | undefined = destNodeId;

  while (curr) {
    pathNodeIds.unshift(curr);
    const prevEntry = previous.get(curr);
    if (!prevEntry) break;
    pathEdges.unshift(prevEntry.edge);
    curr = prevEntry.nodeId;
    if (curr === startNodeId) {
      pathNodeIds.unshift(curr);
      break;
    }
  }

  const uniqueNodeIds = Array.from(new Set(pathNodeIds));
  const nodeMap = new Map<string, GeoPathNode>(GEO_PATH_NODES.map(n => [n.id, n]));

  // Georeferenced coordinates along the real walkways
  const coordinates: [number, number][] = uniqueNodeIds.map(nid => {
    const node = nodeMap.get(nid);
    return node ? [node.lat, node.lng] : [0, 0];
  });

  const totalDistance = pathEdges.reduce((sum, e) => sum + e.distanceMeters, 0);
  const walkMin = Math.max(1, Math.round(totalDistance / 68)); // ~68 m/min walk
  const wheelchairMin = Math.max(1, Math.round(totalDistance / 48)); // ~48 m/min wheelchair

  const steps: GeoRouteStep[] = pathEdges.map((edge, idx) => {
    const targetNode = nodeMap.get(uniqueNodeIds[idx + 1]);
    const targetName = targetNode?.name || 'next junction';
    return {
      stepNumber: idx + 1,
      instruction: `Follow ${edge.description} towards ${targetName} (${edge.distanceMeters} m).`,
      distanceMeters: edge.distanceMeters,
      isAccessible: edge.isAccessible
    };
  });

  return {
    nodeIds: uniqueNodeIds,
    coordinates,
    totalDistanceMeters: totalDistance,
    estimatedWalkingMin: walkMin,
    estimatedWheelchairMin: wheelchairMin,
    isFullyAccessible: true,
    steps,
    warnings: []
  };
}
