import 'indoor_building.dart';

class IndoorRouteStep {
  final int stepNumber;
  final String instructionEn;
  final String instructionHi;
  final double distanceMeters;
  final String iconName; // 'straight', 'turn_left', 'turn_right', 'enter', 'destination'
  final bool isAccessible;
  final Point2D coordinate;

  IndoorRouteStep({
    required this.stepNumber,
    required this.instructionEn,
    required this.instructionHi,
    required this.distanceMeters,
    required this.iconName,
    required this.isAccessible,
    required this.coordinate,
  });
}

class IndoorRouteResult {
  final String startNodeId;
  final String targetNodeId;
  final String targetName;
  final double totalDistanceMeters;
  final List<Point2D> pathCoordinates;
  final List<FloorCorridorNode> visitedNodes;
  final List<IndoorRouteStep> steps;
  final bool isAccessible;
  final String? accessibilityWarning;

  IndoorRouteResult({
    required this.startNodeId,
    required this.targetNodeId,
    required this.targetName,
    required this.totalDistanceMeters,
    required this.pathCoordinates,
    required this.visitedNodes,
    required this.steps,
    required this.isAccessible,
    this.accessibilityWarning,
  });
}
