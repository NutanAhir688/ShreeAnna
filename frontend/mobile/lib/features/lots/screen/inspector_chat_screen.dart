import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';

class InspectorChatScreen extends StatefulWidget {
  final String lotId;
  final String lotNumber;
  final String milletType;
  final double quantityKg;
  final String inspectorName;
  final String inspectorPhone;
  final String farmerName;

  const InspectorChatScreen({
    super.key,
    required this.lotId,
    required this.lotNumber,
    required this.milletType,
    required this.quantityKg,
    required this.inspectorName,
    required this.inspectorPhone,
    this.farmerName = 'Farmer Member',
  });

  @override
  State<InspectorChatScreen> createState() => _InspectorChatScreenState();
}

class _InspectorChatScreenState extends State<InspectorChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  Timer? _pollingTimer;

  String get _sessionId => 'lot_${widget.lotId}';

  @override
  void initState() {
    super.initState();
    _connectAndLoadHistory();
    // Auto-poll every 2.5 seconds for inspector replies from the web portal
    _pollingTimer = Timer.periodic(const Duration(milliseconds: 2500), (_) {
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
          duration: const Duration(milliseconds: 300),
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
          'sessionId': _sessionId,
          'role': 'Farmer',
          'userName': widget.farmerName,
          'journeyStage': 'Moisture & Impurity Assaying',
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
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pollIncomingMessages() async {
    if (!mounted) return;
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}/api/support/chat/messages?sessionId=${Uri.encodeComponent(_sessionId)}',
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
      // Ignore background poll errors
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
          'sessionId': _sessionId,
          'sender': widget.farmerName,
          'content': text,
          'journeyStage': 'Moisture & Impurity Assaying',
          'role': 'Farmer',
        }),
      );

      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        final existingIds = _messages.map((m) => m['id']?.toString()).toSet();
        for (final item in data) {
          final id = item['id']?.toString();
          if (id != null && !existingIds.contains(id)) {
            _messages.add(Map<String, dynamic>.from(item));
          }
        }
        if (mounted) {
          setState(() {});
          _scrollToBottom();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _callInspector() async {
    final phone = widget.inspectorPhone.trim();
    if (phone.isEmpty) return;
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch phone dialer for $phone')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cropName = widget.milletType.isNotEmpty ? widget.milletType : 'Pearl Millet';
    final lotNum = widget.lotNumber.isNotEmpty ? widget.lotNumber : '2632-F';

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAF8),
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.inspectorName,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFF86D49B),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  'Quality Inspector • Lot #$lotNum',
                  style: const TextStyle(fontSize: 11, color: Colors.white70),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone),
            tooltip: 'Call Inspector',
            onPressed: _callInspector,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Status Header Strip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              color: const Color(0xFFEFF5EB),
              child: Row(
                children: [
                  const Icon(
                    Icons.verified_outlined,
                    color: ShreeAnnaTheme.primaryGreen,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Live 1-to-1 Support • $cropName (${widget.quantityKg.toStringAsFixed(0)} kg)',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B4324),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFFD5DFD0)),
                    ),
                    child: const Text(
                      'Akka.NET Synced',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Messages List
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      itemCount: _messages.length,
                      itemBuilder: (ctx, idx) {
                        final msg = _messages[idx];
                        final isMe = msg['role'] == 'Farmer' && msg['isAgent'] == false;
                        final sender = msg['sender']?.toString() ?? 'Support';
                        final content = msg['content']?.toString() ?? '';
                        final tsStr = msg['timestamp']?.toString();
                        String timeText = '';
                        if (tsStr != null) {
                          final dt = DateTime.tryParse(tsStr)?.toLocal();
                          if (dt != null) {
                            timeText = '${dt.hour.toString().padLeft(2, "0")}:${dt.minute.toString().padLeft(2, "0")}';
                          }
                        }

                        return Align(
                          alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.78,
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                            decoration: BoxDecoration(
                              color: isMe ? ShreeAnnaTheme.primaryGreen : Colors.white,
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(12),
                                topRight: const Radius.circular(12),
                                bottomLeft: Radius.circular(isMe ? 12 : 2),
                                bottomRight: Radius.circular(isMe ? 2 : 12),
                              ),
                              border: isMe ? null : Border.all(color: const Color(0xFFE2ECE0)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment:
                                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                              children: [
                                if (!isMe)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 3),
                                    child: Text(
                                      sender,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1B4324),
                                      ),
                                    ),
                                  ),
                                Text(
                                  content,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isMe ? Colors.white : const Color(0xFF202420),
                                    height: 1.35,
                                  ),
                                ),
                                if (timeText.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      timeText,
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: isMe ? Colors.white70 : const Color(0xFF909890),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Quick Prompt Chips
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildQuickChip('When will you arrive for sampling?'),
                    const SizedBox(width: 6),
                    _buildQuickChip('What is the max allowed moisture?'),
                    const SizedBox(width: 6),
                    _buildQuickChip('Sample bags ready in shade.'),
                  ],
                ),
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE4ECE2))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText: 'Message ${widget.inspectorName}...',
                        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF889088)),
                        isDense: true,
                        filled: true,
                        fillColor: const Color(0xFFF4F7F4),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _isSending ? null : () => _sendMessage(),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _isSending ? Colors.grey : ShreeAnnaTheme.primaryGreen,
                        shape: BoxShape.circle,
                      ),
                      child: _isSending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(
                              Icons.send,
                              color: Colors.white,
                              size: 18,
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickChip(String label) {
    return ActionChip(
      label: Text(
        label,
        style: const TextStyle(fontSize: 11, color: Color(0xFF1B4324)),
      ),
      backgroundColor: const Color(0xFFEFF5EB),
      side: const BorderSide(color: Color(0xFFD0E0CE)),
      padding: EdgeInsets.zero,
      onPressed: _isSending ? null : () => _sendMessage(label),
    );
  }
}
