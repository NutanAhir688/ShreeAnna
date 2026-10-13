import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/network/api_config.dart';

class DriverAuthApi {
  Future<bool> sendOtp(String phone) async {
    final response = await http.post(
      Uri.parse(ApiConfig.sendDriverOtp),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );

    if (response.statusCode == 200) {
      return true;
    }
    if (response.statusCode == 404) {
      throw Exception('No driver account found with this mobile number. Please check with your logistics coordinator.');
    }

    try {
      final decoded = jsonDecode(response.body);
      throw Exception(decoded['message'] ?? 'Failed to send OTP.');
    } catch (_) {
      throw Exception('Failed to send OTP. Please try again.');
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await http.post(
      Uri.parse(ApiConfig.verifyDriverOtp),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    if (response.statusCode == 401) {
      throw Exception('Invalid or expired OTP.');
    }

    try {
      final decoded = jsonDecode(response.body);
      throw Exception(decoded['message'] ?? 'Authentication failed.');
    } catch (_) {
      throw Exception('Something went wrong. Please try again.');
    }
  }

  Future<Map<String, dynamic>> directLogin(String phone) async {
    final response = await http.post(
      Uri.parse(ApiConfig.directDriverLogin),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    if (response.statusCode == 404) {
      throw Exception('Driver not found with this mobile number.');
    }

    try {
      final decoded = jsonDecode(response.body);
      throw Exception(decoded['message'] ?? 'Direct login failed.');
    } catch (_) {
      throw Exception('Failed to sign in. Please try again.');
    }
  }
}
