import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../network/api_client.dart'; // contains navigatorKey
import '../../features/profile/screen/notifications_screen.dart';
import '../../features/profile/services/notification_api.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();
  final NotificationApi _notificationApi = NotificationApi();

  bool _isInitialized = false;
  Timer? _pollingTimer;

  static const String _channelId = 'shreeanna_push_alerts';
  static const String _channelName = 'ShreeAnna MSP & Logistics Alerts';
  static const String _channelDescription =
      'Real-time alerts for procurement lots, quality inspections, driver tracking, and DBT payments';

  Future<void> initialize() async {
    if (_isInitialized) return;

    const androidSettings = AndroidInitializationSettings('@mipmap/launcher_icon');
    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const linuxSettings = LinuxInitializationSettings(
      defaultActionName: 'Open notification',
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: darwinSettings,
      macOS: darwinSettings,
      linux: linuxSettings,
    );

    try {
      await _notificationsPlugin.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );
    } catch (e) {
      debugPrint('Warning: Local notifications initialization failed: $e');
    }

    // Create high-importance Android Notification Channel
    final androidChannel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: _channelDescription,
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    final androidImplementation = _notificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidImplementation != null) {
      await androidImplementation.createNotificationChannel(androidChannel);
      await androidImplementation.requestNotificationsPermission();
    }

    _isInitialized = true;

    // Start background sync polling for new notifications every 30 seconds
    startPolling();
  }

  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Push Notification tapped: ${response.payload}');
    final context = navigatorKey.currentContext;
    if (context != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const NotificationsScreen()),
      );
    }
  }

  Future<void> showPushNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    String category = 'General',
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.max,
      priority: Priority.high,
      ticker: 'ShreeAnna Alert',
      color: const Color(0xFF08752A),
      enableLights: true,
      enableVibration: true,
      styleInformation: BigTextStyleInformation(
        body,
        contentTitle: title,
        summaryText: category,
      ),
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: details,
      payload: payload,
    );
  }

  /// Triggers a test push notification to immediately verify delivery on device
  Future<void> sendTestNotification({
    String title = 'Driver En Route to Farm',
    String body = 'Driver Ramesh Patel (GJ-01-AB-1234) is within 3 km of your farm. Verification code: 4829 ready.',
    String category = 'Logistics',
  }) async {
    await showPushNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: title,
      body: body,
      category: category,
      payload: jsonEncode({'type': 'test', 'category': category}),
    );
  }

  /// Polls the backend for new unread notifications and fires push alerts
  Future<void> syncAndNotifyNew() async {
    try {
      final notifications = await _notificationApi.getNotifications();
      final prefs = await SharedPreferences.getInstance();
      final seenIds = (prefs.getStringList('seen_push_notification_ids') ?? []).toSet();
      final seenKeys = (prefs.getStringList('seen_push_notification_keys') ?? []).toSet();

      // On first startup, seed existing notification IDs/keys so we don't blast the user with historic notifications
      final isInitialized = prefs.getBool('push_notifications_seeded') ?? false;
      if (!isInitialized) {
        for (final n in notifications) {
          seenIds.add(n.id);
          final dedupKey = '${n.relatedEntityId}_${n.category}_${n.title}';
          seenKeys.add(dedupKey);
        }
        await prefs.setStringList('seen_push_notification_ids', seenIds.toList());
        await prefs.setStringList('seen_push_notification_keys', seenKeys.toList());
        await prefs.setBool('push_notifications_seeded', true);
        return;
      }

      final unreadNew = notifications.where((n) {
        final dedupKey = '${n.relatedEntityId}_${n.category}_${n.title}';
        return !n.isRead && !seenIds.contains(n.id) && !seenKeys.contains(dedupKey);
      }).toList();

      for (final n in unreadNew) {
        final dedupKey = '${n.relatedEntityId}_${n.category}_${n.title}';
        await showPushNotification(
          id: n.id.hashCode,
          title: n.title,
          body: n.message,
          category: n.category,
          payload: jsonEncode({
            'id': n.id,
            'category': n.category,
            'relatedEntityId': n.relatedEntityId,
            'relatedEntityType': n.relatedEntityType,
          }),
        );
        seenIds.add(n.id);
        seenKeys.add(dedupKey);
      }

      await prefs.setStringList('seen_push_notification_ids', seenIds.toList());
      await prefs.setStringList('seen_push_notification_keys', seenKeys.toList());
    } catch (e) {
      debugPrint('Error syncing push notifications: $e');
    }
  }

  void startPolling({Duration interval = const Duration(seconds: 60)}) {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(interval, (_) => syncAndNotifyNew());
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }
}
