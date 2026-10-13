import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../models/campus_location.dart';
import '../models/indoor_building.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String _prefBaseUrlKey = 'custom_backend_base_url';

  String _baseUrl = AppConstants.defaultApiBaseUrl;

  String get baseUrl => _baseUrl;

  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString(_prefBaseUrlKey);
      if (savedUrl != null && savedUrl.isNotEmpty) {
        _baseUrl = savedUrl;
      } else {
        // Auto-select based on platform
        if (!kIsWeb && Platform.isAndroid) {
          _baseUrl = AppConstants.androidEmulatorApiBaseUrl;
        } else {
          _baseUrl = AppConstants.defaultApiBaseUrl;
        }
      }
    } catch (_) {
      _baseUrl = AppConstants.androidEmulatorApiBaseUrl;
    }
  }

  Future<void> setBaseUrl(String newUrl) async {
    _baseUrl = newUrl.trim().replaceAll(RegExp(r'/+$'), '');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefBaseUrlKey, _baseUrl);
  }

  /// Checks if backend server is reachable with a quick 3-second timeout
  Future<bool> checkBackendHealth() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/mewar/locations');
      final res = await http.get(uri).timeout(const Duration(seconds: 3));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Fetches campus locations from backend, falls back to bundled asset JSON
  Future<List<CampusLocation>> fetchCampusLocations({bool forceLocal = false}) async {
    if (!forceLocal) {
      try {
        final uri = Uri.parse('$_baseUrl/api/mewar/locations');
        final response = await http
            .get(uri)
            .timeout(const Duration(seconds: AppConstants.apiTimeoutSeconds));

        if (response.statusCode == 200) {
          final data = json.decode(utf8.decode(response.bodyBytes));
          List<dynamic> items = [];
          if (data is Map && data.containsKey('locations')) {
            items = data['locations'] as List<dynamic>;
          } else if (data is List) {
            items = data;
          }
          if (items.isNotEmpty) {
            return items
                .map((loc) => CampusLocation.fromJson(loc as Map<String, dynamic>))
                .toList();
          }
        }
      } catch (e) {
        debugPrint('[ApiService] Backend locations fetch error, using local fallback: $e');
      }
    }

    // Local fallback from assets/data/mewar_locations.json
    try {
      final jsonString =
          await rootBundle.loadString('assets/data/mewar_locations.json');
      final data = json.decode(jsonString);
      List<dynamic> items = [];
      if (data is Map && data.containsKey('locations')) {
        items = data['locations'] as List<dynamic>;
      } else if (data is List) {
        items = data;
      }
      return items
          .map((loc) => CampusLocation.fromJson(loc as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('[ApiService] Failed to load local locations asset: $e');
      return [];
    }
  }

  /// Fetches indoor building data from backend, falls back to bundled asset JSON
  Future<List<IndoorBuilding>> fetchIndoorBuildings({bool forceLocal = false}) async {
    if (!forceLocal) {
      try {
        final uri = Uri.parse('$_baseUrl/api/mewar/indoor');
        final response = await http
            .get(uri)
            .timeout(const Duration(seconds: AppConstants.apiTimeoutSeconds));

        if (response.statusCode == 200) {
          final data = json.decode(utf8.decode(response.bodyBytes));
          List<dynamic> items = [];
          if (data is Map && data.containsKey('buildings')) {
            items = data['buildings'] as List<dynamic>;
          } else if (data is List) {
            items = data;
          }
          if (items.isNotEmpty) {
            return items
                .map((b) => IndoorBuilding.fromJson(b as Map<String, dynamic>))
                .toList();
          }
        }
      } catch (e) {
        debugPrint('[ApiService] Backend indoor fetch error, using local fallback: $e');
      }
    }

    // Local fallback from assets/data/mewar_indoor.json
    try {
      final jsonString =
          await rootBundle.loadString('assets/data/mewar_indoor.json');
      final data = json.decode(jsonString);
      List<dynamic> items = [];
      if (data is Map && data.containsKey('buildings')) {
        items = data['buildings'] as List<dynamic>;
      } else if (data is List) {
        items = data;
      }
      return items
          .map((b) => IndoorBuilding.fromJson(b as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('[ApiService] Failed to load local indoor asset: $e');
      return [];
    }
  }

  /// Loads Kumbha Hostel specifically
  Future<IndoorBuilding?> fetchKumbhaHostel() async {
    final buildings = await fetchIndoorBuildings();
    try {
      return buildings.firstWhere(
        (b) => b.id == 'kumba_hostel' || b.name.toLowerCase().contains('kumbha'),
      );
    } catch (_) {
      if (buildings.isNotEmpty) return buildings.first;
      return null;
    }
  }
}
