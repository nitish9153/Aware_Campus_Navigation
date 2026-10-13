import 'package:flutter/material.dart';
import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/indoor_building.dart';
import '../models/route_result.dart';
import '../services/api_service.dart';
import '../services/indoor_routing_service.dart';
import '../widgets/floor_plan_canvas.dart';

class HostelNavigatorScreen extends StatefulWidget {
  final String? initialRoomNumber;

  const HostelNavigatorScreen({super.key, this.initialRoomNumber});

  @override
  State<HostelNavigatorScreen> createState() => _HostelNavigatorScreenState();
}

class _HostelNavigatorScreenState extends State<HostelNavigatorScreen> {
  BuildingFloor? _groundFloor;
  FloorRoom? _selectedRoom;
  IndoorRouteResult? _activeRoute;
  bool _isLoading = true;
  bool _showHindi = false;

  @override
  void initState() {
    super.initState();
    _loadHostelData();
  }

  Future<void> _loadHostelData() async {
    final building = await ApiService().fetchKumbhaHostel();
    if (mounted && building != null) {
      final floor = building.floors.firstWhere(
        (f) => f.floorNumber == 0,
        orElse: () => building.floors.first,
      );

      FloorRoom? targetRoom;
      if (widget.initialRoomNumber != null) {
        try {
          targetRoom = floor.rooms.firstWhere(
            (r) => r.roomNumber == widget.initialRoomNumber,
          );
        } catch (_) {}
      }

      setState(() {
        _groundFloor = floor;
        _isLoading = false;
        if (targetRoom != null) {
          _selectRoom(targetRoom);
        }
      });
    }
  }

  void _selectRoom(FloorRoom room) {
    if (_groundFloor == null) return;
    final route = IndoorRoutingService().calculateRouteToRoom(
      floor: _groundFloor!,
      targetRoom: room,
    );
    setState(() {
      _selectedRoom = room;
      _activeRoute = route;
    });
  }

  void _clearRoute() {
    setState(() {
      _selectedRoom = null;
      _activeRoute = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kumbha Hostel Indoor Navigator'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(
              _showHindi ? Icons.translate_rounded : Icons.language_rounded,
              color: AppTheme.mewarBlue,
            ),
            tooltip: _showHindi ? 'Switch to English' : 'Switch to Hindi (हिंदी)',
            onPressed: () {
              setState(() {
                _showHindi = !_showHindi;
              });
            },
          ),
          if (_selectedRoom != null)
            IconButton(
              icon: const Icon(Icons.clear_rounded),
              tooltip: 'Clear Selection',
              onPressed: _clearRoute,
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _groundFloor == null
              ? const Center(child: Text('Floor plan data unavailable.'))
              : Column(
                  children: [
                    // Top Room Chip Selector (1–16 + Washrooms)
                    _buildRoomSelectorBar(),

                    // Interactive Architectural Floor Plan Canvas
                    Expanded(
                      flex: 4,
                      child: Container(
                        color: const Color(0xFF0F172A),
                        child: FloorPlanCanvas(
                          floor: _groundFloor!,
                          selectedRoom: _selectedRoom,
                          activeRoute: _activeRoute,
                          onRoomSelected: _selectRoom,
                        ),
                      ),
                    ),

                    // Disclaimer notice (Requirement 9)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      color: const Color(0xFF1E293B),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline,
                              size: 14, color: Colors.blue.shade200),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              AppConstants.floorPlanDisclaimer,
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.blue.shade100,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Route Summary & Turn-by-Turn Guidance Drawer
                    Expanded(
                      flex: 3,
                      child: _buildRouteDetailsPanel(),
                    ),
                  ],
                ),
    );
  }

  Widget _buildRoomSelectorBar() {
    if (_groundFloor == null) return const SizedBox.shrink();

    // Sort rooms: 1 to 16, then washrooms
    final rooms = List<FloorRoom>.from(_groundFloor!.rooms);
    rooms.sort((a, b) {
      final aNum = int.tryParse(a.roomNumber) ?? 999;
      final bNum = int.tryParse(b.roomNumber) ?? 999;
      return aNum.compareTo(bNum);
    });

    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      color: Colors.white,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: rooms.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (ctx, index) {
          final room = rooms[index];
          final isSelected = _selectedRoom?.id == room.id;
          final isWashroom = room.roomNumber.contains('WR');

          return FilterChip(
            selected: isSelected,
            label: Text(
              isWashroom ? room.roomNumber : 'Room ${room.roomNumber}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.white : AppTheme.primaryDark,
              ),
            ),
            selectedColor: AppTheme.selectedRoomGreen,
            backgroundColor: isWashroom
                ? Colors.purple.shade50
                : Colors.grey.shade100,
            checkmarkColor: Colors.white,
            side: BorderSide(
              color: isSelected
                  ? AppTheme.selectedRoomGreen
                  : Colors.grey.shade300,
            ),
            onSelected: (_) => _selectRoom(room),
          );
        },
      ),
    );
  }

  Widget _buildRouteDetailsPanel() {
    if (_selectedRoom == null || _activeRoute == null) {
      return Container(
        color: Colors.white,
        padding: const EdgeInsets.all(20),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.touch_app_rounded,
                  size: 38, color: Colors.grey.shade400),
              const SizedBox(height: 12),
              Text(
                'Select a room above or tap on the floor plan',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Rooms 1–16 and washrooms calibrated with step-free guidance',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            ],
          ),
        ),
      );
    }

    final route = _activeRoute!;

    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header summary card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.grey.shade50,
            child: Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.selectedRoomGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Room ${_selectedRoom!.roomNumber}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _selectedRoom!.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        'Total Distance: ${route.totalDistanceMeters.toStringAsFixed(1)}m • Step-free',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (route.isAccessible)
                  const Icon(
                    Icons.accessible_rounded,
                    color: AppTheme.accessibleGreen,
                    size: 22,
                  ),
              ],
            ),
          ),

          // Turn-by-turn guidance list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: route.steps.length,
              itemBuilder: (ctx, index) {
                final step = route.steps[index];
                IconData iconData = Icons.arrow_forward_rounded;
                if (step.iconName == 'enter') iconData = Icons.login_rounded;
                if (step.iconName == 'turn_left') iconData = Icons.turn_left_rounded;
                if (step.iconName == 'turn_right') iconData = Icons.turn_right_rounded;
                if (step.iconName == 'destination') iconData = Icons.place_rounded;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: step.iconName == 'destination'
                            ? Colors.red.shade100
                            : AppTheme.mewarBlue.withOpacity(0.12),
                        child: Icon(
                          iconData,
                          size: 14,
                          color: step.iconName == 'destination'
                              ? Colors.red
                              : AppTheme.mewarBlue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _showHindi
                                  ? step.instructionHi
                                  : step.instructionEn,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (index < route.steps.length - 1)
                              Text(
                                '${step.distanceMeters.toStringAsFixed(1)}m',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
