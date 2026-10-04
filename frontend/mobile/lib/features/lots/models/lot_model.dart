class LotModel {
  final String id;
  final String lotNumber;
  final String farmerId;
  final String farmerName;
  final String farmId;
  final String farmName;
  final String milletType;
  final double estimatedQuantityKg;
  final double? actualQuantityKg;
  final String harvestDate;
  final String submissionDate;
  final String status;
  final String? description;
  final String? assignedInspectorName;
  final String? assignedInspectorPhone;
  final String? scheduledInspectionDate;
  final String? inspectionTrackingStatus;
  final double? inspectorLatitude;
  final double? inspectorLongitude;
  final double? farmLatitude;
  final double? farmLongitude;
  final String agreementVersion;
  final String procurementOfficerName;
  final String procurementOfficerPhone;
  final double? offeredPricePerKg;
  final double? agreedQuantityKg;
  final double? logisticsCost;
  final double? otherAdjustments;
  final String? negotiationRemarks;
  final String? driverName;
  final String? driverPhone;
  final String? vehicleNumber;
  final String? verificationCode;

  LotModel({
    required this.id,
    required this.lotNumber,
    required this.farmerId,
    required this.farmerName,
    required this.farmId,
    required this.farmName,
    required this.milletType,
    required this.estimatedQuantityKg,
    this.actualQuantityKg,
    required this.harvestDate,
    required this.submissionDate,
    required this.status,
    this.description,
    this.assignedInspectorName,
    this.assignedInspectorPhone,
    this.scheduledInspectionDate,
    this.inspectionTrackingStatus,
    this.inspectorLatitude,
    this.inspectorLongitude,
    this.farmLatitude,
    this.farmLongitude,
    this.agreementVersion = 'v2.0',
    this.procurementOfficerName = 'Rajesh Sharma (Procurement Officer)',
    this.procurementOfficerPhone = '+91 98765 43210',
    this.offeredPricePerKg,
    this.agreedQuantityKg,
    this.logisticsCost,
    this.otherAdjustments,
    this.negotiationRemarks,
    this.driverName,
    this.driverPhone,
    this.vehicleNumber,
    this.verificationCode,
  });

  factory LotModel.fromJson(Map<String, dynamic> json) {
    return LotModel(
      id: json['id']?.toString() ?? '',
      lotNumber: json['lotNumber']?.toString() ?? '',
      farmerId: json['farmerId']?.toString() ?? '',
      farmerName: json['farmerName']?.toString() ?? '',
      farmId: json['farmId']?.toString() ?? '',
      farmName: json['farmName']?.toString() ?? '',
      milletType: json['milletType']?.toString() ?? '',
      estimatedQuantityKg: (json['estimatedQuantityKg'] as num?)?.toDouble() ?? 0.0,
      actualQuantityKg: (json['actualQuantityKg'] as num?)?.toDouble(),
      harvestDate: json['harvestDate']?.toString() ?? '',
      submissionDate: json['submissionDate']?.toString() ?? '',
      status: json['status']?.toString() ?? 'SUBMITTED',
      description: json['description']?.toString(),
      assignedInspectorName: json['assignedInspectorName']?.toString(),
      assignedInspectorPhone: json['assignedInspectorPhone']?.toString(),
      scheduledInspectionDate: json['scheduledInspectionDate']?.toString(),
      inspectionTrackingStatus: json['inspectionTrackingStatus']?.toString(),
      inspectorLatitude: (json['inspectorLatitude'] as num?)?.toDouble(),
      inspectorLongitude: (json['inspectorLongitude'] as num?)?.toDouble(),
      farmLatitude: (json['farmLatitude'] as num?)?.toDouble(),
      farmLongitude: (json['farmLongitude'] as num?)?.toDouble(),
      agreementVersion: json['agreementVersion']?.toString() ??
          (json['status']?.toString().contains('REJECTED') == true ? 'v1.0' : 'v2.0'),
      procurementOfficerName: json['procurementOfficerName']?.toString() ??
          'Rajesh Sharma (Procurement Officer)',
      procurementOfficerPhone: json['procurementOfficerPhone']?.toString() ??
          '+91 98765 43210',
      offeredPricePerKg: (json['offeredPricePerKg'] as num?)?.toDouble(),
      agreedQuantityKg: (json['agreedQuantityKg'] as num?)?.toDouble(),
      logisticsCost: (json['logisticsCost'] as num?)?.toDouble(),
      otherAdjustments: (json['otherAdjustments'] as num?)?.toDouble(),
      negotiationRemarks: json['negotiationRemarks']?.toString(),
      driverName: json['driverName']?.toString(),
      driverPhone: json['driverPhone']?.toString(),
      vehicleNumber: json['vehicleNumber']?.toString(),
      verificationCode: json['verificationCode']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lotNumber': lotNumber,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'farmId': farmId,
      'farmName': farmName,
      'milletType': milletType,
      'estimatedQuantityKg': estimatedQuantityKg,
      'actualQuantityKg': actualQuantityKg,
      'harvestDate': harvestDate,
      'submissionDate': submissionDate,
      'status': status,
      'description': description,
      'assignedInspectorName': assignedInspectorName,
      'assignedInspectorPhone': assignedInspectorPhone,
      'scheduledInspectionDate': scheduledInspectionDate,
      'inspectionTrackingStatus': inspectionTrackingStatus,
      'inspectorLatitude': inspectorLatitude,
      'inspectorLongitude': inspectorLongitude,
      'farmLatitude': farmLatitude,
      'farmLongitude': farmLongitude,
      'agreementVersion': agreementVersion,
      'procurementOfficerName': procurementOfficerName,
      'procurementOfficerPhone': procurementOfficerPhone,
      'offeredPricePerKg': offeredPricePerKg,
      'agreedQuantityKg': agreedQuantityKg,
      'logisticsCost': logisticsCost,
      'otherAdjustments': otherAdjustments,
      'negotiationRemarks': negotiationRemarks,
      'driverName': driverName,
      'driverPhone': driverPhone,
      'vehicleNumber': vehicleNumber,
      'verificationCode': verificationCode,
    };
  }
}

class LotTimelineStepModel {
  final String step;
  final String status;
  final String? completedAt;

  LotTimelineStepModel({
    required this.step,
    required this.status,
    this.completedAt,
  });

  factory LotTimelineStepModel.fromJson(Map<String, dynamic> json) {
    return LotTimelineStepModel(
      step: json['step']?.toString() ?? '',
      status: json['status']?.toString() ?? 'PENDING',
      completedAt: json['completedAt']?.toString(),
    );
  }
}

class LotTimelineModel {
  final String lotId;
  final String currentStatus;
  final List<LotTimelineStepModel> steps;

  LotTimelineModel({
    required this.lotId,
    required this.currentStatus,
    required this.steps,
  });

  factory LotTimelineModel.fromJson(Map<String, dynamic> json) {
    var rawSteps = json['steps'] as List? ?? [];
    List<LotTimelineStepModel> stepList =
        rawSteps.map((s) => LotTimelineStepModel.fromJson(s)).toList();

    return LotTimelineModel(
      lotId: json['lotId']?.toString() ?? '',
      currentStatus: json['currentStatus']?.toString() ?? '',
      steps: stepList,
    );
  }
}
