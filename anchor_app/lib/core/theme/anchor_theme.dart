import 'package:flutter/material.dart';

class AnchorTheme {
  // Цветовая палитра Clean Light Minimalism
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color calmSurface = Color(0xFFF8FAFC);
  static const Color softSlate = Color(0xFFF1F5F9);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color accentBlueHover = Color(0xFF2563EB);
  static const Color deepSlateText = Color(0xFF1E293B);
  static const Color mutedText = Color(0xFF64748B);
  static const Color borderLight = Color(0xFFE2E8F0);
  
  // Статусные цвета
  static const Color successGreen = Color(0xFF10B981);
  static const Color alertRed = Color(0xFFEF4444);

  // Мягкие тени
  static List<BoxShadow> get softShadow => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.06),
          blurRadius: 24,
          spreadRadius: 0,
          offset: const Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.04),
          blurRadius: 16,
          spreadRadius: 0,
          offset: const Offset(0, 4),
        ),
      ];

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: pureWhite,
      colorScheme: ColorScheme.fromSeed(
        seedColor: accentBlue,
        brightness: Brightness.light,
        background: pureWhite,
        surface: calmSurface,
        primary: accentBlue,
        onPrimary: pureWhite,
        onSurface: deepSlateText,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: deepSlateText,
          letterSpacing: -0.5,
        ),
        headlineMedium: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: deepSlateText,
          letterSpacing: -0.3,
        ),
        titleLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: deepSlateText,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: deepSlateText,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: mutedText,
        ),
      ),
    );
  }
}
