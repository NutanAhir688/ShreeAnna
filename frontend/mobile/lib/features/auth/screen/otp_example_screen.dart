import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../core/services/send_otp_service.dart';

/// Standalone OTP Verification Screen implementing the SendOTP Flutter SDK integration
class OTPExample extends StatefulWidget {
  final String? initialPhone;

  const OTPExample({super.key, this.initialPhone});

  @override
  State<OTPExample> createState() => _OTPExampleState();
}

class _OTPExampleState extends State<OTPExample> {
  String get widgetId => SendOtpService.activeWidgetId;
  String get authToken => SendOtpService.activeAuthToken;

  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _reqIdController = TextEditingController();

  String phoneNumber = '';
  String? reqId;
  String _statusMessage = '';
  String _lastResponseJson = '';
  bool _isLoading = false;
  int _selectedRetryChannel = SendOtpService.channelSms; // 11 = SMS

  @override
  void initState() {
    super.initState();
    // Initialize widget from .env configuration
    SendOtpService.initialize();

    if (widget.initialPhone != null && widget.initialPhone!.isNotEmpty) {
      _phoneController.text = widget.initialPhone!;
      phoneNumber = widget.initialPhone!;
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _reqIdController.dispose();
    super.dispose();
  }

  String _cleanIdentifier(String input) {
    return SendOtpService.formatIdentifier(input);
  }

  // Method to send OTP (Step 3: handleSendOtp)
  Future<void> handleSendOtp() async {
    if (!SendOtpService.isConfigured) {
      _showToast('SENDOTP credentials missing in .env');
      setState(() {
        _statusMessage = 'Configuration Error: SENDOTP_WIDGET_ID and SENDOTP_AUTH_TOKEN must be configured in frontend/mobile/.env';
      });
      return;
    }

    final rawInput = _phoneController.text.trim();
    if (rawInput.isEmpty) {
      _showToast('Please enter a phone number or email');
      return;
    }

    final identifier = _cleanIdentifier(rawInput);
    setState(() {
      _isLoading = true;
      _statusMessage = 'Sending OTP to $identifier...';
      _lastResponseJson = '';
    });

    try {
      final result = await SendOtpService.sendOtp(identifier);
      debugPrint('[OTPExample] sendOTP result: isSuccess=${result.isSuccess}, reqId=${result.reqId}');

      setState(() {
        _lastResponseJson = result.rawResponse != null
            ? const JsonEncoder.withIndent('  ').convert(result.rawResponse)
            : '{"message": "${result.message}"}';
        if (result.isSuccess) {
          reqId = result.reqId;
          if (reqId != null) {
            _reqIdController.text = reqId!;
          }
          _statusMessage = result.invisibleVerified
              ? 'Seamless Carrier Verification Successful! (ReqID: ${reqId ?? "captured"})'
              : 'OTP Sent Successfully! (ReqID: ${reqId ?? "captured"})';
        } else {
          _statusMessage = 'Send OTP Failed: ${result.message}';
        }
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Exception: $e';
        _lastResponseJson = '{"error": "$e"}';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Method to retry OTP (SDK Method: retryOTP)
  Future<void> handleRetryOtp() async {
    if (!SendOtpService.isConfigured) {
      _showToast('SENDOTP credentials missing in .env');
      setState(() {
        _statusMessage = 'Configuration Error: SENDOTP credentials missing in frontend/mobile/.env';
      });
      return;
    }

    final activeReqId = _reqIdController.text.trim();
    if (activeReqId.isEmpty) {
      _showToast('Request ID (reqId) is required to retry OTP');
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = 'Retrying OTP via channel $_selectedRetryChannel...';
    });

    try {
      final result = await SendOtpService.retryOtp(
        reqId: activeReqId,
        retryChannel: _selectedRetryChannel,
      );
      debugPrint('[OTPExample] retryOTP result: isSuccess=${result.isSuccess}');

      setState(() {
        _lastResponseJson = result.rawResponse != null
            ? const JsonEncoder.withIndent('  ').convert(result.rawResponse)
            : '{"message": "${result.message}"}';
        _statusMessage = result.isSuccess
            ? 'Retry OTP initiated via selected channel!'
            : 'Retry Failed: ${result.message}';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Exception: $e';
        _lastResponseJson = '{"error": "$e"}';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Method to verify OTP (SDK Method: verifyOTP)
  Future<void> handleVerifyOtp() async {
    if (!SendOtpService.isConfigured) {
      _showToast('SENDOTP credentials missing in .env');
      setState(() {
        _statusMessage = 'Configuration Error: SENDOTP credentials missing in frontend/mobile/.env';
      });
      return;
    }

    final activeReqId = _reqIdController.text.trim();
    final otp = _otpController.text.trim();

    if (activeReqId.isEmpty) {
      _showToast('Request ID (reqId) is required');
      return;
    }

    if (otp.isEmpty || otp.length < 4) {
      _showToast('Please enter the OTP received');
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = 'Verifying OTP $otp with MSG91 servers...';
    });

    try {
      final result = await SendOtpService.verifyOtp(
        reqId: activeReqId,
        otp: otp,
      );
      debugPrint('[OTPExample] verifyOTP result: isSuccess=${result.isSuccess}');

      setState(() {
        _lastResponseJson = result.rawResponse != null
            ? const JsonEncoder.withIndent('  ').convert(result.rawResponse)
            : '{"message": "${result.message}"}';
        _statusMessage = result.isSuccess
            ? 'VERIFICATION SUCCESSFUL! OTP confirmed.'
            : 'Verification Failed: ${result.message}';
      });

      if (result.isSuccess && mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: ShreeAnnaTheme.primaryGreen),
                SizedBox(width: 8),
                Text('OTP Verified!'),
              ],
            ),
            content: Text(
              'Mobile identifier has been cryptographically confirmed via SendOTP SDK.\nReqId: $activeReqId',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      setState(() {
        _statusMessage = 'Exception: $e';
        _lastResponseJson = '{"error": "$e"}';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> handleGetWidgetProcess() async {
    if (!SendOtpService.isConfigured) {
      _showToast('SENDOTP credentials missing in .env');
      setState(() {
        _statusMessage = 'Configuration Error: SENDOTP credentials missing in frontend/mobile/.env';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = 'Fetching widget configuration process...';
    });
    try {
      final response = await SendOtpService.getWidgetProcess();
      setState(() {
        _lastResponseJson = response != null
            ? const JsonEncoder.withIndent('  ').convert(response)
            : '{"message": "No process data returned"}';
        _statusMessage = response != null
            ? 'Widget process fetched successfully.'
            : 'Failed to fetch widget process.';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Widget process error: $e';
        _lastResponseJson = '{"error": "$e"}';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showToast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), duration: const Duration(seconds: 2)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SendOTP Verification SDK',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            Text(
              'MSG91 Official Flutter SDK Integration',
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'Inspect Widget Process',
            onPressed: handleGetWidgetProcess,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Config Credentials Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.key, size: 16, color: ShreeAnnaTheme.primaryGreen),
                      const SizedBox(width: 6),
                      const Text(
                        'Active SDK Credentials',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: SendOtpService.isConfigured ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          SendOtpService.isConfigured ? 'Active (.env)' : 'Missing in .env',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: SendOtpService.isConfigured ? const Color(0xFF166534) : const Color(0xFF92400E),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Config Source: frontend/mobile/.env\nWidget ID: ${widgetId.isNotEmpty ? widgetId : "(Missing in .env)"}\nAuth Token: ${authToken.isNotEmpty ? "${authToken.substring(0, authToken.length > 8 ? 8 : authToken.length)}****************" : "(Missing in .env)"}',
                    style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Color(0xFF475569)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Step 1: Phone / Identifier Input
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Step 1: Send OTP',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Enter 10-digit mobile number or email address (identifier)',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      labelText: 'Phone Number or Email',
                      hintText: 'e.g. 9876543210 or user@example.com',
                      prefixIcon: const Icon(Icons.phone_android, size: 20, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    onChanged: (val) => setState(() => phoneNumber = val),
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : handleSendOtp,
                    icon: _isLoading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.send, size: 16),
                    label: const Text('Send OTP (OTPWidget.sendOTP)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Step 2: Request ID & Retry OTP Channel
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Step 2: Request ID (reqId) & Retry',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Captured from sendOTP response for retry and verification',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _reqIdController,
                    decoration: InputDecoration(
                      labelText: 'Request ID (reqId)',
                      hintText: 'Auto-populated on sendOTP or paste here',
                      prefixIcon: const Icon(Icons.tag, size: 20, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Retry Channel:',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('SMS (11)'),
                        selected: _selectedRetryChannel == SendOtpService.channelSms,
                        onSelected: (val) => setState(() => _selectedRetryChannel = SendOtpService.channelSms),
                      ),
                      ChoiceChip(
                        label: const Text('WhatsApp (12)'),
                        selected: _selectedRetryChannel == SendOtpService.channelWhatsApp,
                        onSelected: (val) => setState(() => _selectedRetryChannel = SendOtpService.channelWhatsApp),
                      ),
                      ChoiceChip(
                        label: const Text('Voice (4)'),
                        selected: _selectedRetryChannel == SendOtpService.channelVoice,
                        onSelected: (val) => setState(() => _selectedRetryChannel = SendOtpService.channelVoice),
                      ),
                      ChoiceChip(
                        label: const Text('Email (3)'),
                        selected: _selectedRetryChannel == SendOtpService.channelEmail,
                        onSelected: (val) => setState(() => _selectedRetryChannel = SendOtpService.channelEmail),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: _isLoading ? null : handleRetryOtp,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Retry OTP (OTPWidget.retryOTP)'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1E293B),
                      minimumSize: const Size.fromHeight(42),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Step 3: Verify OTP
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Step 3: Verify OTP',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Validate code with OTPWidget.verifyOTP',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: InputDecoration(
                      labelText: 'Enter OTP Code',
                      hintText: 'e.g. 1234 or 123456',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : handleVerifyOtp,
                    icon: _isLoading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.check_circle_outline, size: 16),
                    label: const Text('Verify OTP (OTPWidget.verifyOTP)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF15803D),
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Status message
            if (_statusMessage.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: _statusMessage.contains('SUCCESS')
                      ? const Color(0xFFDCFCE7)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _statusMessage.contains('SUCCESS')
                        ? const Color(0xFF86EFAC)
                        : const Color(0xFFCBD5E1),
                  ),
                ),
                child: Text(
                  _statusMessage,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _statusMessage.contains('SUCCESS') ? const Color(0xFF166534) : const Color(0xFF334155),
                  ),
                ),
              ),

            // Live JSON Response Viewer
            if (_lastResponseJson.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Live Response Payload (JSON)',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    SelectableText(
                      _lastResponseJson,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: Color(0xFF38BDF8),
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
}
