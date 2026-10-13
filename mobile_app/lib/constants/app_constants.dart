import 'package:latlong2/latlong.dart';

class AppConstants {
  static const String appName = 'Aware Campus Navigation';
  static const String universityName = 'Mewar University';
  static const String campusLocationName = 'Gangrar, Chittorgarh, Rajasthan';

  // Verified coordinates of Mewar University campus center
  static const double mewarLatitude = 25.031338;
  static const double mewarLongitude = 74.636520;
  static const LatLng campusCenter = LatLng(mewarLatitude, mewarLongitude);
  static const double defaultZoom = 17.0;

  // Real OpenStreetMap Tile URL & Attribution (No Google Maps API Key required!)
  static const String osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const String osmAttribution = '© OpenStreetMap contributors';

  // Backend Endpoints
  // In Android Emulator, 10.0.2.2 maps directly to the host machine's localhost (127.0.0.1)
  static const String defaultApiBaseUrl = 'http://127.0.0.1:8000';
  static const String androidEmulatorApiBaseUrl = 'http://10.0.2.2:8000';
  static const String defaultPhysicalPhoneApiUrl = 'http://10.205.133.253:8000';
  static const int apiTimeoutSeconds = 4;

  // Asset paths
  static const String floorPlanImagePath = 'assets/images/kumbah-ground-floor.png';
  static const String locationsJsonPath = 'assets/data/mewar_locations.json';
  static const String indoorJsonPath = 'assets/data/mewar_indoor.json';

  // Requirement 9 Floor plan schematic disclaimer
  static const String floorPlanDisclaimer =
      'Architectural floor plan schematic reflects ground-floor layout of Kumbha Hostel, Mewar University. All room boundaries and path nodes are calibrated for indoor wayfinding.';

  // Google Maps external URL template (normal web URL, no API key)
  static String getGoogleMapsUrl(double lat, double lng, {String? label}) {
    if (label != null && label.isNotEmpty) {
      return 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
    }
    return 'https://www.google.com/maps/place/Mewar+University/@$lat,$lng,17z';
  }
}
