import 'package:flutter/material.dart';

import '../features/auth/screen/welcome_screen.dart';
import 'theme.dart';

class ShreeAnnaApp extends StatelessWidget {
  const ShreeAnnaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ShreeAnna',
      debugShowCheckedModeBanner: false,
      theme: ShreeAnnaTheme.light,
      home: const WelcomeScreen(),
    );
  }
}
