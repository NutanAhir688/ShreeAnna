import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/storage/token_storage.dart';
import '../../driver/models/driver_dispatch_model.dart';
import '../../driver/screens/driver_journey_screen.dart';
import '../../driver/services/driver_api.dart';
import '../../../core/services/send_otp_service.dart';
import '../services/driver_auth_api.dart';
import 'login_screen.dart';

class DriverLoginScreen extends StatefulWidget {
  final String? initialPhone;

  const DriverLoginScreen({super.key, this.initialPhone});

  @override
  State<DriverLoginScreen> createState() => _DriverLoginScreenState();
}

class _DriverLoginScreenState extends State<DriverLoginScreen> {
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  final DriverAuthApi _driverAuthApi = DriverAuthApi();
  final DriverApi _driverApi = DriverApi();

  String? _driverReqId;
  bool _isLoading = false;
  bool _otpSent = false;
  List<RegisteredDriver> _availableDrivers = [];

  @override
  void initState() {
    super.initState();
    if (widget.initialPhone != null && widget.initialPhone!.isNotEmpty) {
      _mobileController.text = widget.initialPhone!;
    }
    _loadAvailableDrivers();
  }

  @override
  void dispose() {
    _mobileController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _loadAvailableDrivers() async {
    try {
      final list = await _driverApi.getDrivers();
      if (mounted) {
        setState(() {
          _availableDrivers = list;
        });
      }
    } catch (_) {}
  }

  String _cleanPhone(String input) {
    String formatted = input.trim().replaceAll(RegExp(r'[\s+]'), '');
    if (formatted.startsWith('91') && formatted.length > 10) {
      formatted = formatted.substring(2);
    }
    if (formatted.length > 10) {
      formatted = formatted.substring(formatted.length - 10);
    }
    return formatted;
  }

  Future<void> _sendOtp() async {
    final phone = _cleanPhone(_mobileController.text);
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit mobile number')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      // 1. Send live SMS via SendOTP SDK
      try {
        final sendOtpRes = await SendOtpService.sendOtp(phone);
        if (sendOtpRes.isSuccess && sendOtpRes.reqId != null) {
          _driverReqId = sendOtpRes.reqId;
          debugPrint('[DriverLoginScreen] SendOTP SMS dispatched: $_driverReqId');
        }
      } catch (sdkError) {
        debugPrint('[DriverLoginScreen] SendOTP SDK error: $sdkError');
      }

      // 2. Also register with backend
      try {
        await _driverAuthApi.sendOtp(phone);
      } catch (backendError) {
        debugPrint('[DriverLoginScreen] Backend sendOtp note: $backendError');
        if (_driverReqId == null) {
          rethrow;
        }
      }

      if (!mounted) return;
      setState(() {
        _otpSent = true;
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ShreeAnnaTheme.primaryGreen,
          content: Text('OTP sent to +91 $phone'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _verifyOtp() async {
    final phone = _cleanPhone(_mobileController.text);
    final otp = _otpController.text.trim();

    if (otp.isEmpty || otp.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the 6-digit OTP')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      Map<String, dynamic>? response;

      // 1. Verify via SendOTP SDK if reqId is present
      bool sendOtpVerified = false;
      if (_driverReqId != null && _driverReqId!.isNotEmpty) {
        try {
          final sdkVerifyRes = await SendOtpService.verifyOtp(
            reqId: _driverReqId!,
            otp: otp,
          );
          sendOtpVerified = sdkVerifyRes.isSuccess;
        } catch (_) {}
      }

      // 2. If SendOTP verified, exchange via directLogin
      if (sendOtpVerified) {
        try {
          response = await _driverAuthApi.directLogin(phone);
        } catch (_) {}
      }

      // 3. Fallback or standard verification with backend
      response ??= await _driverAuthApi.verifyOtp(phone, otp);

      await _onLoginSuccess(response, phone);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _directLogin(String phone) async {
    setState(() => _isLoading = true);
    try {
      final response = await _driverAuthApi.directLogin(phone);
      await _onLoginSuccess(response, phone);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _onLoginSuccess(Map<String, dynamic> response, String phone) async {
    final token = response['accessToken'] as String?;
    if (token != null && token.isNotEmpty) {
      await TokenStorage().saveAccessToken(token);
    }
    // Persist role so cold-start routing works correctly
    await TokenStorage().saveUserRole('driver');
    await TokenStorage().saveDriverPhone(phone);


    if (!mounted) return;
    setState(() => _isLoading = false);

    final driverName = response['memberName'] ?? 'Driver';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: ShreeAnnaTheme.primaryGreen,
        content: Text('Welcome back, $driverName! Logged in as Driver.'),
      ),
    );

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => DriverJourneyScreen(initialDriverPhone: phone),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: ShreeAnnaTheme.primaryGreen,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Segmented Role Switcher
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE0E5E0)),
                  boxShadow: const [
                    BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2)),
                  ],
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            color: Colors.transparent,
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.agriculture, size: 18, color: Color(0xFF6B7280)),
                              SizedBox(width: 6),
                              Text(
                                "I'm Farmer",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF4B5563),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          color: const Color(0xFF0F766E), // Teal/Logistics branding
                          boxShadow: const [
                            BoxShadow(color: Color(0x1F0F766E), blurRadius: 4, offset: Offset(0, 2)),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.local_shipping, size: 18, color: Colors.white),
                            SizedBox(width: 6),
                            Text(
                              "I'm Driver",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 30),

              // Logo & Badge
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F766E).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFF0F766E).withValues(alpha: 0.25),
                    width: 3,
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.local_shipping,
                    size: 38,
                    color: Color(0xFF0F766E),
                  ),
                ),
              ),

              const SizedBox(height: 18),

              const Text(
                'Driver Portal Login',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Enter your registered driver phone to manage logistics assignments & live GPS trip broadcasting.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
              ),

              const SizedBox(height: 28),

              // Mobile & OTP Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: const [
                    BoxShadow(color: Color(0x08000000), blurRadius: 8, offset: Offset(0, 3)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'REGISTERED DRIVER PHONE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(height: 8),

                    TextFormField(
                      controller: _mobileController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      enabled: !_otpSent,
                      decoration: InputDecoration(
                        counterText: '',
                        hintText: 'e.g. 9876543210',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                        prefixIcon: const Icon(Icons.phone_outlined, size: 20, color: Color(0xFF0F766E)),
                        prefixText: '+91  ',
                        prefixStyle: const TextStyle(
                          fontSize: 15,
                          color: Color(0xFF0F172A),
                          fontWeight: FontWeight.w600,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(6),
                          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(6),
                          borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5),
                        ),
                      ),
                    ),

                    if (_otpSent) ...[
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'ENTER 6-DIGIT OTP',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                              color: Color(0xFF334155),
                            ),
                          ),
                          TextButton(
                            onPressed: _sendOtp,
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'Resend',
                              style: TextStyle(fontSize: 12, color: Color(0xFF0F766E), fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        autofocus: true,
                        decoration: InputDecoration(
                          counterText: '',
                          hintText: 'Enter OTP (or 123456)',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                          prefixIcon: const Icon(Icons.lock_clock_outlined, size: 20, color: Color(0xFF0F766E)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5),
                          ),
                        ),
                      ),
                    ],

                    const SizedBox(height: 18),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : (_otpSent ? _verifyOtp : _sendOtp),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text(
                                _otpSent ? 'VERIFY OTP & SIGN IN' : 'SEND OTP',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),

                    if (_otpSent) ...[
                      const SizedBox(height: 10),
                      Center(
                        child: TextButton(
                          onPressed: () {
                            setState(() {
                              _otpSent = false;
                              _otpController.clear();
                            });
                          },
                          child: const Text(
                            'Change Mobile Number',
                            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Quick Registered Driver Tap Section
              if (!_otpSent && _availableDrivers.isNotEmpty) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.badge_outlined, size: 16, color: Color(0xFF0F766E)),
                          SizedBox(width: 6),
                          Text(
                            'QUICK LOGIN AS REGISTERED DRIVER',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ..._availableDrivers.map((drv) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: InkWell(
                            onTap: () {
                              _mobileController.text = drv.phone;
                              _directLogin(drv.phone);
                            },
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: const Color(0xFF0F766E).withValues(alpha: 0.15),
                                    child: const Icon(Icons.person, size: 16, color: Color(0xFF0F766E)),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          drv.name,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                        ),
                                        Text(
                                          '${drv.phone} • ${drv.vehicleNumber}',
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.arrow_forward_ios, size: 13, color: Color(0xFF94A3B8)),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
