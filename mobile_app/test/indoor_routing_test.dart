import 'package:flutter_test/flutter_test.dart';
import 'package:aware_campus_navigation/models/indoor_building.dart';
import 'package:aware_campus_navigation/services/indoor_routing_service.dart';

void main() {
  group('Indoor Routing & Dijkstra Pathfinding Tests', () {
    late BuildingFloor sampleFloor;

    setUp(() {
      final sampleFloorJson = {
        "id": "fl_kumba_0",
        "buildingId": "kumba_hostel",
        "floorNumber": 0,
        "floorName": "Ground Floor",
        "code": "GF",
        "floorPlanImageUrl": "assets/images/kumbah-ground-floor.png",
        "corridorNodes": [
          { "id": "node_c_kumba_gf_ent", "floorId": "fl_kumba_0", "type": "entrance", "label": "Hostel Ground Floor Entrance", "x": 53.7, "y": 27.1, "isAccessible": true },
          { "id": "node_c_kumba_gf_junction", "floorId": "fl_kumba_0", "type": "corridor", "label": "Central Corridor Entrance Cross", "x": 56.2, "y": 38.1, "isAccessible": true },
          { "id": "node_c_kumba_gf_washroom_w", "floorId": "fl_kumba_0", "type": "corridor", "label": "West Washroom Entrance", "x": 16.5, "y": 58.5, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_1_2", "floorId": "fl_kumba_0", "type": "corridor", "label": "West Corridor (Rooms 1 & 2)", "x": 27.8, "y": 57.9, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_3_4", "floorId": "fl_kumba_0", "type": "corridor", "label": "West Corridor (Rooms 3 & 4)", "x": 37.1, "y": 53.5, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_5_6", "floorId": "fl_kumba_0", "type": "corridor", "label": "West Corridor (Rooms 5 & 6)", "x": 45.9, "y": 49.8, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_7_8", "floorId": "fl_kumba_0", "type": "corridor", "label": "Mid-West Corridor (Rooms 7 & 8)", "x": 54.7, "y": 45.4, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_9_10", "floorId": "fl_kumba_0", "type": "corridor", "label": "Mid-East Corridor (Rooms 9 & 10)", "x": 68.4, "y": 39.6, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_11_12", "floorId": "fl_kumba_0", "type": "corridor", "label": "East Corridor (Rooms 11 & 12)", "x": 76.7, "y": 35.2, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_13_14", "floorId": "fl_kumba_0", "type": "corridor", "label": "East Corridor (Rooms 13 & 14)", "x": 84.5, "y": 31.5, "isAccessible": true },
          { "id": "node_c_kumba_gf_sp_15_16", "floorId": "fl_kumba_0", "type": "corridor", "label": "East Corridor (Rooms 15 & 16)", "x": 92.3, "y": 27.8, "isAccessible": true },
          { "id": "node_c_kumba_gf_washroom_e", "floorId": "fl_kumba_0", "type": "corridor", "label": "East Washroom Entrance", "x": 93.3, "y": 26.4, "isAccessible": true }
        ],
        "corridorEdges": [
          { "id": "e_kumba_gf_ent_junc", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_ent", "target": "node_c_kumba_gf_junction", "distanceMeters": 4, "isAccessible": true, "description": "Entrance to Junction" },
          { "id": "e_kumba_gf_junc_w", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_junction", "target": "node_c_kumba_gf_sp_7_8", "distanceMeters": 3, "isAccessible": true, "description": "Junction West" },
          { "id": "e_kumba_gf_sp_7_5", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_7_8", "target": "node_c_kumba_gf_sp_5_6", "distanceMeters": 4, "isAccessible": true, "description": "Past 5-6" },
          { "id": "e_kumba_gf_sp_5_3", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_5_6", "target": "node_c_kumba_gf_sp_3_4", "distanceMeters": 4, "isAccessible": true, "description": "Past 3-4" },
          { "id": "e_kumba_gf_sp_3_1", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_3_4", "target": "node_c_kumba_gf_sp_1_2", "distanceMeters": 4, "isAccessible": true, "description": "Past 1-2" },
          { "id": "e_kumba_gf_sp_1_wash", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_1_2", "target": "node_c_kumba_gf_washroom_w", "distanceMeters": 5, "isAccessible": true, "description": "Approach West Washroom" },
          { "id": "e_kumba_gf_junc_e", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_junction", "target": "node_c_kumba_gf_sp_9_10", "distanceMeters": 4, "isAccessible": true, "description": "Junction East" },
          { "id": "e_kumba_gf_sp_9_11", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_9_10", "target": "node_c_kumba_gf_sp_11_12", "distanceMeters": 4, "isAccessible": true, "description": "Past 11-12" },
          { "id": "e_kumba_gf_sp_11_13", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_11_12", "target": "node_c_kumba_gf_sp_13_14", "distanceMeters": 4, "isAccessible": true, "description": "Past 13-14" },
          { "id": "e_kumba_gf_sp_13_15", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_13_14", "target": "node_c_kumba_gf_sp_15_16", "distanceMeters": 4, "isAccessible": true, "description": "Past 15-16" },
          { "id": "e_kumba_gf_sp_15_wash", "floorId": "fl_kumba_0", "source": "node_c_kumba_gf_sp_15_16", "target": "node_c_kumba_gf_washroom_e", "distanceMeters": 3, "isAccessible": true, "description": "Approach East Washroom" }
        ],
        "rooms": [
          { "id": "room_kumba_1", "roomNumber": "1", "name": "Room 1 (Top Row)", "type": "Hostel Room", "description": "Room 1 NW", "x": 13.5, "y": 35.5, "width": 9.5, "height": 17.5, "doorLocation": { "x": 25.2, "y": 52.8 }, "doorCorridorNodeId": "node_c_kumba_gf_sp_1_2", "isAccessible": true, "accessibilityNotes": "Step-free" },
          { "id": "room_kumba_7", "roomNumber": "7", "name": "Room 7 (Top Row)", "type": "Hostel Room", "description": "Room 7 West", "x": 41.5, "y": 23.5, "width": 9.5, "height": 17.5, "doorLocation": { "x": 52.0, "y": 40.3 }, "doorCorridorNodeId": "node_c_kumba_gf_sp_7_8", "isAccessible": true, "accessibilityNotes": "Step-free" },
          { "id": "room_kumba_16", "roomNumber": "16", "name": "Room 16 (Bottom Row)", "type": "Hostel Room", "description": "Room 16 SE", "x": 87.0, "y": 28.5, "width": 9.5, "height": 17.5, "doorLocation": { "x": 95.2, "y": 31.5 }, "doorCorridorNodeId": "node_c_kumba_gf_sp_15_16", "isAccessible": true, "accessibilityNotes": "Step-free" },
          { "id": "room_kumba_washroom_west", "roomNumber": "W-WR", "name": "West Washroom", "type": "Restroom", "description": "West Washroom", "x": 2.0, "y": 52.0, "width": 14.0, "height": 26.0, "doorLocation": { "x": 16.5, "y": 58.5 }, "doorCorridorNodeId": "node_c_kumba_gf_washroom_w", "isAccessible": true, "accessibilityNotes": "Step-free" }
        ]
      };

      sampleFloor = BuildingFloor.fromJson(sampleFloorJson);
    });

    test('Route from Entrance to Room 1 (West Wing)', () {
      final room1 = sampleFloor.rooms.firstWhere((r) => r.roomNumber == '1');
      final result = IndoorRoutingService().calculateRouteToRoom(
        floor: sampleFloor,
        targetRoom: room1,
      );

      expect(result.startNodeId, equals('node_c_kumba_gf_ent'));
      expect(result.targetNodeId, equals('node_c_kumba_gf_sp_1_2'));
      expect(result.isAccessible, isTrue);
      expect(result.pathCoordinates.isNotEmpty, isTrue);
      expect(result.steps.length, greaterThanOrEqualTo(3));
      // Steps should include bilingual guidance
      expect(result.steps.first.instructionEn, contains('Kumbha Hostel'));
      expect(result.steps.first.instructionHi, contains('कुंभा हॉस्टल'));
    });

    test('Route from Entrance to Room 16 (East Wing)', () {
      final room16 = sampleFloor.rooms.firstWhere((r) => r.roomNumber == '16');
      final result = IndoorRoutingService().calculateRouteToRoom(
        floor: sampleFloor,
        targetRoom: room16,
      );

      expect(result.targetNodeId, equals('node_c_kumba_gf_sp_15_16'));
      expect(result.isAccessible, isTrue);
      expect(result.steps.any((s) => s.instructionEn.contains('East Corridor')), isTrue);
    });

    test('Route from Entrance to West Washroom', () {
      final washroom = sampleFloor.rooms.firstWhere((r) => r.roomNumber == 'W-WR');
      final result = IndoorRoutingService().calculateRouteToRoom(
        floor: sampleFloor,
        targetRoom: washroom,
      );

      expect(result.targetNodeId, equals('node_c_kumba_gf_washroom_w'));
      expect(result.isAccessible, isTrue);
    });
  });
}
