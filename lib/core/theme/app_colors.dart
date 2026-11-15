import 'package:flutter/material.dart';

class AppColors {
  // Brand & Indigo Accents
  static const Color primary = Color(0xFF4F46E5);      // Indigo 600
  static const Color primaryLight = Color(0xFF6366F1); // Indigo 500
  static const Color primaryDark = Color(0xFF4338CA);  // Indigo 700
  static const Color secondary = Color(0xFF0EA5E9);    // Sky 500

  // Light Mode Surfaces & Text
  static const Color lightBg = Color(0xFFF8FAFC);         // Slate 50
  static const Color lightSurface = Color(0xFFFFFFFF);    // Pure White
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE2E8F0);      // Slate 200
  static const Color lightTextPrimary = Color(0xFF0F172A); // Slate 900
  static const Color lightTextSecondary = Color(0xFF64748B); // Slate 500
  static const Color lightTextMuted = Color(0xFF94A3B8);     // Slate 400

  // Dark Mode Surfaces & Text
  static const Color darkBg = Color(0xFF0F172A);          // Slate 900
  static const Color darkSurface = Color(0xFF1E293B);     // Slate 800
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);       // Slate 700
  static const Color darkTextPrimary = Color(0xFFF8FAFC);  // Slate 50
  static const Color darkTextSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color darkTextMuted = Color(0xFF64748B);     // Slate 500

  // Priority Colors
  static const Color priorityHigh = Color(0xFFEF4444);    // Red 500
  static const Color priorityMedium = Color(0xFFF59E0B);  // Amber 500
  static const Color priorityLow = Color(0xFF10B981);     // Emerald 500
  static const Color priorityUrgent = Color(0xFFDC2626);  // Red 600

  // Functional & Semantic
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  static Color getPriorityColor(String? priority) {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        return priorityHigh;
      case 'MEDIUM':
        return priorityMedium;
      case 'LOW':
        return priorityLow;
      default:
        return priorityMedium;
    }
  }

  static Color parseHex(String? hexString, {Color fallback = const Color(0xFF6366F1)}) {
    if (hexString == null || hexString.isEmpty) return fallback;
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    try {
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return fallback;
    }
  }
}
