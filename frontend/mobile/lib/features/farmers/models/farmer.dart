class Farmer {
  final String id;
  final String farmerCode;
  final String fullName;
  final String phone;
  final String email;
  final String address;
  final String district;
  final String taluka;
  final String village;
  final DateTime dateOfBirth;
  final String status;
  final DateTime createdAt;
  final int farmCount;

  const Farmer({
    required this.id,
    required this.farmerCode,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.address,
    required this.district,
    required this.taluka,
    required this.village,
    required this.dateOfBirth,
    required this.status,
    required this.createdAt,
    required this.farmCount,
  });

  factory Farmer.fromJson(Map<String, dynamic> json) {
    return Farmer(
      id: json['id']?.toString() ?? '',
      farmerCode: json['farmerCode']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      district: json['district']?.toString() ?? '',
      taluka: json['taluka']?.toString() ?? '',
      village: json['village']?.toString() ?? '',
      dateOfBirth: DateTime.tryParse(json['dateOfBirth']?.toString() ?? '') ?? DateTime(1990),
      status: json['status']?.toString() ?? 'ACTIVE',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      farmCount: (json['farmCount'] as num?)?.toInt() ?? 0,
    );
  }
}
