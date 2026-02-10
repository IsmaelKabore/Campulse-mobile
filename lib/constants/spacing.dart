import 'package:flutter/material.dart';

/// Spacing system matching web app design
class AppSpacing {
  // Base spacing unit (4px)
  static const double unit = 4.0;
  
  // Standard spacing values
  static const double xs = unit * 1;   // 4px
  static const double sm = unit * 2;   // 8px
  static const double md = unit * 3;   // 12px
  static const double lg = unit * 4;   // 16px
  static const double xl = unit * 6;    // 24px
  static const double xxl = unit * 8;   // 32px
  static const double xxxl = unit * 12; // 48px
  
  // Common EdgeInsets
  static const EdgeInsets screenPadding = EdgeInsets.all(lg);
  static const EdgeInsets cardPadding = EdgeInsets.all(lg);
  static const EdgeInsets sectionSpacing = EdgeInsets.symmetric(vertical: xl);
  
  // Gaps
  static const SizedBox gapXS = SizedBox(width: xs, height: xs);
  static const SizedBox gapSM = SizedBox(width: sm, height: sm);
  static const SizedBox gapMD = SizedBox(width: md, height: md);
  static const SizedBox gapLG = SizedBox(width: lg, height: lg);
  static const SizedBox gapXL = SizedBox(width: xl, height: xl);
  static const SizedBox gapXXL = SizedBox(width: xxl, height: xxl);
}

/// Border radius values
class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  
  static const BorderRadius card = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius button = BorderRadius.all(Radius.circular(md));
}

