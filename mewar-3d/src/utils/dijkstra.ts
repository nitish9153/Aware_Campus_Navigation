import type { RouteResult, RouteStep } from '../types/campus';
import { CAMPUS_PATH_NODES, CAMPUS_PATH_EDGES, type PathNode, type PathEdge } from '../data/campusPaths';

interface AdjacencyItem {
  targetNodeId: string;
  edge: PathEdge;
}

export function findRoute(
  startNodeId: string,
  destNodeId: string,
  wheelchairOnly: boolean = true
): RouteResult | null {
  if (startNodeId === destNodeId) {
    const startNode = CAMPUS_PATH_NODES.find(n => n.id === startNodeId);
    if (!startNode) return null;
    return {
      nodeIds: [startNodeId],
      points: [[startNode.x, 0.4, startNode.z]],
      totalDistance: 0,
      estimatedWalkingMin: 0,
      estimatedWheelchairMin: 0,
      isFullyAccessible: true,
      steps: [{
        stepNumber: 1,
        instruction: 'You have already arrived at your destination.',
        distance: 0,
        isAccessible: true,
        hasStairs: false,
        surface: 'paved_concrete'
      }],
      warnings: []
    };
  }

  // Build Adjacency List from connected campus path edges
  const adj = new Map<string, AdjacencyItem[]>();
  CAMPUS_PATH_NODES.forEach(node => adj.set(node.id, []));

  CAMPUS_PATH_EDGES.forEach(edge => {
    // Check accessibility filter
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
  const previous = new Map<string, { nodeId: string; edge: PathEdge } | null>();
  const unvisited = new Set<string>();

  CAMPUS_PATH_NODES.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Extract node with smallest distance
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
      break; // Remaining nodes are unreachable
    }

    if (currentId === destNodeId) {
      break; // Target reached!
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const { targetNodeId, edge } of neighbors) {
      if (!unvisited.has(targetNodeId)) continue;

      const alt = shortestDist + edge.distance;
      if (alt < (distances.get(targetNodeId) ?? Infinity)) {
        distances.set(targetNodeId, alt);
        previous.set(targetNodeId, { nodeId: currentId, edge });
      }
    }
  }

  if (distances.get(destNodeId) === Infinity) {
    // Fallback if wheelchairOnly was true
    if (wheelchairOnly) {
      const fallback = findRoute(startNodeId, destNodeId, false);
      if (fallback) {
        fallback.warnings.push('⚠️ Strict wheelchair-accessible route not available. Showing standard route with assistance required.');
        fallback.isFullyAccessible = false;
        return fallback;
      }
    }
    return null;
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const pathEdges: PathEdge[] = [];
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

  const uniquePathNodeIds = Array.from(new Set(pathNodeIds));
  const nodeMap = new Map<string, PathNode>(CAMPUS_PATH_NODES.map(n => [n.id, n]));

  // Build 3D Points array along the path nodes (hovering at y = 0.4 to prevent z-fighting!)
  const points: [number, number, number][] = uniquePathNodeIds.map(nid => {
    const node = nodeMap.get(nid);
    return node ? [node.x, 0.45, node.z] : [0, 0.45, 0];
  });

  const totalDist = pathEdges.reduce((sum, e) => sum + e.distance, 0);
  const walkMin = Math.max(1, Math.round(totalDist / 68)); // ~68 m/min
  const wheelchairMin = Math.max(1, Math.round(totalDist / 48)); // ~48 m/min

  // Build turn-by-turn steps
  const steps: RouteStep[] = [];
  pathEdges.forEach((edge, idx) => {
    const targetNode = nodeMap.get(uniquePathNodeIds[idx + 1]);
    const targetName = targetNode?.name || 'next junction';
    steps.push({
      stepNumber: idx + 1,
      instruction: `Follow ${edge.description} towards ${targetName} (${Math.round(edge.distance)} m).`,
      distance: Math.round(edge.distance),
      isAccessible: edge.isAccessible,
      hasStairs: false,
      surface: 'paved_concrete'
    });
  });

  return {
    nodeIds: uniquePathNodeIds,
    points,
    totalDistance: Math.round(totalDist),
    estimatedWalkingMin: walkMin,
    estimatedWheelchairMin: wheelchairMin,
    isFullyAccessible: true,
    steps,
    warnings: []
  };
}
