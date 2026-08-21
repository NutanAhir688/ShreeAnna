import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../app/theme.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _mobileController = TextEditingController();

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  void _sendOtp() {
    final mobileNumber = _mobileController.text.trim();

    if (mobileNumber.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid 10-digit mobile number'),
        ),
      );
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => OtpScreen(mobileNumber: mobileNumber)),
    );
    // ScaffoldMessenger.of(context)
    //     .showSnackBar(const SnackBar(content: Text('Mobile number accepted')));
  }

  @override
  Widget build(BuildContext context) {
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

        title: const Text(
          'ShreeAnna',
          style: TextStyle(
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
              // LOGO
              // --------------------------------------------------
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: ShreeAnnaTheme.primaryGreen.withValues(
                        alpha: 0.20),
                        width: 4,
                    ),
                  ),
                  child: ClipRRect(borderRadius: BorderRadius.circular(80),
                  child: SvgPicture.asset(
                    'assets/images/logo.svg',
                    fit: BoxFit.cover,
                  ),
                  )
                ),

              const SizedBox(height: 34),

              // --------------------------------------------------
              // TITLE
              // --------------------------------------------------
              const Text(
                'Welcome Back',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 27,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 8),

              const Text(
                'Enter your mobile number to continue.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Color(0xFF596159)),
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
                    const Text(
                      'Mobile Number',
                      style: TextStyle(
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

                        hintText: 'Enter your 10 digit number',

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

                        child: const Text(
                          'Send OTP',
                          style: TextStyle(
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
              const Text(
                "Don't have an account?",
                style: TextStyle(fontSize: 14, color: Color(0xFF666D66)),
              ),

              const SizedBox(height: 7),

              TextButton(
                onPressed: () {
                  // Registration navigation will be added later.
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  'Ask your FPO to register you.',
                  style: TextStyle(
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
