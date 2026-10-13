import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:5066';

  static const String sendFarmerOtp = '$baseUrl/api/auth/farmer/send-otp';

  static const String verifyFarmerOtp = '$baseUrl/api/auth/farmer/verify-otp';

  static const String sendDriverOtp = '$baseUrl/api/auth/driver/send-otp';

  static const String verifyDriverOtp = '$baseUrl/api/auth/driver/verify-otp';

  static const String directDriverLogin = '$baseUrl/api/auth/driver/direct-login';

  static const String farmerMe = '$baseUrl/api/farmers/me';

  static String farmerFarms(String farmerId) =>
      '$baseUrl/api/farmers/$farmerId/farms';

  static String farmById(String farmId) => '$baseUrl/api/farms/$farmId';

  static String verifyFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/verify';

  static String archiveFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/archive';

  static String registerFarmer = '$baseUrl/api/farmers/register';

  static String registerFarm = '$baseUrl/api/farms/register';

  static const String farmerLotsMe = '$baseUrl/api/farmers/me/lots';
  static String farmerLots(String farmerId) => '$baseUrl/api/farmers/$farmerId/lots';
  static String lotById(String lotId) => '$baseUrl/api/lots/$lotId';
  static String lotTimeline(String lotId) => '$baseUrl/api/lots/$lotId/timeline';
  static String acceptAgreement(String lotId) => '$baseUrl/api/lots/$lotId/agreement/accept';
  static String rejectAgreement(String lotId) => '$baseUrl/api/lots/$lotId/agreement/reject';
  static String reschedulePickup(String lotId) => '$baseUrl/api/lots/$lotId/pickup/reschedule';

  static String qualityInspection(String lotId) =>
      '$baseUrl/api/quality/inspections/lot/$lotId';
  static String qualityCertificate(String lotId) =>
      '$baseUrl/api/quality/certificates/lot/$lotId';

  static const String uploadImage = '$baseUrl/api/upload';

  /// Returns a signed SAS write URL for a given file extension.
  /// Usage: GET [uploadSasUrl]?ext=jpg
  static const String uploadSasUrl = '$baseUrl/api/upload/sas';

  static String driverJourney(String phone) => '$baseUrl/api/dispatches/driver-journey?phone=$phone';
  static String verifyPickup(String dispatchId) => '$baseUrl/api/dispatches/$dispatchId/verify-pickup';
  static const String driverList = '$baseUrl/api/dispatches/drivers';
  static String dispatchByLot(String lotId) =>
    '$baseUrl/api/dispatches/by-lot/${Uri.encodeComponent(lotId)}';

  static const String notifications = '$baseUrl/api/notifications';
  static const String notificationsReadAll = '$baseUrl/api/notifications/read-all';
  static String notificationRead(String id) => '$baseUrl/api/notifications/$id/read';

  static const String azureBlobBaseUrl =
      'https://shreeannafarmimages.blob.core.windows.net/farm-images';

  static String azureSasToken = '';

  static String get cartoApiKey {
    try {
      final key = dotenv.env['CARTO_API_KEY'];
      if (key != null && key.trim().isNotEmpty) return key.trim();
    } catch (_) {}
    return const String.fromEnvironment('CARTO_API_KEY', defaultValue: '');
  }
}
