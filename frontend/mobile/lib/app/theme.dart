import 'package:flutter/material.dart';

class ShreeAnnaTheme {
  static const Color primaryGreen = Color(0xFF08752A);
  static const Color background = Color(0xFFF7FBF0);

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        brightness: Brightness.light,
      ),
      fontFamily: 'Roboto',
    );
  }
}