import 'package:flutter/material.dart';
import '../theme/anchor_theme.dart';

class AnchorButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isPrimary;
  final bool isDestructive;
  final IconData? icon;

  const AnchorButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isPrimary = true,
    this.isDestructive = false,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    BorderSide? borderSide;

    if (isDestructive) {
      backgroundColor = Colors.transparent;
      textColor = AnchorTheme.mutedText;
      borderSide = BorderSide.none;
    } else if (isPrimary) {
      backgroundColor = AnchorTheme.accentBlue;
      textColor = Colors.white;
      borderSide = BorderSide.none;
    } else {
      backgroundColor = AnchorTheme.softSlate;
      textColor = AnchorTheme.deepSlateText;
      borderSide = BorderSide(color: AnchorTheme.borderLight, width: 1);
    }

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          elevation: isPrimary ? 4 : 0,
          shadowColor: isPrimary ? AnchorTheme.accentBlue.withOpacity(0.3) : Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: borderSide,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 20, color: textColor),
              const SizedBox(width: 8),
            ],
            Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
