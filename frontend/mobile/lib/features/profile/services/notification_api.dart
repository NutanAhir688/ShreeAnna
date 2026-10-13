import 'dart:convert';
import 'package:flutter/material.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_config.dart';
import '../../../app/theme.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String category; // Procurement, Inspection, Logistics, Payment, General
  final DateTime timestamp;
  bool isRead;
  final String? relatedEntityId;
  final String? relatedEntityType;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.timestamp,
    this.isRead = false,
    this.relatedEntityId,
    this.relatedEntityType,
  });

  IconData get icon {
    switch (category.toLowerCase()) {
      case 'logistics':
        return Icons.local_shipping_outlined;
      case 'inspection':
        return Icons.verified_outlined;
      case 'procurement':
        return Icons.handshake_outlined;
      case 'payment':
        return Icons.account_balance_wallet_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color get iconColor {
    switch (category.toLowerCase()) {
      case 'logistics':
        return const Color(0xFF0284C7);
      case 'inspection':
        return const Color(0xFF16A34A);
      case 'procurement':
        return ShreeAnnaTheme.primaryGreen;
      case 'payment':
        return const Color(0xFF059669);
      default:
        return const Color(0xFFD97706);
    }
  }

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    DateTime parsedTime;
    try {
      parsedTime = DateTime.parse(json['createdAt'] ?? '').toLocal();
    } catch (_) {
      parsedTime = DateTime.now();
    }

    return NotificationItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Notification',
      message: json['message'] ?? '',
      category: json['category'] ?? 'General',
      timestamp: parsedTime,
      isRead: json['isRead'] == true,
      relatedEntityId: json['relatedEntityId']?.toString(),
      relatedEntityType: json['relatedEntityType']?.toString(),
    );
  }
}

class NotificationApi {
  final ApiClient _apiClient = ApiClient();

  Future<List<NotificationItem>> getNotifications() async {
    final response = await _apiClient.get(ApiConfig.notifications);
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is List) {
        return decoded
            .map((j) => NotificationItem.fromJson(j as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  Future<bool> markAsRead(String id) async {
    final response = await _apiClient.put(ApiConfig.notificationRead(id));
    return response.statusCode == 200;
  }

  Future<bool> markAllAsRead() async {
    final response = await _apiClient.put(ApiConfig.notificationsReadAll);
    return response.statusCode == 200;
  }
}
