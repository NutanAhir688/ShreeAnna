class DriverDispatchModel {
  final String id;
  final String dispatchCode;
  final String direction;
  final String farmerOrProcessorName;
  final String milletType;
  final double totalQuantityKg;
  final String sourceAddress;
  final String destinationAddress;
  final String transportResponsibility;
  final String vehicleNumber;
  final double vehicleCapacityKg;
  final String driverName;
  final String driverPhone;
  final String verificationCode;
  final String status;
  final String warehouseName;
  final String scheduledDate;
  final String scheduledStartTime;
  final String scheduledEndTime;
  final String specialInstructions;
  final String lotId;
  final double? pickupLatitude;
  final double? pickupLongitude;
  final double? destinationLatitude;
  final double? destinationLongitude;
  final double? finalReceivedQuantityKg;

  DriverDispatchModel({
    required this.id,
    required this.dispatchCode,
    required this.direction,
    required this.farmerOrProcessorName,
    required this.milletType,
    required this.totalQuantityKg,
    required this.sourceAddress,
    required this.destinationAddress,
    required this.transportResponsibility,
    required this.vehicleNumber,
    required this.vehicleCapacityKg,
    required this.driverName,
    required this.driverPhone,
    required this.verificationCode,
    required this.status,
    required this.warehouseName,
    required this.scheduledDate,
    required this.scheduledStartTime,
    required this.scheduledEndTime,
    required this.specialInstructions,
    this.lotId = '',
    this.pickupLatitude,
    this.pickupLongitude,
    this.destinationLatitude,
    this.destinationLongitude,
    this.finalReceivedQuantityKg,
  });

  factory DriverDispatchModel.fromJson(Map<String, dynamic> json) {
    return DriverDispatchModel(
      id: json['id']?.toString() ?? '',
      lotId: json['lotId']?.toString() ?? json['id']?.toString() ?? '',
      dispatchCode: json['dispatchCode']?.toString() ?? '',
      direction: json['direction']?.toString() ?? 'INBOUND',
      farmerOrProcessorName: json['farmerOrProcessorName']?.toString() ?? 'Ramesh Patel',
      milletType: json['milletType']?.toString() ?? 'Finger Millet',
      totalQuantityKg: (json['totalQuantityKg'] as num?)?.toDouble() ?? 3500.0,
      finalReceivedQuantityKg: (json['finalReceivedQuantityKg'] as num?)?.toDouble(),
      sourceAddress: json['sourceAddress']?.toString() ?? 'Gujarat FPO Central Storage, Anand, Gujarat',
      destinationAddress: json['destinationAddress']?.toString() ?? 'Millet Processing Unit, Vatva, Ahmedabad, Gujarat',
      transportResponsibility: json['transportResponsibility']?.toString() ?? 'FPO Pickup',
      vehicleNumber: json['vehicleNumber']?.toString() ?? 'GJ-01-AB-4521',
      vehicleCapacityKg: (json['vehicleCapacityKg'] as num?)?.toDouble() ?? 7000.0,
      driverName: json['driverName']?.toString() ?? 'Ravi Kumar',
      driverPhone: json['driverPhone']?.toString() ?? '9876543210',
      verificationCode: json['verificationCode']?.toString() ?? '4829',
      status: json['status']?.toString() ?? 'SCHEDULED',
      warehouseName: json['warehouseName']?.toString() ?? 'Dahod Rural Grain Warehouse',
      scheduledDate: json['scheduledDate']?.toString() ?? '',
      scheduledStartTime: json['scheduledStartTime']?.toString() ?? '09:00 AM',
      scheduledEndTime: json['scheduledEndTime']?.toString() ?? '11:00 AM',
      specialInstructions: json['specialInstructions']?.toString() ?? '',
      pickupLatitude: (json['pickupLatitude'] as num?)?.toDouble(),
      pickupLongitude: (json['pickupLongitude'] as num?)?.toDouble(),
      destinationLatitude: (json['destinationLatitude'] as num?)?.toDouble(),
      destinationLongitude: (json['destinationLongitude'] as num?)?.toDouble(),
    );
  }
}

class RegisteredDriver {
  final String id;
  final String driverCode;
  final String name;
  final String phone;
  final String licenseNumber;
  final String vehicleNumber;
  final double vehicleCapacityKg;
  final String status;

  RegisteredDriver({
    required this.id,
    required this.driverCode,
    required this.name,
    required this.phone,
    this.licenseNumber = 'DL-GJ-2024-8891',
    required this.vehicleNumber,
    required this.vehicleCapacityKg,
    required this.status,
  });

  factory RegisteredDriver.fromJson(Map<String, dynamic> json) {
    return RegisteredDriver(
      id: json['id']?.toString() ?? '',
      driverCode: json['driverCode']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      licenseNumber: (json['licenseNumber'] != null && json['licenseNumber'].toString().isNotEmpty)
          ? json['licenseNumber'].toString()
          : 'DL-GJ-2024-8891',
      vehicleNumber: json['vehicleNumber']?.toString() ?? '',
      vehicleCapacityKg: (json['vehicleCapacityKg'] as num?)?.toDouble() ?? 7000.0,
      status: json['status']?.toString() ?? 'AVAILABLE',
    );
  }
}
