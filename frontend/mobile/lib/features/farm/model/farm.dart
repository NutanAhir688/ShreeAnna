class Farm {
  final String name;
  final double acres;
  final String status;
  final String soilType;
  final String village;
  final String district;
  final String state;

  final int totalGrain;
  final double cultivatedArea;
  final String mainCrop;
  final int farmSince;
  final String address;

  const Farm({
    required this.name,
    required this.acres,
    required this.status,
    required this.soilType,
    required this.village,
    required this.district,
    required this.state,
    required this.totalGrain,
    required this.cultivatedArea,
    required this.mainCrop,
    required this.farmSince,
    required this.address,
  });
}
