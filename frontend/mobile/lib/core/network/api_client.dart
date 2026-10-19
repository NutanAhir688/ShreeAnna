import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../storage/token_storage.dart';
import '../../features/auth/screen/welcome_screen.dart';

/// A global navigator key so ApiClient can redirect to WelcomeScreen
/// from anywhere in the app when a 401 is received.
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class ApiClient {
  final TokenStorage _tokenStorage = TokenStorage();

  Future<http.Response> get(String url) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback(
      (targetUrl) => http.get(Uri.parse(targetUrl), headers: _headers(token)),
      url,
    );
  }

  Future<http.Response> post(String url, {Map<String, dynamic>? body}) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback(
      (targetUrl) => http.post(
        Uri.parse(targetUrl),
        headers: _headers(token),
        body: body == null ? null : jsonEncode(body),
      ),
      url,
    );
  }

  Future<http.Response> uploadFile(
    String url,
    File file, {
    String fieldName = 'file',
    MediaType? contentType,
  }) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback((targetUrl) async {
      final request = http.MultipartRequest('POST', Uri.parse(targetUrl));
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(
        await http.MultipartFile.fromPath(
          fieldName,
          file.path,
          contentType: contentType,
        ),
      );
      final streamedResponse = await request.send();
      return http.Response.fromStream(streamedResponse);
    }, url);
  }

  Future<http.Response> put(String url, {Map<String, dynamic>? body}) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback(
      (targetUrl) => http.put(
        Uri.parse(targetUrl),
        headers: _headers(token),
        body: body == null ? null : jsonEncode(body),
      ),
      url,
    );
  }

  Future<http.Response> patch(String url, {Map<String, dynamic>? body}) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback(
      (targetUrl) => http.patch(
        Uri.parse(targetUrl),
        headers: _headers(token),
        body: body == null ? null : jsonEncode(body),
      ),
      url,
    );
  }

  Future<http.Response> delete(String url) async {
    final token = await _tokenStorage.getAccessToken();
    return _sendWithFallback(
      (targetUrl) => http.delete(Uri.parse(targetUrl), headers: _headers(token)),
      url,
    );
  }

  Future<http.Response> _sendWithFallback(
    Future<http.Response> Function(String url) action,
    String url,
  ) async {
    try {
      final response = await action(url);
      _checkUnauthorized(response, url: url);
      return response;
    } catch (e) {
      if (url.contains('10.0.2.2')) {
        try {
          final fallbackUrl = url.replaceAll('10.0.2.2', '127.0.0.1');
          final response = await action(fallbackUrl);
          _checkUnauthorized(response, url: fallbackUrl);
          return response;
        } catch (_) {
          try {
            final fallbackUrl = url.replaceAll('10.0.2.2', 'localhost');
            final response = await action(fallbackUrl);
            _checkUnauthorized(response, url: fallbackUrl);
            return response;
          } catch (_) {}
        }
      }
      rethrow;
    }
  }

  Map<String, String> _headers(String? token) {
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  /// Called after every response. If the server returns 401 we clear
  /// the stored token and push WelcomeScreen as the new root so the
  /// user is forced to log in again.
  void _checkUnauthorized(http.Response response, {String? url}) {
    if (response.statusCode == 401) {
      // Do not boot the user out if background polling for notifications returned 401
      if (url != null && url.contains('/api/notifications')) {
        debugPrint('Ignored 401 on notification endpoint: $url');
        return;
      }

      _tokenStorage.clearAccessToken();
      navigatorKey.currentState?.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
        (route) => false,
      );
    }
  }
}
