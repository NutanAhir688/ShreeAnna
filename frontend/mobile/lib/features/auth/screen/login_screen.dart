import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../../core/services/send_otp_service.dart';
import 'driver_login_screen.dart';
import 'otp_screen.dart';
import '../services/farmer_auth_api.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _mobileController = TextEditingController();
  final FarmerAuthApi _farmerAuthApi = FarmerAuthApi();

  bool _isLoading = false;
  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final l10n = AppLocalizations.of(context)!;
    String mobileNumber = _mobileController.text.trim();
    // 1. Remove all spaces and the plus symbol first
    String formattedPhone = mobileNumber.replaceAll(RegExp(r'[\s+]'), '');

    // 2. If it starts with the 91 country code, strip only those first two characters
    if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
      formattedPhone = formattedPhone.substring(2);
    }
    // Ensure you only grab the last 10 digits if it's longer
    if (formattedPhone.length > 10) {
      formattedPhone = formattedPhone.substring(formattedPhone.length - 10);
    }
    mobileNumber = formattedPhone;

    if (mobileNumber.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            l10n.invalidMobileNumber,
          ),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      String? reqId;
      // 1. Send live SMS via SendOTP Flutter SDK
      try {
        final sendOtpRes = await SendOtpService.sendOtp(mobileNumber);
        if (sendOtpRes.isSuccess && sendOtpRes.reqId != null) {
          reqId = sendOtpRes.reqId;
          debugPrint('[LoginScreen] SendOTP SMS dispatched with reqId: $reqId');
        }
      } catch (sdkError) {
        debugPrint('[LoginScreen] SendOTP SDK error: $sdkError');
      }

      // 2. Also register with backend
      try {
        await _farmerAuthApi.sendOtp(mobileNumber);
      } catch (backendError) {
        debugPrint('[LoginScreen] Backend sendOtp note: $backendError');
        if (reqId == null) {
          rethrow;
        }
      }

      if (!mounted) return;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => OtpScreen(
            mobileNumber: mobileNumber,
            reqId: reqId,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
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
              const SizedBox(height: 18),

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
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          color: ShreeAnnaTheme.primaryGreen,
                          boxShadow: [
                            BoxShadow(
                              color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.25),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.agriculture, size: 18, color: Colors.white),
                            SizedBox(width: 6),
                            Text(
                              "I'm Farmer",
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
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const DriverLoginScreen()),
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
                              Icon(Icons.local_shipping, size: 18, color: Color(0xFF6B7280)),
                              SizedBox(width: 6),
                              Text(
                                "I'm Driver",
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
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // --------------------------------------------------
              // LOGO
              // --------------------------------------------------
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.20),
                    width: 4,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(80),
                  child: SvgPicture.asset(
                    'assets/images/logo.svg',
                    fit: BoxFit.cover,
                  ),
                ),
              ),

              const SizedBox(height: 34),

              // --------------------------------------------------
              // TITLE
              // --------------------------------------------------
              Text(
                l10n.welcomeBack,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 27,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 8),

              Text(
                l10n.enterMobileSubtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Color(0xFF596159)),
              ),

              const SizedBox(height: 34),

              // --------------------------------------------------
              // MOBILE NUMBER CARD
              // --------------------------------------------------
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.background,
                  border: Border.all(color: const Color(0xFFD5DED0)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.mobileNumber,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF303530),
                      ),
                    ),

                    const SizedBox(height: 9),

                    // ------------------------------------------------
                    // MOBILE INPUT
                    // ------------------------------------------------
                    TextFormField(
                      controller: _mobileController,
                      keyboardType: TextInputType.number,
                      maxLength: 10,

                      decoration: InputDecoration(
                        counterText: '',

                        hintText: l10n.enterMobileNumberHint,

                        hintStyle: const TextStyle(
                          color: Color(0xFF9A9F9A),
                          fontSize: 14,
                        ),

                        prefixIcon: const Icon(
                          Icons.phone_outlined,
                          size: 20,
                          color: Color(0xFF596159),
                        ),

                        prefixText: '+91  ',

                        prefixStyle: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF303530),
                          fontWeight: FontWeight.w500,
                        ),

                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 14,
                        ),

                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(2),
                          borderSide: const BorderSide(
                            color: Color(0xFF7E877E),
                          ),
                        ),

                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(2),
                          borderSide: const BorderSide(
                            color: Color(0xFF7E877E),
                          ),
                        ),

                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(2),
                          borderSide: const BorderSide(
                            color: ShreeAnnaTheme.primaryGreen,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // ------------------------------------------------
                    // SEND OTP BUTTON
                    // ------------------------------------------------
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _sendOtp,

                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,

                          foregroundColor: Colors.white,

                          elevation: 1,

                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),

                        child: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                l10n.sendOtp,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 56),

              // --------------------------------------------------
              // REGISTRATION MESSAGE
              // --------------------------------------------------
              Text(
                l10n.dontHaveAccount,
                style: const TextStyle(fontSize: 14, color: Color(0xFF666D66)),
              ),

              const SizedBox(height: 7),

              TextButton(
                onPressed: () {
                  // TODO: Registration navigation will be added later.
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  l10n.askFpoToRegister,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
