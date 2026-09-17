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
