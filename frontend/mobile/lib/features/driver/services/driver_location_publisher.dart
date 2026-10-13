import 'dart:async';
import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

/// Call start() only after an authenticated driver starts an assigned trip.
/// Call stop() when the trip ends or the driver signs out.
class DriverLocationPublisher {
  DriverLocationPublisher({
    required this.apiBaseUrl,
    required this.lotId,
    required this.accessToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  final String apiBaseUrl;
  final String lotId;
  final String accessToken;
  final http.Client _client;
  StreamSubscription<Position>? _subscription;
  bool _sending = false;

  Future<void> start() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw Exception('Enable device location services to share driver location.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception('Location permission is required during an active trip.');
    }

    await stop();
    const settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    );
    _subscription = Geolocator.getPositionStream(locationSettings: settings).listen(
      (position) => _sendPosition(position),
      onError: (Object error) {
        // Replace with your app's logger/error reporting.
      },
    );
  }

  Future<void> _sendPosition(Position position) async {
    if (_sending) return;
    _sending = true;
    try {
      final base = apiBaseUrl.endsWith('/')
          ? apiBaseUrl.substring(0, apiBaseUrl.length - 1)
          : apiBaseUrl;
      final uri = Uri.parse('$base/api/lots/${Uri.encodeComponent(lotId)}/location');
      final response = await _client.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracyMeters': position.accuracy,
          'recordedAt': DateTime.now().toUtc().toIso8601String(),
        }),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode < 200 || response.statusCode >= 300) {
        // Integrate with your app's logger. Do not silently treat failed posts as live.
      }
    } catch (_) {
      // Handle/log connectivity failures in the app. Do not fake a location.
    } finally {
      _sending = false;
    }
  }

  Future<void> stop() async {
    await _subscription?.cancel();
    _subscription = null;
  }

  Future<void> dispose() async {
    await stop();
    _client.close();
  }
}
