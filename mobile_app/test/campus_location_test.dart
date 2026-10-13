import 'package:flutter_test/flutter_test.dart';
import 'package:aware_campus_navigation/models/campus_location.dart';

void main() {
  group('Campus Location Model Deserialization Tests', () {
    test('Correctly parses Mewar Campus location json with accessibility features', () {
      final json = {
        "id": "kumbah_hostel",
        "name": "Maharana Kumbha Hostel",
        "code": "MKH",
        "category": "Hostels",
        "description": "Premier student residence hall with Rooms 1–16.",
        "lat": 25.03220,
        "lng": 74.63690,
        "color": "#10B981",
        "iconType": "hotel",
        "wheelchairAccessible": true,
        "rampAvailable": true,
        "elevatorAvailable": false,
        "facilities": ["Wi-Fi", "RO Water", "Wheelchair Ramp"],
        "entranceNodeId": "node_ent_kumbah",
        "hasIndoorMap": true,
        "indoorBuildingId": "kumba_hostel"
      };

      final location = CampusLocation.fromJson(json);

      expect(location.id, equals('kumbah_hostel'));
      expect(location.name, equals('Maharana Kumbha Hostel'));
      expect(location.wheelchairAccessible, isTrue);
      expect(location.rampAvailable, isTrue);
      expect(location.hasIndoorMap, isTrue);
      expect(location.lat, closeTo(25.03220, 0.0001));
      expect(location.lng, closeTo(74.63690, 0.0001));
      expect(location.facilities.length, equals(3));
    });
  });
}
