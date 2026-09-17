import 'dart:convert';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_config.dart';
import '../models/lot_model.dart';

class LotApi {
  final ApiClient _apiClient = ApiClient();

  Future<List<LotModel>> getMyLots(String farmerId) async {
    final response = await _apiClient.get(ApiConfig.farmerLots(farmerId));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> data = _extractList(decoded);
      return data.map((json) => LotModel.fromJson(json)).toList();
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    throw Exception('Failed to load lots.');
  }

  Future<LotModel> getLotById(String lotId) async {
    final response = await _apiClient.get(ApiConfig.lotById(lotId));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return LotModel.fromJson(_extractMap(decoded));
    }

    if (response.statusCode == 404) {
      throw Exception('Lot not found.');
    }

    throw Exception('Failed to load lot details.');
  }

  Future<LotModel> createLot({
    required String farmerId,
    required String farmId,
    required String milletType,
    required double estimatedQuantityKg,
    required DateTime harvestDate,
    String? description,
  }) async {
    final response = await _apiClient.post(
      ApiConfig.farmerLots(farmerId),
      body: {
        'farmId': farmId,
        'milletType': milletType,
        'estimatedQuantityKg': estimatedQuantityKg,
        'harvestDate': harvestDate.toIso8601String(),
        'description': description ?? '',
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final decoded = jsonDecode(response.body);
      return LotModel.fromJson(_extractMap(decoded));
    }

    if (response.statusCode == 400) {
      throw Exception('Please check the lot details.');
    }

    throw Exception('Failed to submit lot: ${response.statusCode}');
  }

  Future<LotTimelineModel> getLotTimeline(String lotId) async {
    final response = await _apiClient.get(ApiConfig.lotTimeline(lotId));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return LotTimelineModel.fromJson(_extractMap(decoded));
    }

    throw Exception('Failed to load lot timeline.');
  }

  Future<void> rejectAgreement(String lotId, {required String reason, String? comment}) async {
    final response = await _apiClient.post(
      ApiConfig.rejectAgreement(lotId),
      body: {
        'reason': reason,
        'comment': comment ?? '',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to reject agreement.');
    }
  }

  Future<void> reschedulePickup(String lotId, {required DateTime requestedDate, required String reason}) async {
    final response = await _apiClient.post(
      ApiConfig.reschedulePickup(lotId),
      body: {
        'requestedDate': requestedDate.toIso8601String(),
        'reason': reason,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to reschedule pickup.');
    }
  }

  Future<Map<String, dynamic>?> getQualityInspection(String lotId) async {
    final response = await _apiClient.get(ApiConfig.qualityInspection(lotId));
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return _extractMap(decoded);
    }
    return null;
  }

  Future<Map<String, dynamic>?> getQualityCertificate(String lotId) async {
    final response = await _apiClient.get(ApiConfig.qualityCertificate(lotId));
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return _extractMap(decoded);
    }
    return null;
  }

  List<dynamic> _extractList(dynamic decoded) {
    if (decoded is List<dynamic>) {
      return decoded;
    }
    if (decoded is Map<String, dynamic>) {
      final data = decoded['data'];
      if (data is List<dynamic>) {
        return data;
      }
    }
    throw Exception('Unexpected lots response format.');
  }

  Map<String, dynamic> _extractMap(dynamic decoded) {
    if (decoded is Map<String, dynamic>) {
      final data = decoded['data'];
      if (data is Map<String, dynamic>) {
        return data;
      }
      return decoded;
    }
    throw Exception('Unexpected response format.');
  }
}
