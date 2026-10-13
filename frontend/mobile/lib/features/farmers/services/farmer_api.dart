import 'dart:convert';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_config.dart';
import '../models/farmer.dart';

import 'package:flutter/material.dart';

class FarmerApi {
  final ApiClient _apiClient = ApiClient();

  Future<Farmer> getMe() async {
    final response = await _apiClient.get(ApiConfig.farmerMe);

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);

      return Farmer.fromJson(json);
    }

    if (response.statusCode == 401) {
      debugPrint('401 body: ${response.body}');
      debugPrint('401 headers: ${response.headers}');
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 404) {
      throw Exception('Farmer profile not found.');
    }

    throw Exception('Failed to load farmer profile.');
  }

  Future<Farmer> updateProfile({
    required String fullName,
    required String phone,
    required String email,
    required String address,
    required String district,
    required String taluka,
    required String village,
    DateTime? dateOfBirth,
  }) async {
    final response = await _apiClient.put(
      ApiConfig.farmerMe,
      body: {
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'address': address,
        'district': district,
        'taluka': taluka,
        'village': village,
        'dateOfBirth': (dateOfBirth ?? DateTime.utc(1990, 1, 1)).toIso8601String(),
      },
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return Farmer.fromJson(json);
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    throw Exception('Failed to update profile: ${response.body}');
  }

  Future<void> registerFarmer({
    required String fullName,
    required String phone,
    required String email,
    required String address,
    required String district,
    required String taluka,
    required String village,
    required String dateOfBirth,
    required String fpo,
  }) async {
    String formattedDob = dateOfBirth;
    if (dateOfBirth.contains('/')) {
      final parts = dateOfBirth.split('/');
      if (parts.length == 3) {
        final day = int.tryParse(parts[0]);
        final month = int.tryParse(parts[1]);
        final year = int.tryParse(parts[2]);
        if (day != null && month != null && year != null) {
          formattedDob = DateTime.utc(year, month, day).toIso8601String();
        }
      }
    } else if (!dateOfBirth.contains('T') && dateOfBirth.isNotEmpty) {
      final parsed = DateTime.tryParse(dateOfBirth);
      if (parsed != null) {
        formattedDob = parsed.toUtc().toIso8601String();
      }
    }

    final response = await _apiClient.post(
      ApiConfig.registerFarmer,
      body: {
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'address': address,
        'district': district,
        'taluka': taluka,
        'village': village,
        'dateOfBirth': formattedDob,
        'fpo': fpo,
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(
        'Registration failed: ${response.statusCode} ${response.body}',
      );
    }
  }
}
