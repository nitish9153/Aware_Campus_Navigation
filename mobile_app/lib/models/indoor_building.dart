class IndoorBuilding {
  final String id;
  final String name;
  final String category;
  final String description;
  final String outdoorEntranceNodeId;
  final List<BuildingFloor> floors;

  IndoorBuilding({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.outdoorEntranceNodeId,
    required this.floors,
  });

  factory IndoorBuilding.fromJson(Map<String, dynamic> json) {
    final floorList = (json['floors'] as List<dynamic>?)
            ?.map((f) => BuildingFloor.fromJson(f as Map<String, dynamic>))
            .toList() ??
        [];

    return IndoorBuilding(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Building',
      category: json['category']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      outdoorEntranceNodeId: json['outdoorEntranceNodeId']?.toString() ?? '',
      floors: floorList,
    );
  }
}

class BuildingFloor {
  final String id;
  final String buildingId;
  final int floorNumber;
  final String floorName;
  final String code;
  final String floorPlanImageUrl;
  final List<FloorCorridorNode> corridorNodes;
  final List<FloorCorridorEdge> corridorEdges;
  final List<FloorRoom> rooms;

  BuildingFloor({
    required this.id,
    required this.buildingId,
    required this.floorNumber,
    required this.floorName,
    required this.code,
    required this.floorPlanImageUrl,
    required this.corridorNodes,
    required this.corridorEdges,
    required this.rooms,
  });

  factory BuildingFloor.fromJson(Map<String, dynamic> json) {
    return BuildingFloor(
      id: json['id']?.toString() ?? '',
      buildingId: json['buildingId']?.toString() ?? '',
      floorNumber: (json['floorNumber'] as num?)?.toInt() ?? 0,
      floorName: json['floorName']?.toString() ?? 'Ground Floor',
      code: json['code']?.toString() ?? 'GF',
      floorPlanImageUrl: json['floorPlanImageUrl']?.toString() ?? '',
      corridorNodes: (json['corridorNodes'] as List<dynamic>?)
              ?.map((n) => FloorCorridorNode.fromJson(n as Map<String, dynamic>))
              .toList() ??
          [],
      corridorEdges: (json['corridorEdges'] as List<dynamic>?)
              ?.map((e) => FloorCorridorEdge.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      rooms: (json['rooms'] as List<dynamic>?)
              ?.map((r) => FloorRoom.fromJson(r as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class FloorCorridorNode {
  final String id;
  final String floorId;
  final String type; // 'entrance', 'corridor', 'washroom'
  final String label;
  final double x; // 0..100 percentage of plan width
  final double y; // 0..100 percentage of plan height
  final bool isAccessible;

  FloorCorridorNode({
    required this.id,
    required this.floorId,
    required this.type,
    required this.label,
    required this.x,
    required this.y,
    required this.isAccessible,
  });

  factory FloorCorridorNode.fromJson(Map<String, dynamic> json) {
    return FloorCorridorNode(
      id: json['id']?.toString() ?? '',
      floorId: json['floorId']?.toString() ?? '',
      type: json['type']?.toString() ?? 'corridor',
      label: json['label']?.toString() ?? '',
      x: (json['x'] as num?)?.toDouble() ?? 0.0,
      y: (json['y'] as num?)?.toDouble() ?? 0.0,
      isAccessible: json['isAccessible'] == true,
    );
  }
}

class FloorCorridorEdge {
  final String id;
  final String floorId;
  final String source;
  final String target;
  final double distanceMeters;
  final bool isAccessible;
  final String description;

  FloorCorridorEdge({
    required this.id,
    required this.floorId,
    required this.source,
    required this.target,
    required this.distanceMeters,
    required this.isAccessible,
    required this.description,
  });

  factory FloorCorridorEdge.fromJson(Map<String, dynamic> json) {
    return FloorCorridorEdge(
      id: json['id']?.toString() ?? '',
      floorId: json['floorId']?.toString() ?? '',
      source: json['source']?.toString() ?? '',
      target: json['target']?.toString() ?? '',
      distanceMeters: (json['distanceMeters'] as num?)?.toDouble() ?? 1.0,
      isAccessible: json['isAccessible'] == true,
      description: json['description']?.toString() ?? '',
    );
  }
}

class FloorRoom {
  final String id;
  final String roomNumber;
  final String name;
  final String type;
  final String description;
  final double x; // Center X (0..100)
  final double y; // Center Y (0..100)
  final double width;
  final double height;
  final Point2D? doorLocation;
  final String doorCorridorNodeId;
  final bool isAccessible;
  final String accessibilityNotes;

  FloorRoom({
    required this.id,
    required this.roomNumber,
    required this.name,
    required this.type,
    required this.description,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.doorLocation,
    required this.doorCorridorNodeId,
    required this.isAccessible,
    required this.accessibilityNotes,
  });

  factory FloorRoom.fromJson(Map<String, dynamic> json) {
    Point2D? door;
    if (json['doorLocation'] is Map) {
      final d = json['doorLocation'] as Map<String, dynamic>;
      door = Point2D(
        x: (d['x'] as num?)?.toDouble() ?? 0.0,
        y: (d['y'] as num?)?.toDouble() ?? 0.0,
      );
    }

    return FloorRoom(
      id: json['id']?.toString() ?? '',
      roomNumber: json['roomNumber']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      type: json['type']?.toString() ?? 'Hostel Room',
      description: json['description']?.toString() ?? '',
      x: (json['x'] as num?)?.toDouble() ?? 0.0,
      y: (json['y'] as num?)?.toDouble() ?? 0.0,
      width: (json['width'] as num?)?.toDouble() ?? 10.0,
      height: (json['height'] as num?)?.toDouble() ?? 15.0,
      doorLocation: door,
      doorCorridorNodeId: json['doorCorridorNodeId']?.toString() ?? '',
      isAccessible: json['isAccessible'] == true,
      accessibilityNotes: json['accessibilityNotes']?.toString() ?? '',
    );
  }
}

class Point2D {
  final double x;
  final double y;

  Point2D({required this.x, required this.y});
}
