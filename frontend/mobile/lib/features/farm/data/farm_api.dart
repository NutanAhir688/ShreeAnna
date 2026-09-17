import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;

import '../../../core/network/api_client.dart';
import '../../../core/network/api_config.dart';
import '../model/farm.dart';

class FarmApi {
  final ApiClient _apiClient = ApiClient();

  /// Uploads [imageFile] directly to Azure Blob Storage using a short-lived
  /// SAS URL obtained from the backend.  Returns the permanent public URL.
  Future<String> uploadImage(File imageFile) async {
    // Step 1 – ask the backend to generate a SAS write URL
    final ext = p.extension(imageFile.path).replaceFirst('.', ''); // e.g. "jpg"
    final sasEndpoint =
        '${ApiConfig.uploadSasUrl}?ext=${Uri.encodeComponent(ext.isEmpty ? 'jpg' : ext)}';

    final sasResponse = await _apiClient.get(sasEndpoint);

    if (sasResponse.statusCode != 200) {
      throw Exception(
          'Failed to obtain upload SAS URL (${sasResponse.statusCode}): ${sasResponse.body}');
    }

    final sasJson = jsonDecode(sasResponse.body) as Map<String, dynamic>;
    final sasUrl = sasJson['sasUrl'] as String;
    final permanentUrl = sasJson['permanentUrl'] as String;

    // Step 2 – PUT the raw bytes directly to Azure Blob Storage
    final bytes = await imageFile.readAsBytes();
    final mimeType = _mimeFromExt(ext);

    final putResponse = await http.put(
      Uri.parse(sasUrl),
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': mimeType,
      },
      body: bytes,
    );

    if (putResponse.statusCode != 201 && putResponse.statusCode != 200) {
      throw Exception(
          'Failed to upload image to Azure Storage (${putResponse.statusCode}): ${putResponse.body}');
    }

    return permanentUrl;
  }

  String _mimeFromExt(String ext) {
    switch (ext.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'heic':
        return 'image/heic';
      default:
        return 'image/jpeg';
    }
  }

  Future<List<Farm>> getMyFarms(String farmerId) async {
    final response = await _apiClient.get(ApiConfig.farmerFarms(farmerId));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> data = _extractList(decoded);

      return data.map((json) => Farm.fromJson(json)).toList();
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 403) {
      throw Exception('You are not allowed to access these farms.');
    }

    throw Exception('Failed to load farms.');
  }

  Future<Farm> getFarmById(String farmId) async {
    final response = await _apiClient.get(ApiConfig.farmById(farmId));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return Farm.fromJson(_extractMap(decoded));
    }

    if (response.statusCode == 404) {
      throw Exception('Farm not found.');
    }

    throw Exception('Failed to load farm.');
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

    throw Exception('Unexpected farms response format.');
  }

  Map<String, dynamic> _extractMap(dynamic decoded) {
    if (decoded is Map<String, dynamic>) {
      final data = decoded['data'];
      if (data is Map<String, dynamic>) {
        return data;
      }

      return decoded;
    }

    throw Exception('Unexpected farm response format.');
  }
  // --------------------------------------------------
  // CREATE FARM
  // --------------------------------------------------

  Future<Farm> createFarm({
    required String farmerId,
    required String farmName,
    required double areaInAcres,
    required String soilType,
    required String milletType,
    required String surveyNumber,
    required String district,
    required String taluka,
    required String village,
    required double latitude,
    required double longitude,
    String imageUrl = '',
  }) async {
    final response = await _apiClient.post(
      ApiConfig.farmerFarms(farmerId),
      body: {
        'farmName': farmName,
        'areaInAcres': areaInAcres,
        'soilType': soilType,
        'milletType': milletType,
        'surveyNumber': surveyNumber,
        'district': district,
        'taluka': taluka,
        'village': village,
        'latitude': latitude,
        'longitude': longitude,
        'imageUrl': imageUrl,
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final decoded = jsonDecode(response.body);
      return Farm.fromJson(_extractMap(decoded));
    }

    if (response.statusCode == 400) {
      throw Exception('Please check the farm details: ${response.body}');
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 403) {
      throw Exception('You are not allowed to create this farm.');
    }

    throw Exception('Failed to create farm: ${response.statusCode} ${response.body}');
  }

  // --------------------------------------------------
  // UPDATE FARM
  // --------------------------------------------------

  Future<Farm> updateFarm({
    required String farmId,
    required String farmName,
    required double areaInAcres,
    required String soilType,
    required String milletType,
    required String district,
    required String taluka,
    required String village,
    required double latitude,
    required double longitude,
    String imageUrl = '',
  }) async {
    final response = await _apiClient.put(
      ApiConfig.farmById(farmId),
      body: {
        'farmName': farmName,
        'areaInAcres': areaInAcres,
        'soilType': soilType,
        'milletType': milletType,
        'district': district,
        'taluka': taluka,
        'village': village,
        'latitude': latitude,
        'longitude': longitude,
        'imageUrl': imageUrl,
      },
    );

    if (response.statusCode == 200) {
      return Farm.fromJson(jsonDecode(response.body));
    }

    if (response.statusCode == 400) {
      throw Exception('Please check the farm details.');
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 403) {
      throw Exception('You are not allowed to edit this farm.');
    }

    if (response.statusCode == 404) {
      throw Exception('Farm not found.');
    }

    throw Exception('Failed to update farm.');
  }

  // --------------------------------------------------
  // DELETE FARM
  // --------------------------------------------------

  Future<void> deleteFarm(String farmId) async {
    final response = await _apiClient.delete(ApiConfig.farmById(farmId));

    if (response.statusCode == 204) {
      return;
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 403) {
      throw Exception('You are not allowed to delete this farm.');
    }

    if (response.statusCode == 404) {
      throw Exception('Farm not found.');
    }

    throw Exception('Failed to delete farm.');
  }

  // --------------------------------------------------
  // ARCHIVE FARM
  // --------------------------------------------------

  Future<void> archiveFarm(String farmId) async {
    final response = await _apiClient.patch(ApiConfig.archiveFarm(farmId));

    if (response.statusCode == 200) {
      return;
    }

    if (response.statusCode == 401) {
      throw Exception('Your session has expired. Please login again.');
    }

    if (response.statusCode == 403) {
      throw Exception('You are not allowed to archive this farm.');
    }

    if (response.statusCode == 404) {
      throw Exception('Farm not found.');
    }

    throw Exception('Failed to archive farm.');
  }
}
