import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const String _accessTokenKey = 'access_token';
  static const String _userRoleKey = 'user_role';
  static const String _driverPhoneKey = 'driver_phone';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // ── Token ──────────────────────────────────────────────────────────────────
  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  Future<void> clearAccessToken() async {
    await _storage.delete(key: _accessTokenKey);
  }

  // ── Role ───────────────────────────────────────────────────────────────────
  /// Save role: "farmer" or "driver"
  Future<void> saveUserRole(String role) async {
    await _storage.write(key: _userRoleKey, value: role);
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: _userRoleKey);
  }

  // ── Driver phone (for auto-routing after cold start) ──────────────────────
  Future<void> saveDriverPhone(String phone) async {
    await _storage.write(key: _driverPhoneKey, value: phone);
  }

  Future<String?> getDriverPhone() async {
    return await _storage.read(key: _driverPhoneKey);
  }

  // ── Clear all session data (logout) ───────────────────────────────────────
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
