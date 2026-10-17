import 'package:flutter/foundation.dart';
import 'package:sendotp_flutter_sdk/sendotp_flutter_sdk.dart';
import '../network/api_config.dart';

/// Service wrapper for MSG91 SendOTP Flutter SDK
class SendOtpService {
  static bool _initialized = false;
  static String _activeWidgetId = '';
  static String _activeAuthToken = '';

  /// Channel codes supported by MSG91 SendOTP SDK
  static const int channelSms = 11;
  static const int channelWhatsApp = 12;
  static const int channelVoice = 4;
  static const int channelEmail = 3;

  /// Returns current active widgetId from environment or config
  static String get activeWidgetId => _activeWidgetId.isNotEmpty ? _activeWidgetId : ApiConfig.sendOtpWidgetId;

  /// Returns current active authToken from environment or config
  static String get activeAuthToken => _activeAuthToken.isNotEmpty ? _activeAuthToken : ApiConfig.sendOtpAuthToken;

  /// Whether SendOTP credentials are fully configured in the environment (.env)
  static bool get isConfigured => activeWidgetId.isNotEmpty && activeAuthToken.isNotEmpty;

  /// Initialize SendOTP SDK widget using environment variables (.env)
  static void initialize({String? widgetId, String? authToken}) {
    _activeWidgetId = widgetId ?? ApiConfig.sendOtpWidgetId;
    _activeAuthToken = authToken ?? ApiConfig.sendOtpAuthToken;

    if (_activeWidgetId.isNotEmpty && _activeAuthToken.isNotEmpty) {
      OTPWidget.initializeWidget(_activeWidgetId, _activeAuthToken);
      _initialized = true;
      debugPrint('[SendOtpService] Initialized with widgetId: $_activeWidgetId');
    } else {
      debugPrint('[SendOtpService] Note: SENDOTP_WIDGET_ID or SENDOTP_AUTH_TOKEN not yet populated in .env');
    }
  }

  /// Ensure initialization before any API calls
  static void _ensureInitialized() {
    if (!_initialized) {
      initialize();
    }
  }

  /// Normalizes phone number or email for SendOTP identifier
  /// Phone numbers must have country code without '+' (e.g., 919876543210)
  static String formatIdentifier(String input) {
    final trimmed = input.trim();
    if (trimmed.contains('@')) {
      return trimmed.toLowerCase();
    }

    String phone = trimmed.replaceAll(RegExp(r'[\s\-\+\(\)]'), '');
    if (phone.startsWith('91') && phone.length > 10) {
      return phone;
    }
    if (phone.length == 10) {
      return '91$phone';
    }
    return phone;
  }

  /// Sends OTP via SendOTP SDK
  /// [identifier]: 10-digit mobile number, full phone with country code (without +), or email
  static Future<SendOtpResult> sendOtp(String identifier) async {
    _ensureInitialized();
    if (!isConfigured) {
      debugPrint('[SendOtpService] Cannot dispatch: SENDOTP credentials missing in .env');
      return const SendOtpResult(
        isSuccess: false,
        message: 'SendOTP credentials are not configured in .env',
        rawResponse: null,
      );
    }
    final formattedId = formatIdentifier(identifier);

    try {
      final payload = {'identifier': formattedId};
      debugPrint('[SendOtpService] sendOTP payload: $payload');
      final response = await OTPWidget.sendOTP(payload);
      debugPrint('[SendOtpService] sendOTP response: $response');

      return SendOtpResult.fromResponse(response, identifier: formattedId);
    } catch (e) {
      debugPrint('[SendOtpService] sendOTP error: $e');
      return SendOtpResult(
        isSuccess: false,
        message: e.toString().replaceFirst('Exception: ', ''),
        rawResponse: null,
      );
    }
  }

  /// Retries sending OTP via chosen channel
  /// [retryChannel]: 11 = SMS, 12 = WhatsApp, 4 = Voice, 3 = Email
  static Future<SendOtpResult> retryOtp({
    required String reqId,
    int retryChannel = channelSms,
  }) async {
    _ensureInitialized();
    if (!isConfigured) {
      debugPrint('[SendOtpService] Cannot retry: SENDOTP credentials missing in .env');
      return const SendOtpResult(
        isSuccess: false,
        message: 'SendOTP credentials are not configured in .env',
        rawResponse: null,
      );
    }
    try {
      final payload = {
        'reqId': reqId,
        'retryChannel': retryChannel,
      };
      debugPrint('[SendOtpService] retryOTP payload: $payload');
      final response = await OTPWidget.retryOTP(payload);
      debugPrint('[SendOtpService] retryOTP response: $response');

      return SendOtpResult.fromResponse(response, reqId: reqId);
    } catch (e) {
      debugPrint('[SendOtpService] retryOTP error: $e');
      return SendOtpResult(
        isSuccess: false,
        message: e.toString().replaceFirst('Exception: ', ''),
        rawResponse: null,
      );
    }
  }

  /// Verifies the OTP entered by user against MSG91 SendOTP server
  static Future<SendOtpResult> verifyOtp({
    required String reqId,
    required String otp,
  }) async {
    _ensureInitialized();
    if (!isConfigured) {
      debugPrint('[SendOtpService] Cannot verify: SENDOTP credentials missing in .env');
      return const SendOtpResult(
        isSuccess: false,
        message: 'SendOTP credentials are not configured in .env',
        rawResponse: null,
      );
    }
    try {
      final payload = {
        'reqId': reqId,
        'otp': otp.trim(),
      };
      debugPrint('[SendOtpService] verifyOTP payload: $payload');
      final response = await OTPWidget.verifyOTP(payload);
      debugPrint('[SendOtpService] verifyOTP response: $response');

      return SendOtpResult.fromVerifyResponse(response, reqId: reqId);
    } catch (e) {
      debugPrint('[SendOtpService] verifyOTP error: $e');
      return SendOtpResult(
        isSuccess: false,
        message: e.toString().replaceFirst('Exception: ', ''),
        rawResponse: null,
      );
    }
  }

  /// Retrieves widget configuration and process information
  static Future<Map<String, dynamic>?> getWidgetProcess() async {
    _ensureInitialized();
    if (!isConfigured) {
      debugPrint('[SendOtpService] Cannot get widget process: credentials missing in .env');
      return null;
    }
    try {
      return await OTPWidget.getWidgetProcess();
    } catch (e) {
      debugPrint('[SendOtpService] getWidgetProcess error: $e');
      return null;
    }
  }
}

/// Standardized result wrapper for SendOTP SDK responses
class SendOtpResult {
  final bool isSuccess;
  final String? reqId;
  final String? message;
  final String? type;
  final Map<String, dynamic>? rawResponse;

  const SendOtpResult({
    required this.isSuccess,
    this.reqId,
    this.message,
    this.type,
    this.rawResponse,
  });

  factory SendOtpResult.fromResponse(Map<String, dynamic>? res, {String? identifier, String? reqId}) {
    if (res == null) {
      return const SendOtpResult(
        isSuccess: false,
        message: 'No response received from SendOTP service.',
      );
    }

    final type = res['type']?.toString();
    final isSuccess = type == 'success' || res['status'] == 'success' || res['statusCode'] == 200;

    String? extractedReqId = reqId;
    if (res['reqId'] != null) {
      extractedReqId = res['reqId'].toString();
    } else if (res['message'] is String && (res['message'] as String).length >= 10 && !res['message'].toString().contains(' ')) {
      extractedReqId = res['message'].toString();
    } else if (res['message'] is Map && res['message']['reqId'] != null) {
      extractedReqId = res['message']['reqId'].toString();
    }

    final msg = res['message'] is String
        ? res['message'] as String
        : res['msg']?.toString() ?? (isSuccess ? 'OTP sent successfully.' : 'Failed to send OTP');

    return SendOtpResult(
      isSuccess: isSuccess,
      reqId: extractedReqId,
      message: msg,
      type: type,
      rawResponse: res,
    );
  }

  factory SendOtpResult.fromVerifyResponse(Map<String, dynamic>? res, {required String reqId}) {
    if (res == null) {
      return const SendOtpResult(
        isSuccess: false,
        message: 'No response received from OTP verification.',
      );
    }

    final type = res['type']?.toString();
    final message = res['message']?.toString() ?? res['msg']?.toString() ?? '';
    final isSuccess = type == 'success' ||
        res['status'] == 'success' ||
        message.toLowerCase().contains('success') ||
        message.toLowerCase().contains('verified');

    return SendOtpResult(
      isSuccess: isSuccess,
      reqId: reqId,
      message: message.isNotEmpty ? message : (isSuccess ? 'OTP verified successfully' : 'OTP verification failed'),
      type: type,
      rawResponse: res,
    );
  }
}
