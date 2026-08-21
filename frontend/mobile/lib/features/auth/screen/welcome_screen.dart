import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../app/theme.dart';
import 'login_screen.dart';
import 'registration_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 26),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [

                
                // Logo
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

                  //   child: const Icon(
                  //     Icons.agriculture,
                  //     size: 48,
                  //     color: ShreeAnnaTheme.primaryGreen,
                  //   ),
                ),

                const SizedBox(height: 28),

                // Application name
                const Text(
                  'ShreeAnna',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF202420),
                  ),
                ),

                const SizedBox(height: 8),

                // Subtitle
                const Text(
                  'Welcome, Farmer Friend',
                  style: TextStyle(fontSize: 15, color: Color(0xFF465046)),
                ),

                const SizedBox(height: 28),

                // Login button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      // Login navigation will be added later.
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // Registration button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: () {
                      // Registration navigation will be added later.
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const RegistrationScreen(),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: ShreeAnnaTheme.primaryGreen,
                      side: const BorderSide(
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    child: const Text(
                      'New Registration',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
