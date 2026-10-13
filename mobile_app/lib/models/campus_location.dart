class CampusLocation {
  final String id;
  final String name;
  final String code;
  final String category;
  final String description;
  final double lat;
  final double lng;
  final String colorHex;
  final String iconType;
  final bool wheelchairAccessible;
  final bool rampAvailable;
  final bool elevatorAvailable;
  final List<String> facilities;
  final String entranceNodeId;
  final bool hasIndoorMap;
  final String? indoorBuildingId;

  CampusLocation({
    required this.id,
    required this.name,
    required this.code,
    required this.category,
    required this.description,
    required this.lat,
    required this.lng,
    required this.colorHex,
    required this.iconType,
    required this.wheelchairAccessible,
    required this.rampAvailable,
    required this.elevatorAvailable,
    required this.facilities,
    required this.entranceNodeId,
    this.hasIndoorMap = false,
    this.indoorBuildingId,
  });

  factory CampusLocation.fromJson(Map<String, dynamic> json) {
    final facilitiesList = (json['facilities'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];

    final id = json['id']?.toString() ?? '';
    final isKumbha = id == 'kumbah_hostel' ||
        (json['name']?.toString().toLowerCase().contains('kumbha') ?? false);

    return CampusLocation(
      id: id,
      name: json['name']?.toString() ?? 'Unnamed Location',
      code: json['code']?.toString() ?? '',
      category: json['category']?.toString() ?? 'General',
      description: json['description']?.toString() ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 25.031338,
      lng: (json['lng'] as num?)?.toDouble() ?? 74.636520,
      colorHex: json['color']?.toString() ?? '#2563EB',
      iconType: json['iconType']?.toString() ?? 'building',
      wheelchairAccessible: json['wheelchairAccessible'] == true,
      rampAvailable: json['rampAvailable'] == true,
      elevatorAvailable: json['elevatorAvailable'] == true,
      facilities: facilitiesList,
      entranceNodeId: json['entranceNodeId']?.toString() ?? '',
      hasIndoorMap: json['hasIndoorMap'] == true || isKumbha,
      indoorBuildingId: json['indoorBuildingId']?.toString() ?? (isKumbha ? 'kumba_hostel' : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'category': category,
      'description': description,
      'lat': lat,
      'lng': lng,
      'color': colorHex,
      'iconType': iconType,
      'wheelchairAccessible': wheelchairAccessible,
      'rampAvailable': rampAvailable,
      'elevatorAvailable': elevatorAvailable,
      'facilities': facilities,
      'entranceNodeId': entranceNodeId,
      'hasIndoorMap': hasIndoorMap,
      'indoorBuildingId': indoorBuildingId,
    };
  }
}
