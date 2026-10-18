import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:sendotp_flutter_sdk/sendotp_flutter_sdk.dart';
import '../network/api_config.dart';

/// Service wrapper for MSG91 SendOTP Flutter SDK with resilient
/// carrier network redirect traversal (Jio / Zumigo / Airtel).
class SendOtpService {
  static bool _initialized = false;
  static String _activeWidgetId = '';
  static String _activeAuthToken = '';

  /// Channel codes supported by MSG91 SendOTP SDK
  static const int channelSms = 11;
  static const int channelWhatsApp = 12;
  static const int channelVoice = 4;
  static const int channelEmail = 3;

  static const int _maxRedirectHops = 25;
  static const Duration _timeoutDuration = Duration(seconds: 20);

  /// Returns current active widgetId from environment or config
  static String get activeWidgetId =>
      _activeWidgetId.isNotEmpty ? _activeWidgetId : ApiConfig.sendOtpWidgetId;

  /// Returns current active authToken from environment or config
  static String get activeAuthToken =>
      _activeAuthToken.isNotEmpty ? _activeAuthToken : ApiConfig.sendOtpAuthToken;

  /// Whether SendOTP credentials are fully configured in the environment (.env)
  static bool get isConfigured =>
      activeWidgetId.isNotEmpty && activeAuthToken.isNotEmpty;

  /// Initialize SendOTP SDK widget using environment variables (.env)
  static void initialize({String? widgetId, String? authToken}) {
    _activeWidgetId = widgetId ?? ApiConfig.sendOtpWidgetId;
    _activeAuthToken = authToken ?? ApiConfig.sendOtpAuthToken;

    if (_activeWidgetId.isNotEmpty && _activeAuthToken.isNotEmpty) {
      try {
        OTPWidget.initializeWidget(_activeWidgetId, _activeAuthToken);
      } catch (e) {
        debugPrint('[SendOtpService] OTPWidget.initializeWidget note: $e');
      }
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

  /// Executes an HTTP request and manually traverses the complete redirect chain
  /// (including 301, 302, 303, 307, 308) up to 25 hops. This bypasses Dart's
  /// default limit of 5 which causes "ClientException: Redirect limit exceeded"
  /// when MSG91 performs mobile carrier network auth via Zumigo / Jio / Airtel.
  static Future<Map<String, dynamic>> _sendRequestWithRedirects({
    required String initialUrl,
    required Map<String, dynamic> body,
    bool isInitialPost = true,
  }) async {
    final client = HttpClient();
    String currentUrl = initialUrl;
    bool isPost = isInitialPost;
    String? postBody = isInitialPost ? jsonEncode(body) : null;

    try {
      for (int step = 0; step < _maxRedirectHops; step++) {
        final uri = Uri.parse(currentUrl);
        final req = isPost ? await client.postUrl(uri) : await client.getUrl(uri);
        req.followRedirects = false; // Handle redirects manually to support > 5 hops
        req.headers.contentType = ContentType.json;
        if (isPost && postBody != null) {
          req.write(postBody);
        }

        final resp = await req.close().timeout(_timeoutDuration);
        final location = resp.headers.value(HttpHeaders.locationHeader);

        // Check for redirect status
        if ((resp.statusCode >= 300 && resp.statusCode < 400) && location != null) {
          currentUrl = Uri.parse(currentUrl).resolve(location).toString();
          // Per HTTP specifications: 301, 302, and 303 turn into GET requests and discard body
          if (resp.statusCode == 301 || resp.statusCode == 302 || resp.statusCode == 303) {
            isPost = false;
            postBody = null;
          }
          continue;
        }

        final respText = await utf8.decodeStream(resp);
        if (respText.trim().startsWith('{') || respText.trim().startsWith('[')) {
          final decoded = jsonDecode(respText);
          if (decoded is Map<String, dynamic>) {
            return decoded;
          }
          return {'data': decoded, 'type': 'success'};
        }

        if (resp.statusCode >= 200 && resp.statusCode < 300) {
          return {'message': respText, 'type': 'success', 'statusCode': resp.statusCode};
        } else {
          throw Exception('HTTP ${resp.statusCode}: $respText');
        }
      }
      throw Exception('Exceeded maximum redirect hops ($_maxRedirectHops)');
    } finally {
      client.close();
    }
  }

  /// Recovers from an already-started redirect chain if an external library threw
  /// "ClientException: Redirect limit exceeded, uri=`url`"
  static Future<Map<String, dynamic>?> resumeRedirectFromUrl(String url) async {
    final client = HttpClient();
    String currentUrl = url;

    try {
      for (int step = 0; step < _maxRedirectHops; step++) {
        final uri = Uri.parse(currentUrl);
        final req = await client.getUrl(uri);
        req.followRedirects = false;

        final resp = await req.close().timeout(_timeoutDuration);
        final location = resp.headers.value(HttpHeaders.locationHeader);

        if ((resp.statusCode >= 300 && resp.statusCode < 400) && location != null) {
          currentUrl = Uri.parse(currentUrl).resolve(location).toString();
          continue;
        }

        final respText = await utf8.decodeStream(resp);
        if (respText.trim().startsWith('{') || respText.trim().startsWith('[')) {
          final decoded = jsonDecode(respText);
          if (decoded is Map<String, dynamic>) {
            return decoded;
          }
          return {'data': decoded, 'type': 'success'};
        }
        return {'message': respText, 'type': 'success'};
      }
    } catch (e) {
      debugPrint('[SendOtpService] resumeRedirectFromUrl error: $e');
    } finally {
      client.close();
    }
    return null;
  }

  /// Sends OTP via SendOTP SDK or resilient redirect engine
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
      final payload = {
        'widgetId': activeWidgetId,
        'tokenAuth': activeAuthToken,
        'identifier': formattedId,
      };
      debugPrint('[SendOtpService] Dispatching sendOtp to MSG91 for $formattedId');

      final response = await _sendRequestWithRedirects(
        initialUrl: 'https://control.msg91.com/api/v5/widget/sendOtpMobile',
        body: payload,
      );
      debugPrint('[SendOtpService] sendOTP response: $response');

      return SendOtpResult.fromResponse(response, identifier: formattedId);
    } catch (e) {
      debugPrint('[SendOtpService] sendOTP error: $e');
      final errorStr = e.toString();

      // If a carrier redirect URL is present in the error string, resume it
      final match = RegExp(r'uri=(https?://\S+)').firstMatch(errorStr);
      if (match != null) {
        final haltedUrl = match.group(1)!;
        debugPrint('[SendOtpService] Resuming halted carrier redirect from: $haltedUrl');
        try {
          final recovered = await resumeRedirectFromUrl(haltedUrl);
          if (recovered != null) {
            return SendOtpResult.fromResponse(recovered, identifier: formattedId);
          }
        } catch (recoveryError) {
          debugPrint('[SendOtpService] Carrier redirect recovery error: $recoveryError');
        }
      }

      return SendOtpResult(
        isSuccess: false,
        message: errorStr.replaceFirst('Exception: ', ''),
        rawResponse: {'error': errorStr},
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
        'widgetId': activeWidgetId,
        'tokenAuth': activeAuthToken,
        'reqId': reqId,
        'retryChannel': retryChannel,
      };
      debugPrint('[SendOtpService] Dispatching retryOTP for reqId: $reqId, channel: $retryChannel');
      final response = await _sendRequestWithRedirects(
        initialUrl: 'https://control.msg91.com/api/v5/widget/retryOtp',
        body: payload,
      );
      debugPrint('[SendOtpService] retryOTP response: $response');

      return SendOtpResult.fromResponse(response, reqId: reqId);
    } catch (e) {
      debugPrint('[SendOtpService] retryOTP error: $e');
      return SendOtpResult(
        isSuccess: false,
        message: e.toString().replaceFirst('Exception: ', ''),
        rawResponse: {'error': e.toString()},
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
        'widgetId': activeWidgetId,
        'tokenAuth': activeAuthToken,
        'reqId': reqId,
        'otp': otp.trim(),
      };
      debugPrint('[SendOtpService] Dispatching verifyOTP for reqId: $reqId');
      final response = await _sendRequestWithRedirects(
        initialUrl: 'https://control.msg91.com/api/v5/widget/verifyOtp',
        body: payload,
      );
      debugPrint('[SendOtpService] verifyOTP response: $response');

      return SendOtpResult.fromVerifyResponse(response, reqId: reqId);
    } catch (e) {
      debugPrint('[SendOtpService] verifyOTP error: $e');
      return SendOtpResult(
        isSuccess: false,
        message: e.toString().replaceFirst('Exception: ', ''),
        rawResponse: {'error': e.toString()},
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
      final url =
          'https://control.msg91.com/api/v5/widget/getWidgetProcess?widgetId=$activeWidgetId&tokenAuth=$activeAuthToken';
      return await _sendRequestWithRedirects(
        initialUrl: url,
        body: {},
        isInitialPost: false,
      );
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
  final bool invisibleVerified;
  final String? accessToken;
  final Map<String, dynamic>? rawResponse;

  const SendOtpResult({
    required this.isSuccess,
    this.reqId,
    this.message,
    this.type,
    this.invisibleVerified = false,
    this.accessToken,
    this.rawResponse,
  });

  factory SendOtpResult.fromResponse(Map<String, dynamic>? res,
      {String? identifier, String? reqId}) {
    if (res == null) {
      return const SendOtpResult(
        isSuccess: false,
        message: 'No response received from SendOTP service.',
      );
    }

    final type = res['type']?.toString();
    final bool invisibleVerified = res['invisibleVerified'] == true;
    final code = res['code']?.toString() ?? res['statusCode']?.toString();
    final rawMessage =
        res['message']?.toString() ?? res['msg']?.toString() ?? '';

    final bool isSuccess = type == 'success' ||
        res['status'] == 'success' ||
        res['statusCode'] == 200 ||
        invisibleVerified;

    String? extractedReqId = reqId;
    if (res['reqId'] != null) {
      extractedReqId = res['reqId'].toString();
    } else if (res['message'] is String &&
        (res['message'] as String).length >= 10 &&
        !res['message'].toString().contains(' ')) {
      // MSG91 returns the unique reqId in the message field (e.g. 366a72745762303236383538)
      extractedReqId = res['message'].toString();
    } else if (res['message'] is Map && res['message']['reqId'] != null) {
      extractedReqId = res['message']['reqId'].toString();
    }

    String msg;
    if (invisibleVerified) {
      msg = 'Seamless carrier verification successful! SIM identity confirmed.';
    } else if (code == '408' || rawMessage.toLowerCase().contains('ipblocked')) {
      msg = 'Security rate limit: IP temporarily throttled by MSG91. Please wait 5-10 minutes or switch networks.';
    } else if (isSuccess) {
      msg = 'OTP sent successfully via SMS (ReqId: ${extractedReqId ?? ""})';
    } else {
      msg = rawMessage.isNotEmpty ? rawMessage : 'Failed to send OTP';
    }

    return SendOtpResult(
      isSuccess: isSuccess,
      reqId: extractedReqId,
      message: msg,
      type: type,
      invisibleVerified: invisibleVerified,
      accessToken: res['access-token']?.toString(),
      rawResponse: res,
    );
  }

  factory SendOtpResult.fromVerifyResponse(Map<String, dynamic>? res,
      {required String reqId}) {
    if (res == null) {
      return const SendOtpResult(
        isSuccess: false,
        message: 'No response received from OTP verification.',
      );
    }

    final type = res['type']?.toString();
    final rawMessage =
        res['message']?.toString() ?? res['msg']?.toString() ?? '';
    final code = res['code']?.toString() ?? res['statusCode']?.toString();

    // In MSG91 widget API, on successful verification, message contains the JWT access-token (starts with "ey")
    final bool isJwt = rawMessage.startsWith('ey') && rawMessage.contains('.');
    final bool isSuccess = type == 'success' ||
        res['status'] == 'success' ||
        isJwt ||
        rawMessage.toLowerCase().contains('verified');

    String formattedMessage;
    if (isSuccess) {
      formattedMessage = 'OTP verified successfully!';
    } else if (code == '705' || rawMessage.toLowerCase().contains('invalid otp')) {
      formattedMessage = 'Invalid OTP entered. Please verify the 6-digit code received via SMS/WhatsApp.';
    } else if (code == '704' || rawMessage.toLowerCase().contains('limit exceeded')) {
      formattedMessage = 'Verification attempts limit exceeded (max 3). Please tap Retry OTP to get a new code.';
    } else if (code == '408' || rawMessage.toLowerCase().contains('ipblocked')) {
      formattedMessage = 'Security rate limit: IP temporarily throttled by MSG91. Please wait a few minutes or switch networks.';
    } else {
      formattedMessage = rawMessage.isNotEmpty ? rawMessage : 'OTP verification failed';
    }

    return SendOtpResult(
      isSuccess: isSuccess,
      reqId: reqId,
      message: formattedMessage,
      type: type,
      accessToken: isJwt ? rawMessage : res['access-token']?.toString(),
      rawResponse: res,
    );
  }
}
