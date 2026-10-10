import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_config.dart';
import '../models/driver_dispatch_model.dart';

class DriverApi {
  final ApiClient _apiClient = ApiClient();

  Future<List<RegisteredDriver>> getDrivers() async {
    try {
      final response = await _apiClient.get(ApiConfig.driverList);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((x) => RegisteredDriver.fromJson(x)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching drivers: $e');
    }
    return [];
  }

  Future<List<DriverDispatchModel>> getDriverJourneys(String phone) async {
    final response = await _apiClient.get(ApiConfig.driverJourney(phone));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((x) => DriverDispatchModel.fromJson(x)).toList();
    }
    return [];
  }

  Future<DriverDispatchModel> verifyPickup(String dispatchId, String code) async {
    final response = await _apiClient.post(
      ApiConfig.verifyPickup(dispatchId),
      body: {'verificationCode': code},
    );
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return DriverDispatchModel.fromJson(decoded);
    } else {
      Map<String, dynamic> decoded = {};
      try {
        decoded = jsonDecode(response.body);
      } catch (_) {}
      throw Exception(decoded['message'] ?? 'Invalid pickup code. Please check with farmer.');
    }
  }
}
