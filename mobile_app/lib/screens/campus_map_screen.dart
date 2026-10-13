import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../models/campus_location.dart';
import '../services/api_service.dart';
import 'hostel_navigator_screen.dart';

class CampusMapScreen extends StatefulWidget {
  final CampusLocation? initialTarget;

  const CampusMapScreen({super.key, this.initialTarget});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  final MapController _mapController = MapController();
  List<CampusLocation> _locations = [];
  bool _isLoading = true;
  CampusLocation? _selectedLocation;

  @override
  void initState() {
    super.initState();
    _loadLocations();
  }

  Future<void> _loadLocations() async {
    final list = await ApiService().fetchCampusLocations();
    if (mounted) {
      setState(() {
        _locations = list;
        _isLoading = false;
        if (widget.initialTarget != null) {
          _selectedLocation = widget.initialTarget;
        }
      });

      if (widget.initialTarget != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _mapController.move(
            LatLng(widget.initialTarget!.lat, widget.initialTarget!.lng),
            17.5,
          );
        });
      }
    }
  }

  Future<void> _openInGoogleMaps(double lat, double lng, String label) async {
    final url = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=$lat,$lng',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open external map.')),
        );
      }
    }
  }

  void _showLocationDetails(CampusLocation loc) {
    setState(() {
      _selectedLocation = loc;
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.mewarBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      loc.hasIndoorMap
                          ? Icons.apartment_rounded
                          : Icons.location_on_rounded,
                      color: AppTheme.mewarBlue,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          loc.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          loc.category,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (loc.wheelchairAccessible)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.accessibleGreen.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.accessible_rounded,
                              size: 16, color: AppTheme.accessibleGreen),
                          SizedBox(width: 4),
                          Text(
                            'Accessible',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.accessibleGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                loc.description,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.4,
                  color: Colors.grey.shade800,
                ),
              ),
              const SizedBox(height: 16),

              // Accessibility feature chips
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (loc.rampAvailable)
                    _featureChip(Icons.stairs_rounded, 'Ramp Access'),
                  if (loc.elevatorAvailable)
                    _featureChip(Icons.elevator_rounded, 'Elevator Available'),
                  ...loc.facilities.map((f) => _featureChip(Icons.check_circle_outline, f)),
                ],
              ),
              const SizedBox(height: 20),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _openInGoogleMaps(
                        loc.lat,
                        loc.lng,
                        loc.name,
                      ),
                      icon: const Icon(Icons.open_in_new_rounded, size: 18),
                      label: const Text('Google Maps'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  if (loc.hasIndoorMap) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 1,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const HostelNavigatorScreen(),
                            ),
                          );
                        },
                        icon: const Icon(Icons.meeting_room_rounded, size: 18),
                        label: const Text('Indoor Nav'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.mewarBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _featureChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey.shade700),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade800,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Map (OpenStreetMap)'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location_rounded),
            tooltip: 'Center Campus',
            onPressed: () {
              _mapController.move(
                const LatLng(
                  AppConstants.mewarLatitude,
                  AppConstants.mewarLongitude,
                ),
                16.8,
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: const MapOptions(
                    initialCenter: LatLng(
                      AppConstants.mewarLatitude,
                      AppConstants.mewarLongitude,
                    ),
                    initialZoom: 16.5,
                    minZoom: 13.0,
                    maxZoom: 19.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.aware.campusnavigation',
                    ),
                    MarkerLayer(
                      markers: _locations.map((loc) {
                        final isSelected = _selectedLocation?.id == loc.id;
                        final isHostel = loc.hasIndoorMap;

                        return Marker(
                          point: LatLng(loc.lat, loc.lng),
                          width: isSelected ? 48 : 38,
                          height: isSelected ? 48 : 38,
                          child: GestureDetector(
                            onTap: () => _showLocationDetails(loc),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              decoration: BoxDecoration(
                                color: isHostel
                                    ? AppTheme.accentAmber
                                    : AppTheme.mewarBlue,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.25),
                                    blurRadius: 6,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Icon(
                                isHostel
                                    ? Icons.hotel_rounded
                                    : Icons.location_on_rounded,
                                color: Colors.white,
                                size: isSelected ? 24 : 20,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),

                // Floating Overlay: Quick Legend & Hostel Navigator Button
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.92),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          size: 16,
                          color: AppTheme.accessibleGreen,
                        ),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'OpenStreetMap (No API key needed)',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.primaryDark,
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: () => _openInGoogleMaps(
                            AppConstants.mewarLatitude,
                            AppConstants.mewarLongitude,
                            'Mewar University Campus',
                          ),
                          child: const Text(
                            'Open in Google Maps',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.mewarBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
