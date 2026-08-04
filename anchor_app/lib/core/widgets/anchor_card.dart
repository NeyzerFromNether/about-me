import 'package:flutter/material.dart';
import '../theme/anchor_theme.dart';

class AnchorCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  const AnchorCard({
    Key? key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AnchorTheme.calmSurface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AnchorTheme.borderLight, width: 1),
        boxShadow: AnchorTheme.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: padding,
            child: child,
          ),
        ),
      ),
    );
  }
}
