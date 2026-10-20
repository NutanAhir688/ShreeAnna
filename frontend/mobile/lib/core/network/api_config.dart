import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static String get baseUrl {
    try {
      final envUrl = dotenv.env['API_BASE_URL'];
      if (envUrl != null && envUrl.trim().isNotEmpty) {
        return envUrl.trim().replaceAll(RegExp(r'/+$'), '');
      }
    } catch (_) {}
    return const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'https://shreeanna.delightfulfield-3bc26253.centralindia.azurecontainerapps.io',
    );
  }

  static String get sendFarmerOtp => '$baseUrl/api/auth/farmer/send-otp';

  static String get verifyFarmerOtp => '$baseUrl/api/auth/farmer/verify-otp';

  static String get directFarmerLogin => '$baseUrl/api/auth/farmer/direct-login';

  static String get sendDriverOtp => '$baseUrl/api/auth/driver/send-otp';

  static String get verifyDriverOtp => '$baseUrl/api/auth/driver/verify-otp';

  static String get directDriverLogin => '$baseUrl/api/auth/driver/direct-login';

  static String get farmerMe => '$baseUrl/api/farmers/me';

  static String farmerFarms(String farmerId) =>
      '$baseUrl/api/farmers/$farmerId/farms';

  static String farmById(String farmId) => '$baseUrl/api/farms/$farmId';

  static String verifyFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/verify';

  static String archiveFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/archive';

  static String get registerFarmer => '$baseUrl/api/farmers/register';

  static String get registerFarm => '$baseUrl/api/farms/register';

  static String get farmerLotsMe => '$baseUrl/api/farmers/me/lots';
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

  static String get uploadImage => '$baseUrl/api/upload';

  /// Returns a signed SAS write URL for a given file extension.
  /// Usage: GET [uploadSasUrl]?ext=jpg
  static String get uploadSasUrl => '$baseUrl/api/upload/sas';

  static String driverJourney(String phone) => '$baseUrl/api/dispatches/driver-journey?phone=$phone';
  static String verifyPickup(String dispatchId) => '$baseUrl/api/dispatches/$dispatchId/verify-pickup';
  static String confirmDelivery(String dispatchId) => '$baseUrl/api/dispatches/$dispatchId/confirm-delivery';
  static String abortRide(String dispatchId) => '$baseUrl/api/dispatches/$dispatchId/abort-ride';
  static String get driverList => '$baseUrl/api/dispatches/drivers';
  static String dispatchByLot(String lotId) =>
    '$baseUrl/api/dispatches/by-lot/${Uri.encodeComponent(lotId)}';
  static String get customerOrders => '$baseUrl/api/orders';
  static String confirmOrderDelivery(String orderId) => '$baseUrl/api/orders/$orderId/confirm-delivery';

  static String get notifications => '$baseUrl/api/notifications';
  static String get notificationsReadAll => '$baseUrl/api/notifications/read-all';
  static String notificationRead(String id) => '$baseUrl/api/notifications/$id/read';

  static const String azureBlobBaseUrl =
      'https://shreeannafarmimages.blob.core.windows.net/farm-images';

  static String azureSasToken = '';

  /// Resolves an image URL so it can be loaded reliably on physical devices
  /// and emulators, handling local fallback URLs, relative paths, and emulator aliases.
  static String resolveImageUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final trimmed = url.trim();

    // If relative path
    if (trimmed.startsWith('/')) {
      return '$baseUrl$trimmed';
    }

    // If Azure blob was returned when storage was local disk fallback
    if (trimmed.contains('shreeannafarmimages.blob.core.windows.net/uploads/')) {
      final relativePath = trimmed.substring(trimmed.indexOf('/uploads/'));
      return '$baseUrl$relativePath';
    }

    // Android emulator localhost handling
    if (Platform.isAndroid && (trimmed.contains('://localhost') || trimmed.contains('://127.0.0.1'))) {
      if (baseUrl.contains('10.0.2.2')) {
        return trimmed.replaceAll('localhost', '10.0.2.2').replaceAll('127.0.0.1', '10.0.2.2');
      }
    }

    return trimmed;
  }

  static String get cartoApiKey {
    try {
      final key = dotenv.env['CARTO_API_KEY'];
      if (key != null && key.trim().isNotEmpty) return key.trim();
    } catch (_) {}
    return const String.fromEnvironment('CARTO_API_KEY', defaultValue: '');
  }

  static String get sendOtpWidgetId {
    try {
      final id = dotenv.env['SENDOTP_WIDGET_ID'];
      if (id != null && id.trim().isNotEmpty) return id.trim();
    } catch (_) {}
    return const String.fromEnvironment('SENDOTP_WIDGET_ID', defaultValue: '');
  }

  static String get sendOtpAuthToken {
    try {
      final token = dotenv.env['SENDOTP_AUTH_TOKEN'];
      if (token != null && token.trim().isNotEmpty) return token.trim();
    } catch (_) {}
    return const String.fromEnvironment('SENDOTP_AUTH_TOKEN', defaultValue: '');
  }
}
