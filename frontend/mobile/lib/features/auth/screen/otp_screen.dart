import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../home/screens/home_screen.dart';
import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../services/farmer_auth_api.dart';
import '../../../core/storage/token_storage.dart';

class OtpScreen extends StatefulWidget {
  final String mobileNumber;

  const OtpScreen({super.key, required this.mobileNumber});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );

  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  final FarmerAuthApi _farmerAuthApi = FarmerAuthApi();

  bool _isVerifying = false;

  Timer? _timer;

  int _secondsRemaining = 20;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();

    for (final controller in _controllers) {
      controller.dispose();
    }

    for (final node in _focusNodes) {
      node.dispose();
    }

    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();

    setState(() {
      _secondsRemaining = 20;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining == 0) {
        timer.cancel();
        return;
      }

      setState(() {
        _secondsRemaining--;
      });
    });
  }

  // ----------------------------------------------------------------
  // OTP INPUT LOGIC (typing + paste)
  // ----------------------------------------------------------------

  void _onOtpChanged(String value, int index) {
    // If more than one digit lands here in a single change, it's a paste
    // (or autofill) event — distribute it across all six boxes instead
    // of letting it get truncated into just this one.
    if (value.length > 1) {
      _distributePastedOtp(value, index);
      return;
    }

    if (value.isNotEmpty && index < _focusNodes.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }

    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  void _distributePastedOtp(String pasted, int startIndex) {
    var digits = pasted.replaceAll(RegExp(r'\D'), '');

    if (digits.isEmpty) {
      _controllers[startIndex].clear();
      return;
    }

    if (digits.length > _controllers.length) {
      digits = digits.substring(0, _controllers.length);
    }

    // If the pasted string is a full code, always fill from the first box,
    // even if the paste happened in a middle box. Otherwise fill starting
    // from wherever the paste occurred.
    final firstBox = digits.length >= _controllers.length ? 0 : startIndex;

    setState(() {
      for (var i = 0; i < _controllers.length; i++) {
        final digitIndex = i - firstBox;
        if (digitIndex >= 0 && digitIndex < digits.length) {
          _controllers[i].text = digits[digitIndex];
        }
      }
    });

    final lastFilled = (firstBox + digits.length - 1).clamp(
      0,
      _controllers.length - 1,
    );
    final nextIndex = (lastFilled + 1).clamp(0, _controllers.length - 1);
    _focusNodes[nextIndex].requestFocus();

    // Auto-submit once all six boxes are filled from a paste.
    if (_otp.length == _controllers.length) {
      _verifyOtp();
    }
  }

  String get _otp {
    return _controllers.map((controller) => controller.text).join();
  }

  Future<void> _verifyOtp() async {
    final l10n = AppLocalizations.of(context)!;
    if (_otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.pleaseEnterCompleteOtp)),
      );

      return;
    }

    if (_isVerifying) {
      return;
    }

    setState(() {
      _isVerifying = true;
    });

    try {
      final response = await _farmerAuthApi.verifyOtp(
        widget.mobileNumber,
        _otp,
      );

      debugPrint('Login response: $response');

      final accessToken = response['accessToken'];

      if (accessToken == null ||
          accessToken is! String ||
          accessToken.isEmpty) {
        throw Exception('Login token was not received.');
      }

      final tokenStorage = TokenStorage();

      await tokenStorage.saveAccessToken(accessToken);
      await tokenStorage.saveUserRole('farmer'); // persist role for cold-start routing
      final check = await tokenStorage.getAccessToken();

      debugPrint(
        'Token round-trip check: ${check != null ? "SUCCESS" : "FAILED"}',
      );

      if (check == null) {
        throw Exception('Token was not saved to secure storage.');
      }
      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l10n.loginSuccessful)));

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isVerifying = false;
        });
      }
    }
  }

  void _resendOtp() {
    if (_secondsRemaining != 0) {
      return;
    }

    final l10n = AppLocalizations.of(context)!;
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();

    _startTimer();

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(l10n.otpSentAgain)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      // ----------------------------------------------------------
      // HEADER
      // ----------------------------------------------------------
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,

        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
          onPressed: () {
            Navigator.pop(context);
          },
        ),

        title: Text(
          l10n.appName,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: ShreeAnnaTheme.primaryGreen,
          ),
        ),
      ),

      // ----------------------------------------------------------
      // BODY
      // ----------------------------------------------------------
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            children: [
              const SizedBox(height: 45),

              // --------------------------------------------------
              // LOCK ICON
              // --------------------------------------------------
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.lock_outline,
                  color: Colors.white,
                  size: 34,
                ),
              ),

              const SizedBox(height: 30),

              // --------------------------------------------------
              // TITLE
              // --------------------------------------------------
              Text(
                l10n.enterOtp,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 8),

              Text(
                l10n.otpSentTo(widget.mobileNumber),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF596159),
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 34),

              // --------------------------------------------------
              // OTP BOXES
              // --------------------------------------------------
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) => _buildOtpBox(index)),
              ),

              const SizedBox(height: 22),

              // --------------------------------------------------
              // VERIFY BUTTON
              // --------------------------------------------------
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isVerifying ? null : _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 1,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  child: _isVerifying
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          l10n.verifyOtp,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 10),

              // --------------------------------------------------
              // RESEND BUTTON
              // --------------------------------------------------
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton(
                  onPressed: _secondsRemaining == 0 ? _resendOtp : null,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ShreeAnnaTheme.primaryGreen,
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  child: Text(
                    l10n.resendOtp,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // --------------------------------------------------
              // COUNTDOWN
              // --------------------------------------------------
              Text(
                '${l10n.didNotReceiveOtp} 00:${_secondsRemaining.toString().padLeft(2, '0')}',
                style: const TextStyle(fontSize: 11, color: Color(0xFF666D66)),
              ),

              const SizedBox(height: 35),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpBox(int index) {
    return SizedBox(
      width: 48,
      height: 56,
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        textAlignVertical: TextAlignVertical.center,
        // NOTE: no maxLength here. Setting maxLength: 1 is what caused the
        // original bug — Flutter truncates pasted text to 1 char before
        // onChanged fires, so paste can never fill more than one box.
        // Digits are restricted via the formatter below instead, and length
        // is handled manually in _onOtpChanged / _distributePastedOtp.
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Color(0xFF202420),
        ),
        decoration: InputDecoration(
          counterText: '',
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.zero,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFDDE1DD)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFDDE1DD)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(
              color: ShreeAnnaTheme.primaryGreen,
              width: 1.5,
            ),
          ),
        ),
        onChanged: (value) => _onOtpChanged(value, index),
      ),
    );
  }
}
