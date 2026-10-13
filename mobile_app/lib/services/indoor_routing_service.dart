import '../models/indoor_building.dart';
import '../models/route_result.dart';

class IndoorRoutingService {
  static final IndoorRoutingService _instance = IndoorRoutingService._internal();
  factory IndoorRoutingService() => _instance;
  IndoorRoutingService._internal();

  IndoorRouteResult calculateRouteToRoom({
    required BuildingFloor floor,
    required FloorRoom targetRoom,
    String startNodeId = 'node_c_kumba_gf_ent',
    bool stepFreeOnly = true,
  }) {
    // 1. Map nodes by ID
    final Map<String, FloorCorridorNode> nodeMap = {
      for (var n in floor.corridorNodes) n.id: n
    };

    final destinationNodeId = targetRoom.doorCorridorNodeId;

    // 2. Build adjacency list from floor.corridorEdges
    final Map<String, List<_EdgeItem>> adj = {
      for (var n in floor.corridorNodes) n.id: []
    };

    for (final e in floor.corridorEdges) {
      if (stepFreeOnly && !e.isAccessible) continue;
      if (adj.containsKey(e.source) && adj.containsKey(e.target)) {
        adj[e.source]!.add(_EdgeItem(
          targetId: e.target,
          weight: e.distanceMeters,
          description: e.description,
        ));
        adj[e.target]!.add(_EdgeItem(
          targetId: e.source,
          weight: e.distanceMeters,
          description: e.description,
        ));
      }
    }

    // 3. Dijkstra Shortest Path
    final Map<String, double> dist = {
      for (var n in floor.corridorNodes) n.id: double.infinity
    };
    final Map<String, String?> prev = {
      for (var n in floor.corridorNodes) n.id: null
    };
    final Set<String> visited = {};

    dist[startNodeId] = 0.0;

    while (true) {
      String? current;
      double shortest = double.infinity;

      for (final entry in dist.entries) {
        if (!visited.contains(entry.key) && entry.value < shortest) {
          shortest = entry.value;
          current = entry.key;
        }
      }

      if (current == null || shortest == double.infinity) break;
      if (current == destinationNodeId) break;

      visited.add(current);

      final neighbors = adj[current] ?? [];
      for (final edge in neighbors) {
        if (!visited.contains(edge.targetId)) {
          final newDist = dist[current]! + edge.weight;
          if (newDist < dist[edge.targetId]!) {
            dist[edge.targetId] = newDist;
            prev[edge.targetId] = current;
          }
        }
      }
    }

    // Reconstruct node path
    final List<String> nodePath = [];
    String? curr = destinationNodeId;
    while (curr != null) {
      nodePath.insert(0, curr);
      curr = prev[curr];
    }

    // Convert to FloorCorridorNodes
    final List<FloorCorridorNode> visitedNodes = [];
    for (final id in nodePath) {
      if (nodeMap.containsKey(id)) {
        visitedNodes.add(nodeMap[id]!);
      }
    }

    // Build 2D pixel-percent path coordinates
    final List<Point2D> pathCoordinates = [];
    for (final node in visitedNodes) {
      pathCoordinates.add(Point2D(x: node.x, y: node.y));
    }

    // Append door location if available
    if (targetRoom.doorLocation != null) {
      pathCoordinates.add(Point2D(
        x: targetRoom.doorLocation!.x,
        y: targetRoom.doorLocation!.y,
      ));
    } else {
      pathCoordinates.add(Point2D(x: targetRoom.x, y: targetRoom.y));
    }

    final totalDist = (dist[destinationNodeId] ?? 0.0) +
        (targetRoom.doorLocation != null ? 1.5 : 0.0);

    // Generate bilingual turn-by-turn steps
    final steps = _generateBilingualSteps(
      visitedNodes: visitedNodes,
      targetRoom: targetRoom,
      totalDistance: totalDist,
    );

    return IndoorRouteResult(
      startNodeId: startNodeId,
      targetNodeId: destinationNodeId,
      targetName: 'Room ${targetRoom.roomNumber} (${targetRoom.name})',
      totalDistanceMeters: totalDist,
      pathCoordinates: pathCoordinates,
      visitedNodes: visitedNodes,
      steps: steps,
      isAccessible: targetRoom.isAccessible,
      accessibilityWarning: targetRoom.isAccessible
          ? null
          : 'Notice: Level transition or threshold alert for this room.',
    );
  }

  List<IndoorRouteStep> _generateBilingualSteps({
    required List<FloorCorridorNode> visitedNodes,
    required FloorRoom targetRoom,
    required double totalDistance,
  }) {
    final List<IndoorRouteStep> steps = [];
    int stepNum = 1;

    // Step 1: Entrance step
    steps.add(IndoorRouteStep(
      stepNumber: stepNum++,
      instructionEn: 'Enter Kumbha Hostel via the ground floor entrance foyer.',
      instructionHi: 'कुंभा हॉस्टल भूतल मुख्य प्रवेश द्वार से अंदर जाएं।',
      distanceMeters: 4.0,
      iconName: 'enter',
      isAccessible: true,
      coordinate: visitedNodes.isNotEmpty
          ? Point2D(x: visitedNodes.first.x, y: visitedNodes.first.y)
          : Point2D(x: 53.7, y: 27.1),
    ));

    // Determine direction (West or East)
    final isWestWing = targetRoom.doorLocation != null
        ? targetRoom.doorLocation!.x < 55.0
        : targetRoom.x < 55.0;

    final isWashroom = targetRoom.roomNumber.contains('WR');

    if (isWestWing) {
      steps.add(IndoorRouteStep(
        stepNumber: stepNum++,
        instructionEn: 'Turn right at the junction into the West Corridor toward Rooms 1–8.',
        instructionHi: 'जंक्शन से दाईं ओर मुड़ें - कमरा 1-8 की ओर पश्चिमी गलियारे में चलें।',
        distanceMeters: 3.5,
        iconName: 'turn_right',
        isAccessible: true,
        coordinate: Point2D(x: 56.2, y: 38.1),
      ));
    } else {
      steps.add(IndoorRouteStep(
        stepNumber: stepNum++,
        instructionEn: 'Turn left at the junction into the East Corridor toward Rooms 9–16.',
        instructionHi: 'जंक्शन से बाईं ओर मुड़ें - कमरा 9-16 की ओर पूर्वी गलियारे में चलें।',
        distanceMeters: 4.0,
        iconName: 'turn_left',
        isAccessible: true,
        coordinate: Point2D(x: 56.2, y: 38.1),
      ));
    }

    // Intermediate corridor checkpoints
    for (int i = 2; i < visitedNodes.length; i++) {
      final node = visitedNodes[i];
      steps.add(IndoorRouteStep(
        stepNumber: stepNum++,
        instructionEn: 'Continue straight along the corridor past ${node.label}.',
        instructionHi: 'गलियारे में सीधे आगे बढ़ें (${node.label})।',
        distanceMeters: 4.0,
        iconName: 'straight',
        isAccessible: node.isAccessible,
        coordinate: Point2D(x: node.x, y: node.y),
      ));
    }

    // Destination Arrival step
    final roomNum = targetRoom.roomNumber;
    final int? roomInt = int.tryParse(roomNum);
    String sideHint = 'ahead';
    String sideHintHi = 'आगे';
    if (roomInt != null) {
      if (roomInt % 2 != 0) {
        sideHint = 'on your right (Top row)';
        sideHintHi = 'आपकी दाईं ओर (ऊपरी पंक्ति)';
      } else {
        sideHint = 'on your left (Bottom row)';
        sideHintHi = 'आपकी बाईं ओर (निचली पंक्ति)';
      }
    }

    steps.add(IndoorRouteStep(
      stepNumber: stepNum++,
      instructionEn: isWashroom
          ? 'Arrive at ${targetRoom.name}. Step-free entry available.'
          : 'Arrive at Room $roomNum $sideHint. Step-free doorway with clear threshold.',
      instructionHi: isWashroom
          ? '${targetRoom.name} पर पहुंच गए हैं। सुगम पहुंच उपलब्ध है।'
          : 'कमरा $roomNum पर पहुंच गए हैं ($sideHintHi)। सुगम चौखट उपलब्ध है।',
      distanceMeters: 1.5,
      iconName: 'destination',
      isAccessible: targetRoom.isAccessible,
      coordinate: targetRoom.doorLocation ?? Point2D(x: targetRoom.x, y: targetRoom.y),
    ));

    return steps;
  }
}

class _EdgeItem {
  final String targetId;
  final double weight;
  final String description;

  _EdgeItem({
    required this.targetId,
    required this.weight,
    required this.description,
  });
}
