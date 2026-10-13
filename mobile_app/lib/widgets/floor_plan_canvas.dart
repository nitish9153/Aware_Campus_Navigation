import 'package:flutter/material.dart';
import '../constants/app_theme.dart';
import '../models/indoor_building.dart';
import '../models/route_result.dart';

class FloorPlanCanvas extends StatelessWidget {
  final BuildingFloor floor;
  final FloorRoom? selectedRoom;
  final IndoorRouteResult? activeRoute;
  final Function(FloorRoom room) onRoomSelected;

  const FloorPlanCanvas({
    super.key,
    required this.floor,
    required this.selectedRoom,
    required this.activeRoute,
    required this.onRoomSelected,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Image aspect ratio: 800x450 = 16:9
        const double imageAspectRatio = 16 / 9;
        final double canvasWidth = constraints.maxWidth;
        final double canvasHeight = canvasWidth / imageAspectRatio;

        return InteractiveViewer(
          minScale: 0.8,
          maxScale: 3.5,
          child: Center(
            child: SizedBox(
              width: canvasWidth,
              height: canvasHeight,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // 1. Base floor plan architectural image
                  Image.asset(
                    'assets/images/kumbah-ground-floor.png',
                    fit: BoxFit.fill,
                    errorBuilder: (ctx, err, stack) {
                      return Container(
                        color: const Color(0xFF0F172A),
                        child: const Center(
                          child: Text(
                            'Kumbha Hostel Floor Plan',
                            style: TextStyle(color: Colors.white70),
                          ),
                        ),
                      );
                    },
                  ),

                  // 2. Custom Painter overlay for Route Polyline & Entrance marker
                  CustomPaint(
                    size: Size(canvasWidth, canvasHeight),
                    painter: _FloorPlanPainter(
                      activeRoute: activeRoute,
                      entranceNode: floor.corridorNodes.firstWhere(
                        (n) => n.type == 'entrance',
                        orElse: () => floor.corridorNodes.first,
                      ),
                    ),
                  ),

                  // 3. Interactive Tappable Room Hotspots
                  ...floor.rooms.map((room) {
                    final bool isSelected = selectedRoom?.id == room.id;
                    final double left = (room.x / 100) * canvasWidth;
                    final double top = (room.y / 100) * canvasHeight;
                    final double w = (room.width / 100) * canvasWidth;
                    final double h = (room.height / 100) * canvasHeight;

                    return Positioned(
                      left: left,
                      top: top,
                      width: w,
                      height: h,
                      child: GestureDetector(
                        onTap: () => onRoomSelected(room),
                        behavior: HitTestBehavior.opaque,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.selectedRoomGreen.withOpacity(0.45)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: isSelected
                                  ? AppTheme.selectedRoomGreen
                                  : Colors.transparent,
                              width: isSelected ? 2.5 : 1.0,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppTheme.selectedRoomGreen.withOpacity(0.6),
                                      blurRadius: 10,
                                      spreadRadius: 2,
                                    ),
                                  ]
                                : [],
                          ),
                          child: Center(
                            child: isSelected
                                ? Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 5, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppTheme.selectedRoomGreen,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      room.roomNumber,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  )
                                : const SizedBox.shrink(),
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _FloorPlanPainter extends CustomPainter {
  final IndoorRouteResult? activeRoute;
  final FloorCorridorNode entranceNode;

  _FloorPlanPainter({
    required this.activeRoute,
    required this.entranceNode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Entrance Marker Pin
    final double entX = (entranceNode.x / 100) * size.width;
    final double entY = (entranceNode.y / 100) * size.height;

    final entGlowPaint = Paint()
      ..color = AppTheme.accessibleGreen.withOpacity(0.4)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(entX, entY), 12, entGlowPaint);

    final entPaint = Paint()
      ..color = AppTheme.accessibleGreen
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(entX, entY), 6, entPaint);

    // 2. Draw Active Navigation Route
    if (activeRoute != null && activeRoute!.pathCoordinates.isNotEmpty) {
      final points = activeRoute!.pathCoordinates.map((pt) {
        return Offset(
          (pt.x / 100) * size.width,
          (pt.y / 100) * size.height,
        );
      }).toList();

      // Outer glowing stroke
      final glowPaint = Paint()
        ..color = const Color(0xFF10B981).withOpacity(0.55)
        ..strokeWidth = 7.0
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;

      final path = Path();
      path.moveTo(points.first.dx, points.first.dy);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      canvas.drawPath(path, glowPaint);

      // Inner crisp neon line
      final linePaint = Paint()
        ..color = const Color(0xFF34D399)
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;
      canvas.drawPath(path, linePaint);

      // Intermediate waypoints
      final dotPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;

      for (int i = 1; i < points.length - 1; i++) {
        canvas.drawCircle(points[i], 3.5, dotPaint);
      }

      // Destination target pin
      final destOffset = points.last;
      final destOuterPaint = Paint()
        ..color = Colors.redAccent.withOpacity(0.4)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(destOffset, 12, destOuterPaint);

      final destCorePaint = Paint()
        ..color = Colors.redAccent
        ..style = PaintingStyle.fill;
      canvas.drawCircle(destOffset, 6, destCorePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _FloorPlanPainter oldDelegate) {
    return oldDelegate.activeRoute != activeRoute;
  }
}
