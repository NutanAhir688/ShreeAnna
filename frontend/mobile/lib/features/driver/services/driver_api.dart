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

  Future<DriverDispatchModel> confirmDelivery(String dispatchId, {String? notes, double? receivedKg}) async {
    final response = await _apiClient.post(
      ApiConfig.confirmDelivery(dispatchId),
      body: {
        'deliveredQuantityKg': receivedKg,
        'notes': notes,
      },
    );
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return DriverDispatchModel.fromJson(decoded);
    } else {
      Map<String, dynamic> decoded = {};
      try {
        decoded = jsonDecode(response.body);
      } catch (_) {}
      throw Exception(decoded['message'] ?? 'Failed to confirm delivery.');
    }
  }

  Future<DriverDispatchModel> abortRide(String dispatchId, {String? reason}) async {
    final response = await _apiClient.post(
      ApiConfig.abortRide(dispatchId),
      body: {
        'reason': reason ?? 'Aborted by driver in mobile app',
      },
    );
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return DriverDispatchModel.fromJson(decoded);
    } else {
      Map<String, dynamic> decoded = {};
      try {
        decoded = jsonDecode(response.body);
      } catch (_) {}
      throw Exception(decoded['message'] ?? 'Failed to abort ride.');
    }
  }

  Future<List<Map<String, dynamic>>> getCustomerOrders() async {
    try {
      final response = await _apiClient.get(ApiConfig.customerOrders);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('Error fetching customer orders: $e');
    }
    return [];
  }

  Future<bool> confirmCustomerOrderDelivery(String orderId, String otp) async {
    final response = await _apiClient.post(
      ApiConfig.confirmOrderDelivery(orderId),
      body: {'otp': otp.trim()},
    );
    if (response.statusCode == 200) {
      return true;
    } else {
      Map<String, dynamic> decoded = {};
      try {
        decoded = jsonDecode(response.body);
      } catch (_) {}
      throw Exception(decoded['message'] ?? 'Invalid delivery OTP. Please verify with customer.');
    }
  }
}

