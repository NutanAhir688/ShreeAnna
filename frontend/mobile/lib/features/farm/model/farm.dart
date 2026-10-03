class FarmCrop {
  final String id;
  final String cropName;
  final String season;
  final DateTime sowingDate;
  final DateTime? expectedHarvestDate;
  final double? estimatedAreaInAcres;
  final String status;

  const FarmCrop({
    required this.id,
    required this.cropName,
    required this.season,
    required this.sowingDate,
    this.expectedHarvestDate,
    this.estimatedAreaInAcres,
    required this.status,
  });

  factory FarmCrop.fromJson(Map<String, dynamic> json) {
    return FarmCrop(
      id: json['id']?.toString() ?? '',
      cropName: json['cropName']?.toString() ?? '',
      season: json['season']?.toString() ?? '',
      sowingDate: json['sowingDate'] != null
          ? DateTime.parse(json['sowingDate'])
          : DateTime.now(),
      expectedHarvestDate: json['expectedHarvestDate'] != null
          ? DateTime.parse(json['expectedHarvestDate'])
          : null,
      estimatedAreaInAcres: json['estimatedAreaInAcres'] != null
          ? (json['estimatedAreaInAcres'] as num).toDouble()
          : null,
      status: json['status']?.toString() ?? 'Active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cropName': cropName,
      'season': season,
      'sowingDate': sowingDate.toIso8601String(),
      if (expectedHarvestDate != null)
        'expectedHarvestDate': expectedHarvestDate!.toIso8601String(),
      if (estimatedAreaInAcres != null)
        'estimatedAreaInAcres': estimatedAreaInAcres,
    };
  }
}

class Farm {
  final String id;
  final String farmCode;
  final String farmerId;
  final String farmName;
  final double areaInAcres;
  final String soilType;
  final String surveyNumber;
  final String district;
  final String taluka;
  final String village;
  final double latitude;
  final double longitude;
  final String imageUrl;
  final String status;
  final DateTime createdAt;
  final DateTime? verifiedAt;
  final String? verifiedBy;
  final List<FarmCrop> crops;

  const Farm({
    required this.id,
    required this.farmCode,
    required this.farmerId,
    required this.farmName,
    required this.areaInAcres,
    required this.soilType,
    required this.surveyNumber,
    required this.district,
    required this.taluka,
    required this.village,
    required this.latitude,
    required this.longitude,
    required this.imageUrl,
    required this.status,
    required this.createdAt,
    this.verifiedAt,
    this.verifiedBy,
    this.crops = const [],
  });

  bool get isVerified => status.toLowerCase() == 'verified';

  String get milletType {
    if (crops.isNotEmpty) {
      return crops.map((c) => c.cropName).join(', ');
    }
    return '';
  }

  List<String> get milletTypes {
    if (crops.isNotEmpty) {
      return crops.map((c) => c.cropName).toList();
    }
    return const [];
  }

  factory Farm.fromJson(Map<String, dynamic> json) {
    var rawCrops = json['crops'] as List<dynamic>?;
    List<FarmCrop> cropList = rawCrops != null
        ? rawCrops
            .map((c) => FarmCrop.fromJson(c as Map<String, dynamic>))
            .toList()
        : [];

    return Farm(
      id: json['id']?.toString() ?? '',
      farmCode: json['farmCode']?.toString() ?? '',
      farmerId: json['farmerId']?.toString() ?? '',
      farmName: json['farmName']?.toString() ?? '',
      areaInAcres: (json['areaInAcres'] as num?)?.toDouble() ?? 0.0,
      soilType: json['soilType']?.toString() ?? '',
      surveyNumber: json['surveyNumber']?.toString() ?? '',
      district: json['district']?.toString() ?? '',
      taluka: json['taluka']?.toString() ?? '',
      village: json['village']?.toString() ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['imageUrl']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.parse(json['verifiedAt'])
          : null,
      verifiedBy: json['verifiedBy']?.toString(),
      crops: cropList,
    );
  }
}
