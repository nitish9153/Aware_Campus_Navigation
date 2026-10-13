import 'package:flutter/material.dart';
import '../constants/app_theme.dart';
import '../models/campus_location.dart';
import '../models/indoor_building.dart';
import '../services/api_service.dart';
import 'campus_map_screen.dart';
import 'hostel_navigator_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<CampusLocation> _allLocations = [];
  List<FloorRoom> _allRooms = [];
  List<_SearchResultItem> _results = [];
  bool _isLoading = true;
  String _activeCategory = 'All';

  final List<String> _categories = [
    'All',
    'Hostels',
    'Academic',
    'Rooms',
    'Sports',
    'Facilities',
  ];

  @override
  void initState() {
    super.initState();
    _loadSearchData();
  }

  Future<void> _loadSearchData() async {
    final locations = await ApiService().fetchCampusLocations();
    final indoor = await ApiService().fetchIndoorBuildings();

    List<FloorRoom> rooms = [];
    for (final b in indoor) {
      for (final f in b.floors) {
        rooms.addAll(f.rooms);
      }
    }

    if (mounted) {
      setState(() {
        _allLocations = locations;
        _allRooms = rooms;
        _isLoading = false;
        _performSearch('');
      });
    }
  }

  void _performSearch(String query) {
    final q = query.trim().toLowerCase();
    final List<_SearchResultItem> items = [];

    // Search campus locations
    for (final loc in _allLocations) {
      final matchesQuery = q.isEmpty ||
          loc.name.toLowerCase().contains(q) ||
          loc.category.toLowerCase().contains(q) ||
          loc.description.toLowerCase().contains(q);

      final matchesCategory = _activeCategory == 'All' ||
          (_activeCategory == 'Hostels' &&
              (loc.category.toLowerCase().contains('hostel') ||
                  loc.name.toLowerCase().contains('hostel'))) ||
          (_activeCategory == 'Academic' &&
              (loc.category.toLowerCase().contains('academic') ||
                  loc.name.toLowerCase().contains('building'))) ||
          (_activeCategory == 'Sports' &&
              loc.category.toLowerCase().contains('sports')) ||
          (_activeCategory == 'Facilities' &&
              (loc.category.toLowerCase().contains('gate') ||
                  loc.category.toLowerCase().contains('mess') ||
                  loc.category.toLowerCase().contains('hospital')));

      if (matchesQuery && matchesCategory && _activeCategory != 'Rooms') {
        items.add(_SearchResultItem(
          title: loc.name,
          subtitle: '${loc.category} • Mewar Campus',
          type: _ItemType.location,
          location: loc,
          isAccessible: loc.wheelchairAccessible,
        ));
      }
    }

    // Search indoor rooms
    if (_activeCategory == 'All' || _activeCategory == 'Rooms' || _activeCategory == 'Hostels') {
      for (final room in _allRooms) {
        final matchesQuery = q.isEmpty ||
            room.roomNumber.toLowerCase().contains(q) ||
            room.name.toLowerCase().contains(q) ||
            'room ${room.roomNumber}'.contains(q);

        if (matchesQuery) {
          items.add(_SearchResultItem(
            title: room.roomNumber.contains('WR')
                ? room.name
                : 'Room ${room.roomNumber}',
            subtitle: 'Kumbha Hostel (Ground Floor) • ${room.type}',
            type: _ItemType.room,
            room: room,
            isAccessible: room.isAccessible,
          ));
        }
      }
    }

    setState(() {
      _results = items;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Campus & Rooms'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Input Field
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: _performSearch,
              decoration: InputDecoration(
                hintText: 'Search building, gate, or room (e.g. "Room 5")...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () {
                          _searchController.clear();
                          _performSearch('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
          ),

          // Filter category chips
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (ctx, idx) {
                final cat = _categories[idx];
                final isSelected = _activeCategory == cat;

                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppTheme.mewarBlue,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.primaryDark,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    fontSize: 12,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _activeCategory = cat;
                      });
                      _performSearch(_searchController.text);
                    }
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),

          // Results list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _results.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off_rounded,
                                size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              'No matching campus places or rooms found.',
                              style: TextStyle(
                                  color: Colors.grey.shade600, fontSize: 14),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _results.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, index) {
                          final item = _results[index];

                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 4),
                              leading: CircleAvatar(
                                backgroundColor: item.type == _ItemType.room
                                    ? AppTheme.selectedRoomGreen.withOpacity(0.15)
                                    : AppTheme.mewarBlue.withOpacity(0.12),
                                child: Icon(
                                  item.type == _ItemType.room
                                      ? Icons.meeting_room_rounded
                                      : Icons.location_on_rounded,
                                  color: item.type == _ItemType.room
                                      ? AppTheme.selectedRoomGreen
                                      : AppTheme.mewarBlue,
                                  size: 20,
                                ),
                              ),
                              title: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  if (item.isAccessible)
                                    const Icon(
                                      Icons.accessible_rounded,
                                      size: 16,
                                      color: AppTheme.accessibleGreen,
                                    ),
                                ],
                              ),
                              subtitle: Text(
                                item.subtitle,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              trailing: const Icon(
                                Icons.chevron_right_rounded,
                                color: Colors.grey,
                              ),
                              onTap: () {
                                if (item.type == _ItemType.room) {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => HostelNavigatorScreen(
                                        initialRoomNumber:
                                            item.room?.roomNumber,
                                      ),
                                    ),
                                  );
                                } else {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => CampusMapScreen(
                                        initialTarget: item.location,
                                      ),
                                    ),
                                  );
                                }
                              },
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

enum _ItemType { location, room }

class _SearchResultItem {
  final String title;
  final String subtitle;
  final _ItemType type;
  final CampusLocation? location;
  final FloorRoom? room;
  final bool isAccessible;

  _SearchResultItem({
    required this.title,
    required this.subtitle,
    required this.type,
    this.location,
    this.room,
    required this.isAccessible,
  });
}
