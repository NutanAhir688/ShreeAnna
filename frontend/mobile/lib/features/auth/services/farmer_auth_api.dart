import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/network/api_config.dart';

class FarmerAuthApi {
  Future<bool> sendOtp(String phone) async {
    final response = await http.post(
      Uri.parse(ApiConfig.sendFarmerOtp),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'Phone': phone}),
    );

    if (response.statusCode == 200) {
      return true;
    }
    if (response.statusCode == 400) {
      throw Exception('Invalid mobile number.');
    }

    if (response.statusCode == 404) {
      throw Exception('No farmer account found with this mobile number.');
    }

    throw Exception('Failed to send OTP. Please try again.');
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await http.post(
      Uri.parse(ApiConfig.verifyFarmerOtp),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    if (response.statusCode == 401) {
      throw Exception('Invalid or expired OTP.');
    }

    throw Exception('Something went wrong. Please try again.');
  }

  Future<Map<String, dynamic>> directLogin(String phone) async {
    final response = await http.post(
      Uri.parse(ApiConfig.directFarmerLogin),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    if (response.statusCode == 404) {
      throw Exception('No active farmer account found with this mobile number.');
    }

    throw Exception('Failed to authenticate farmer. Please try again.');
  }
}
