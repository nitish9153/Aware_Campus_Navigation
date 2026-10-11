import type {
  IndoorBuilding,
  BuildingFloor,
  FloorRoom,
  FloorCorridorNode,
  FloorCorridorEdge,
  IndoorRouteResult,
  IndoorStep
} from '../types/indoor';

interface AdjacencyEdge {
  targetNodeId: string;
  edge: FloorCorridorEdge;
}

/**
 * Calculates Dijkstra shortest path on a single floor corridor graph.
 */
function dijkstraSingleFloor(
  floor: BuildingFloor,
  startNodeId: string,
  destNodeId: string,
  wheelchairOnly: boolean
): { nodeIds: string[]; edges: FloorCorridorEdge[]; totalDistance: number } | null {
  if (startNodeId === destNodeId) {
    return { nodeIds: [startNodeId], edges: [], totalDistance: 0 };
  }

  const adj = new Map<string, AdjacencyEdge[]>();
  floor.corridorNodes.forEach(n => adj.set(n.id, []));

  floor.corridorEdges.forEach(e => {
    if (wheelchairOnly && !e.isAccessible) return;
    if (!adj.has(e.source) || !adj.has(e.target)) return;

    adj.get(e.source)!.push({ targetNodeId: e.target, edge: e });
    adj.get(e.target)!.push({ targetNodeId: e.source, edge: e });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: FloorCorridorEdge } | null>();
  const unvisited = new Set<string>();

  floor.corridorNodes.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortest = Infinity;

    unvisited.forEach(nid => {
      const d = distances.get(nid) ?? Infinity;
      if (d < shortest) {
        shortest = d;
        currentId = nid;
      }
    });

    if (currentId === null || shortest === Infinity) break;
    if (currentId === destNodeId) break;

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const { targetNodeId, edge } of neighbors) {
      if (!unvisited.has(targetNodeId)) continue;
      const alt = shortest + edge.distanceMeters;
      if (alt < (distances.get(targetNodeId) ?? Infinity)) {
        distances.set(targetNodeId, alt);
        previous.set(targetNodeId, { nodeId: currentId, edge });
      }
    }
  }

  const destDist = distances.get(destNodeId);
  if (destDist === undefined || destDist === Infinity) {
    return null;
  }

  const pathNodeIds: string[] = [];
  const edgesUsed: FloorCorridorEdge[] = [];
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

  return {
    nodeIds: pathNodeIds,
    edges: edgesUsed,
    totalDistance: Math.round(destDist)
  };
}

/**
 * Calculates verified indoor route from Building Entrance to Destination Room Door,
 * handling multi-floor navigation via Elevators or Stairs.
 */
export function calculateIndoorRoute(
  building: IndoorBuilding,
  destRoomId: string,
  wheelchairOnly: boolean = false
): IndoorRouteResult {
  // 1. Locate destination room and floor
  let destFloor: BuildingFloor | null = null;
  let targetRoom: FloorRoom | null = null;

  for (const floor of building.floors) {
    const found = floor.rooms.find(r => r.id === destRoomId || r.roomNumber === destRoomId);
    if (found) {
      destFloor = floor;
      targetRoom = found;
      break;
    }
  }

  if (!destFloor || !targetRoom) {
    return {
      status: 'unverified',
      isVerified: false,
      message: 'Room not found in building',
      buildingId: building.id,
      startFloorId: '',
      destFloorId: '',
      destRoom: {
        id: '',
        roomNumber: '',
        name: '',
        type: 'Other',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        doorLocation: { x: 0, y: 0 },
        doorCorridorNodeId: '',
        isAccessible: false
      },
      totalIndoorDistanceMeters: 0,
      floorPaths: [],
      steps: [],
      isFullyAccessible: false,
      warnings: ['Room could not be located in this building.']
    };
  }

  // 2. Identify Entrance Floor (usually Ground Floor number 0, or lowest floor with entrance node)
  let entranceFloor: BuildingFloor | null = null;
  let entranceNode: FloorCorridorNode | null = null;

  for (const floor of building.floors) {
    const ent = floor.corridorNodes.find(n => n.type === 'entrance');
    if (ent) {
      entranceFloor = floor;
      entranceNode = ent;
      break;
    }
  }

  if (!entranceFloor || !entranceNode) {
    // Fall back to ground floor
    entranceFloor = building.floors.find(f => f.floorNumber === 0) || building.floors[0];
    entranceNode = entranceFloor.corridorNodes[0];
  }

  // CASE A: Destination is on the SAME floor as the entrance
  if (entranceFloor.id === destFloor.id) {
    const pathResult = dijkstraSingleFloor(
      entranceFloor,
      entranceNode.id,
      targetRoom.doorCorridorNodeId,
      wheelchairOnly
    );

    if (!pathResult) {
      return {
        status: 'unverified',
        isVerified: false,
        message: 'Route needs verification: Corridor connection not found',
        buildingId: building.id,
        startFloorId: entranceFloor.id,
        destFloorId: destFloor.id,
        destRoom: targetRoom,
        totalIndoorDistanceMeters: 0,
        floorPaths: [],
        steps: [],
        isFullyAccessible: false,
        warnings: ['Route needs verification: Walkable corridor path to this room door is unverified or blocked.']
      };
    }

    const nodeMap = new Map<string, FloorCorridorNode>(
      entranceFloor.corridorNodes.map(n => [n.id, n])
    );

    const coordinates: [number, number][] = pathResult.nodeIds.map(nid => {
      const n = nodeMap.get(nid);
      return n ? [n.x, n.y] : [0, 0];
    });

    // Append door location at the end
    coordinates.push([targetRoom.doorLocation.x, targetRoom.doorLocation.y]);

    const steps: IndoorStep[] = [];
    steps.push({
      stepNumber: 1,
      floorName: entranceFloor.floorName,
      instruction: `Enter ${building.name} via ${entranceNode.label || 'Main Entrance'} on ${entranceFloor.floorName}.`,
      distanceMeters: 0,
      isAccessible: true
    });

    pathResult.edges.forEach((edge, idx) => {
      const nextNode = nodeMap.get(pathResult.nodeIds[idx + 1]);
      steps.push({
        stepNumber: idx + 2,
        floorName: entranceFloor.floorName,
        instruction: `Follow ${edge.description || 'corridor'} towards ${nextNode?.label || 'waypoint'} (${edge.distanceMeters}m).`,
        distanceMeters: edge.distanceMeters,
        isAccessible: edge.isAccessible
      });
    });

    steps.push({
      stepNumber: steps.length + 1,
      floorName: entranceFloor.floorName,
      instruction: `Arrive at Room ${targetRoom.roomNumber} (${targetRoom.name}).`,
      distanceMeters: 2,
      isAccessible: targetRoom.isAccessible
    });

    return {
      status: 'verified',
      isVerified: true,
      message: 'Indoor route verified',
      buildingId: building.id,
      startFloorId: entranceFloor.id,
      destFloorId: destFloor.id,
      destRoom: targetRoom,
      totalIndoorDistanceMeters: pathResult.totalDistance + 2,
      floorPaths: [
        {
          floorId: entranceFloor.id,
          floorName: entranceFloor.floorName,
          floorNumber: entranceFloor.floorNumber,
          coordinates,
          nodeIds: pathResult.nodeIds
        }
      ],
      steps,
      isFullyAccessible: pathResult.edges.every(e => e.isAccessible) && targetRoom.isAccessible,
      warnings: []
    };
  }

  // CASE B: MULTI-FLOOR NAVIGATION (Requires Elevator or Stairs)
  // Find floor connector: prefer elevator (required if wheelchairOnly)
  interface ConnectorPair {
    group: string;
    type: 'elevator' | 'stairs';
    startNode: FloorCorridorNode;
    destNode: FloorCorridorNode;
    isAccessible: boolean;
  }

  const connectorPairs: ConnectorPair[] = [];

  entranceFloor.corridorNodes.forEach(sNode => {
    if (!sNode.connectorGroup) return;
    const matchingDestNode = destFloor!.corridorNodes.find(
      dNode => dNode.connectorGroup === sNode.connectorGroup
    );
    if (matchingDestNode) {
      connectorPairs.push({
        group: sNode.connectorGroup,
        type: sNode.type === 'elevator' ? 'elevator' : 'stairs',
        startNode: sNode,
        destNode: matchingDestNode,
        isAccessible: sNode.isAccessible && matchingDestNode.isAccessible
      });
    }
  });

  // Filter accessible if wheelchairOnly
  const availableConnectors = wheelchairOnly
    ? connectorPairs.filter(c => c.isAccessible && c.type === 'elevator')
    : connectorPairs;

  if (availableConnectors.length === 0) {
    return {
      status: 'unverified',
      isVerified: false,
      message: 'Route needs verification: No suitable floor connector found',
      buildingId: building.id,
      startFloorId: entranceFloor.id,
      destFloorId: destFloor.id,
      destRoom: targetRoom,
      totalIndoorDistanceMeters: 0,
      floorPaths: [],
      steps: [],
      isFullyAccessible: false,
      warnings: [
        wheelchairOnly
          ? `Route needs verification: No verified step-free elevator connects ${entranceFloor.floorName} to ${destFloor.floorName}.`
          : `Route needs verification: No verified stairs or elevator connects ${entranceFloor.floorName} to ${destFloor.floorName}.`
      ]
    };
  }

  // Select best connector (elevators prioritized)
  const bestConnector = availableConnectors.find(c => c.type === 'elevator') || availableConnectors[0];

  // Route 1: Entrance Floor -> Connector on Entrance Floor
  const pathPart1 = dijkstraSingleFloor(
    entranceFloor,
    entranceNode.id,
    bestConnector.startNode.id,
    wheelchairOnly
  );

  // Route 2: Connector on Destination Floor -> Room Door
  const pathPart2 = dijkstraSingleFloor(
    destFloor,
    bestConnector.destNode.id,
    targetRoom.doorCorridorNodeId,
    wheelchairOnly
  );

  if (!pathPart1 || !pathPart2) {
    return {
      status: 'unverified',
      isVerified: false,
      message: 'Route needs verification: Corridor segment disconnected',
      buildingId: building.id,
      startFloorId: entranceFloor.id,
      destFloorId: destFloor.id,
      destRoom: targetRoom,
      totalIndoorDistanceMeters: 0,
      floorPaths: [],
      steps: [],
      isFullyAccessible: false,
      warnings: ['Route needs verification: Corridor path to elevator/stairs or room is not fully connected.']
    };
  }

  // Build coordinates for Floor 1
  const mapFloor1 = new Map<string, FloorCorridorNode>(
    entranceFloor.corridorNodes.map(n => [n.id, n])
  );
  const coords1: [number, number][] = pathPart1.nodeIds.map(nid => {
    const n = mapFloor1.get(nid);
    return n ? [n.x, n.y] : [0, 0];
  });

  // Build coordinates for Floor 2
  const mapFloor2 = new Map<string, FloorCorridorNode>(
    destFloor.corridorNodes.map(n => [n.id, n])
  );
  const coords2: [number, number][] = pathPart2.nodeIds.map(nid => {
    const n = mapFloor2.get(nid);
    return n ? [n.x, n.y] : [0, 0];
  });
  coords2.push([targetRoom.doorLocation.x, targetRoom.doorLocation.y]);

  // Construct turn-by-turn steps
  const steps: IndoorStep[] = [];
  steps.push({
    stepNumber: 1,
    floorName: entranceFloor.floorName,
    instruction: `Enter ${building.name} via ${entranceNode.label || 'Main Entrance'} on ${entranceFloor.floorName}.`,
    distanceMeters: 0,
    isAccessible: true
  });

  pathPart1.edges.forEach((edge, idx) => {
    const nextNode = mapFloor1.get(pathPart1.nodeIds[idx + 1]);
    steps.push({
      stepNumber: steps.length + 1,
      floorName: entranceFloor.floorName,
      instruction: `Follow corridor to ${nextNode?.label || 'waypoint'} (${edge.distanceMeters}m).`,
      distanceMeters: edge.distanceMeters,
      isAccessible: edge.isAccessible
    });
  });

  // Floor transition step
  steps.push({
    stepNumber: steps.length + 1,
    floorName: destFloor.floorName,
    instruction:
      bestConnector.type === 'elevator'
        ? `Take ${bestConnector.startNode.label || 'Elevator'} up to ${destFloor.floorName} (♿ Step-Free).`
        : `Take ${bestConnector.startNode.label || 'Stairs'} up to ${destFloor.floorName} (⚠️ Stairs).`,
    distanceMeters: 8,
    isAccessible: bestConnector.isAccessible,
    isFloorChange: true
  });

  pathPart2.edges.forEach((edge, idx) => {
    const nextNode = mapFloor2.get(pathPart2.nodeIds[idx + 1]);
    steps.push({
      stepNumber: steps.length + 1,
      floorName: destFloor.floorName,
      instruction: `On ${destFloor.floorName}, proceed towards ${nextNode?.label || 'waypoint'} (${edge.distanceMeters}m).`,
      distanceMeters: edge.distanceMeters,
      isAccessible: edge.isAccessible
    });
  });

  steps.push({
    stepNumber: steps.length + 1,
    floorName: destFloor.floorName,
    instruction: `Arrive at Room ${targetRoom.roomNumber} (${targetRoom.name}) on ${destFloor.floorName}.`,
    distanceMeters: 2,
    isAccessible: targetRoom.isAccessible
  });

  const floorChangeInstructions = [
    `Floor Change: Transition from ${entranceFloor.floorName} to ${destFloor.floorName} using ${bestConnector.type === 'elevator' ? 'Elevator (Step-Free)' : 'Stairwell'}.`
  ];

  return {
    status: 'verified',
    isVerified: true,
    message: 'Multi-floor indoor route verified',
    buildingId: building.id,
    startFloorId: entranceFloor.id,
    destFloorId: destFloor.id,
    destRoom: targetRoom,
    totalIndoorDistanceMeters: pathPart1.totalDistance + pathPart2.totalDistance + 10,
    floorPaths: [
      {
        floorId: entranceFloor.id,
        floorName: entranceFloor.floorName,
        floorNumber: entranceFloor.floorNumber,
        coordinates: coords1,
        nodeIds: pathPart1.nodeIds
      },
      {
        floorId: destFloor.id,
        floorName: destFloor.floorName,
        floorNumber: destFloor.floorNumber,
        coordinates: coords2,
        nodeIds: pathPart2.nodeIds
      }
    ],
    steps,
    floorChangeInstructions,
    isFullyAccessible:
      pathPart1.edges.every(e => e.isAccessible) &&
      bestConnector.isAccessible &&
      pathPart2.edges.every(e => e.isAccessible) &&
      targetRoom.isAccessible,
    warnings: !bestConnector.isAccessible ? ['Warning: This multi-floor route requires stairs.'] : []
  };
}
