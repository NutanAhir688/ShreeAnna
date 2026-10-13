import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/services/push_notification_service.dart';
import '../services/notification_api.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationApi _notificationApi = NotificationApi();
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;
  String _selectedFilter = 'All';

  bool _smsAlerts = true;
  bool _whatsappUpdates = true;
  bool _driverTrackingAlerts = true;
  bool _inspectionReminders = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final items = await _notificationApi.getNotifications();
      if (mounted) {
        setState(() {
          _notifications = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load real notifications: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _notificationApi.markAllAsRead();
      setState(() {
        for (final n in _notifications) {
          n.isRead = true;
        }
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All notifications marked as read'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      debugPrint('Failed to mark all as read: $e');
    }
  }

  Future<void> _onItemTapped(NotificationItem item) async {
    if (!item.isRead) {
      setState(() {
        item.isRead = true;
      });
      try {
        await _notificationApi.markAsRead(item.id);
      } catch (e) {
        debugPrint('Failed to mark notification read: $e');
      }
    }
  }

  void _showNotificationSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
              decoration: const BoxDecoration(
                color: Color(0xFFF7FAF1),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[400],
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Notification Preferences',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF202420),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Control how you receive MSP procurement and logistics alerts.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF6B726B)),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'SMS Alerts',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Receive SMS for MSP agreements & DBT disbursement',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    value: _smsAlerts,
                    activeTrackColor: ShreeAnnaTheme.primaryGreen,
                    onChanged: (val) {
                      setModalState(() => _smsAlerts = val);
                      setState(() => _smsAlerts = val);
                    },
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'WhatsApp Updates',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Receive digital challans and QA certificate PDF',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    value: _whatsappUpdates,
                    activeTrackColor: ShreeAnnaTheme.primaryGreen,
                    onChanged: (val) {
                      setModalState(() => _whatsappUpdates = val);
                      setState(() => _whatsappUpdates = val);
                    },
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Driver Live Tracking',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Notify when truck is dispatched and within 5 km of farm',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    value: _driverTrackingAlerts,
                    activeTrackColor: ShreeAnnaTheme.primaryGreen,
                    onChanged: (val) {
                      setModalState(() => _driverTrackingAlerts = val);
                      setState(() => _driverTrackingAlerts = val);
                    },
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Inspection Reminders',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Reminders 24 hours prior to field QA inspection',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    value: _inspectionReminders,
                    activeTrackColor: ShreeAnnaTheme.primaryGreen,
                    onChanged: (val) {
                      setModalState(() => _inspectionReminders = val);
                      setState(() => _inspectionReminders = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ShreeAnnaTheme.primaryGreen,
                        side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(Icons.notifications_active_outlined, size: 18),
                      label: const Text('Send Test Push Notification', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () async {
                        await PushNotificationService().sendTestNotification();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Push notification delivered! Check status bar.'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ShreeAnnaTheme.primaryGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Preferences saved successfully'),
                            duration: Duration(seconds: 1),
                          ),
                        );
                      },
                      child: const Text('Save Preferences', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  String _timeAgo(DateTime timestamp) {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
  }

  @override
  Widget build(BuildContext context) {
    final filters = ['All', 'Procurement', 'Inspection', 'Logistics', 'Payment'];
    final filtered = _notifications.where((n) {
      if (_selectedFilter == 'All') return true;
      return n.category.toLowerCase() == _selectedFilter.toLowerCase();
    }).toList();

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF202420)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Color(0xFF202420),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF202420)),
            tooltip: 'Settings',
            onPressed: _showNotificationSettings,
          ),
          TextButton(
            onPressed: _notifications.isEmpty ? null : _markAllAsRead,
            child: const Text(
              'Mark read',
              style: TextStyle(
                color: ShreeAnnaTheme.primaryGreen,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: filters.map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(
                      filter,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFF303530),
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                    selectedColor: ShreeAnnaTheme.primaryGreen,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? ShreeAnnaTheme.primaryGreen : const Color(0xFFD5DFD0),
                    ),
                    showCheckmark: false,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 6),

          // Notification List
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
                  )
                : RefreshIndicator(
                    onRefresh: _loadNotifications,
                    color: ShreeAnnaTheme.primaryGreen,
                    child: filtered.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                              Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.notifications_off_outlined, size: 52, color: Colors.grey[400]),
                                    const SizedBox(height: 12),
                                    Text(
                                      'No notifications in this category',
                                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Pull down to refresh',
                                      style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(18, 6, 18, 24),
                            itemCount: filtered.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final item = filtered[index];
                              return InkWell(
                                onTap: () => _onItemTapped(item),
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: item.isRead ? Colors.white : const Color(0xFFF1F8EE),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: item.isRead
                                          ? const Color(0xFFD5DFD0)
                                          : ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.3),
                                      width: item.isRead ? 1 : 1.5,
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 38,
                                        height: 38,
                                        decoration: BoxDecoration(
                                          color: item.iconColor.withValues(alpha: 0.12),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(item.icon, size: 20, color: item.iconColor),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    item.title,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight:
                                                          item.isRead ? FontWeight.w600 : FontWeight.bold,
                                                      color: const Color(0xFF202420),
                                                    ),
                                                  ),
                                                ),
                                                Text(
                                                  _timeAgo(item.timestamp),
                                                  style: const TextStyle(
                                                    fontSize: 10,
                                                    color: Color(0xFF889088),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              item.message,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF555B55),
                                                height: 1.35,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (!item.isRead) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          width: 8,
                                          height: 8,
                                          margin: const EdgeInsets.only(top: 4),
                                          decoration: const BoxDecoration(
                                            color: ShreeAnnaTheme.primaryGreen,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
