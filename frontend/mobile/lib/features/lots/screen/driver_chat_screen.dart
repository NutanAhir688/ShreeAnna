import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';

/// Live 1-to-1 Driver <-> Farmer chat screen inspired by Rapido / ride-hailing apps.
/// Provides real-time messaging, trip context banner, quick reply chips, and direct calling.
class DriverChatScreen extends StatefulWidget {
  final String sessionId;
  final String lotId;
  final String lotNumber;
  final String milletType;
  final String quantityKg;
  final String otherPartyName;
  final String otherPartyPhone;
  final String vehicleNumber;
  final String pickupCode;
  final String pickupLocation;
  final String farmerName;
  final bool isDriver;

  const DriverChatScreen({
    super.key,
    required this.sessionId,
    required this.lotId,
    required this.otherPartyName,
    this.lotNumber = '',
    this.milletType = 'Millet',
    this.quantityKg = '',
    this.otherPartyPhone = '',
    this.vehicleNumber = '',
    this.pickupCode = '',
    this.pickupLocation = '',
    this.farmerName = 'Farmer Member',
    this.isDriver = false,
  });

  @override
  State<DriverChatScreen> createState() => _DriverChatScreenState();
}

class _DriverChatScreenState extends State<DriverChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  Timer? _pollingTimer;

  String get _myRole => widget.isDriver ? 'Driver' : 'Farmer';
  String get _myName => widget.isDriver ? 'Assigned Driver' : widget.farmerName;

  List<String> get _quickReplies {
    if (widget.isDriver) {
      return [
        '🚚 I am on my way to your farm',
        '📍 Arrived at your pickup location',
        '⏳ Heavy traffic, reaching in 10-15 mins',
        '🔢 Please keep the 4-digit OTP ready',
        '📦 Please keep the produce bags near the road',
      ];
    } else {
      return [
        '🌾 I am at the farm gate',
        '⏳ How much time will it take to reach?',
        '📞 Please call me once you reach the village road',
        '📦 All millet bags are weighed & ready',
        '📍 Sharing landmark near my farm location',
      ];
    }
  }

  @override
  void initState() {
    super.initState();
    _connectAndLoadHistory();
    // Auto-poll every 2.0 seconds for live replies between driver and farmer
    _pollingTimer = Timer.periodic(const Duration(milliseconds: 2000), (_) {
      _pollIncomingMessages();
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _connectAndLoadHistory() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/api/support/chat/connect');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'sessionId': widget.sessionId,
          'role': _myRole,
          'userName': _myName,
          'journeyStage': 'Produce Pickup & Transit',
        }),
      );

      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        if (mounted) {
          setState(() {
            _messages.clear();
            for (final m in data) {
              _messages.add(Map<String, dynamic>.from(m));
            }
            _isLoading = false;
          });
          _scrollToBottom();
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pollIncomingMessages() async {
    if (!mounted) return;
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}/api/support/chat/history?sessionId=${Uri.encodeComponent(widget.sessionId)}',
      );
      final res = await http.get(url);
      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        if (data.isNotEmpty && mounted) {
          final existingIds = _messages.map((m) => m['id']?.toString()).toSet();
          bool added = false;
          for (final item in data) {
            final id = item['id']?.toString();
            if (id != null && !existingIds.contains(id)) {
              _messages.add(Map<String, dynamic>.from(item));
              added = true;
            }
          }
          if (added && mounted) {
            setState(() {});
            _scrollToBottom();
          }
        }
      }
    } catch (_) {
      // Ignore poll network errors
    }
  }

  Future<void> _sendMessage([String? quickText]) async {
    final text = (quickText ?? _textController.text).trim();
    if (text.isEmpty || _isSending) return;

    if (quickText == null) {
      _textController.clear();
    }

    setState(() => _isSending = true);

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/api/support/chat/send');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'sessionId': widget.sessionId,
          'sender': _myName,
          'content': text,
          'journeyStage': 'Produce Pickup & Transit',
          'role': _myRole,
        }),
      );

      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        if (mounted) {
          final existingIds = _messages.map((m) => m['id']?.toString()).toSet();
          for (final item in data) {
            final id = item['id']?.toString();
            if (id != null && !existingIds.contains(id)) {
              _messages.add(Map<String, dynamic>.from(item));
            }
          }
          setState(() => _isSending = false);
          _scrollToBottom();
        }
      } else {
        if (mounted) setState(() => _isSending = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _callOtherParty() async {
    if (widget.otherPartyPhone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Phone number not available.')),
      );
      return;
    }
    final uri = Uri.parse('tel:${widget.otherPartyPhone.replaceAll(' ', '')}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Calling ${widget.otherPartyPhone}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasPhone = widget.otherPartyPhone.trim().isNotEmpty;
    final otherName = widget.otherPartyName.isNotEmpty ? widget.otherPartyName : (widget.isDriver ? 'Farmer' : 'Driver');

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0.5,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 19,
                  backgroundColor: widget.isDriver
                      ? const Color(0xFFE0F2FE)
                      : const Color(0xFFE8F5E9),
                  child: Text(
                    otherName.isNotEmpty ? otherName[0].toUpperCase() : '?',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: widget.isDriver
                          ? const Color(0xFF0284C7)
                          : ShreeAnnaTheme.primaryGreen,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    otherName,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    widget.isDriver
                        ? 'Farmer • Millet Seller'
                        : (widget.vehicleNumber.isNotEmpty
                            ? '${widget.vehicleNumber} • Driver'
                            : 'Assigned Driver'),
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (hasPhone)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: IconButton(
                onPressed: _callOtherParty,
                icon: Container(
                  padding: const EdgeInsets.all(7),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.phone,
                    color: ShreeAnnaTheme.primaryGreen,
                    size: 18,
                  ),
                ),
                tooltip: 'Call $otherName',
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Trip Context Info Banner (Rapido-style)
          _buildTripContextBanner(),

          // Chat Messages List
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
                  )
                : _messages.isEmpty
                    ? _buildEmptyState(otherName)
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[index];
                          return _buildMessageBubble(msg);
                        },
                      ),
          ),

          // Rapido-Style Quick Replies Bar
          _buildQuickRepliesBar(),

          // Input Bar
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildTripContextBanner() {
    final hasOtp = widget.pickupCode.isNotEmpty;
    final hasLocation = widget.pickupLocation.isNotEmpty;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          bottom: BorderSide(color: Color(0xFFE2E8F0)),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.grass_rounded, size: 15, color: Color(0xFF16A34A)),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${widget.milletType}${widget.quantityKg.isNotEmpty ? ' • ${widget.quantityKg}' : ''}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                ],
              ),
              if (hasOtp)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_user_outlined, size: 12, color: Color(0xFFB45309)),
                      const SizedBox(width: 4),
                      Text(
                        'OTP: ${widget.pickupCode}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF92400E),
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          if (hasLocation) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    widget.pickupLocation,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyState(String otherName) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.chat_bubble_outline, size: 36, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 12),
            Text(
              'Direct Chat with $otherName',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            ),
            const SizedBox(height: 6),
            Text(
              widget.isDriver
                  ? 'Coordinate pickup timing, farm gate arrival, and OTP verification with the farmer.'
                  : 'Coordinate vehicle arrival, farm directions, and loading with your assigned driver.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: _quickReplies.take(3).map((chip) {
                return ActionChip(
                  label: Text(chip, style: const TextStyle(fontSize: 11, color: Color(0xFF334155))),
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
                  onPressed: () => _sendMessage(chip),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    final senderRole = msg['role']?.toString() ?? '';
    final senderName = msg['sender']?.toString() ?? '';
    final content = msg['content']?.toString() ?? '';
    final timestampRaw = msg['timestamp']?.toString();

    // Determine if the message belongs to current user
    final isMe = senderRole.toLowerCase() == _myRole.toLowerCase() ||
        senderName.toLowerCase() == _myName.toLowerCase();

    String formattedTime = '';
    if (timestampRaw != null) {
      try {
        final dt = DateTime.parse(timestampRaw).toLocal();
        final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        final m = dt.minute.toString().padLeft(2, '0');
        formattedTime = '$h:$m $ampm';
      } catch (_) {
        formattedTime = '';
      }
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 12,
              backgroundColor: widget.isDriver
                  ? const Color(0xFFE8F5E9)
                  : const Color(0xFFE0F2FE),
              child: Text(
                senderName.isNotEmpty ? senderName[0].toUpperCase() : '?',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: widget.isDriver
                      ? ShreeAnnaTheme.primaryGreen
                      : const Color(0xFF0284C7),
                ),
              ),
            ),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                color: isMe ? ShreeAnnaTheme.primaryGreen : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(14),
                  topRight: const Radius.circular(14),
                  bottomLeft: isMe ? const Radius.circular(14) : const Radius.circular(2),
                  bottomRight: isMe ? const Radius.circular(2) : const Radius.circular(14),
                ),
                border: isMe ? null : Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!isMe)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Text(
                        senderRole.isNotEmpty ? senderRole : senderName,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: widget.isDriver
                              ? ShreeAnnaTheme.primaryGreen
                              : const Color(0xFF0284C7),
                        ),
                      ),
                    ),
                  Text(
                    content,
                    style: TextStyle(
                      fontSize: 13.5,
                      color: isMe ? Colors.white : const Color(0xFF0F172A),
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        formattedTime,
                        style: TextStyle(
                          fontSize: 9.5,
                          color: isMe ? Colors.white.withValues(alpha: 0.75) : const Color(0xFF94A3B8),
                        ),
                      ),
                      if (isMe) ...[
                        const SizedBox(width: 4),
                        Icon(
                          Icons.done_all,
                          size: 12,
                          color: Colors.white.withValues(alpha: 0.85),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickRepliesBar() {
    return Container(
      height: 42,
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        itemCount: _quickReplies.length,
        itemBuilder: (context, index) {
          final reply = _quickReplies[index];
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: InkWell(
              onTap: () => _sendMessage(reply),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  reply,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF334155),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        top: 8,
        bottom: MediaQuery.of(context).viewInsets.bottom > 0
            ? 8
            : MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _textController,
                textCapitalization: TextCapitalization.sentences,
                keyboardType: TextInputType.text,
                decoration: InputDecoration(
                  hintText: widget.isDriver ? 'Message farmer...' : 'Message driver...',
                  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: _isSending ? null : () => _sendMessage(),
            borderRadius: BorderRadius.circular(24),
            child: Container(
              width: 42,
              height: 42,
              decoration: const BoxDecoration(
                color: ShreeAnnaTheme.primaryGreen,
                shape: BoxShape.circle,
              ),
              child: _isSending
                  ? const Center(
                      child: SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      ),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
