import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../../core/theme/anchor_theme.dart';

class BreathingVectorWidget extends StatefulWidget {
  final double size;
  final bool isActive;

  const BreathingVectorWidget({
    Key? key,
    this.size = 220,
    required this.isActive,
  }) : super(key: key);

  @override
  State<BreathingVectorWidget> createState() => _BreathingVectorWidgetState();
}

class _BreathingVectorWidgetState extends State<BreathingVectorWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: BreathingPainter(
            scale: widget.isActive ? _animation.value : 1.0,
          ),
        );
      },
    );
  }
}

class BreathingPainter extends CustomPainter {
  final double scale;

  BreathingPainter({required this.scale});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;

    // Внешнее мягкое свечение
    final glowPaint = Paint()
      ..color = AnchorTheme.accentBlue.withOpacity(0.12)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 24);

    canvas.drawCircle(center, radius * 0.85 * scale, glowPaint);

    // Внутренний пульсирующий круг
    final circlePaint = Paint()
      ..color = AnchorTheme.accentBlue.withOpacity(0.15)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, radius * 0.75 * scale, circlePaint);

    // Векторное кольцо
    final ringPaint = Paint()
      ..color = AnchorTheme.accentBlue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    canvas.drawCircle(center, radius * 0.75 * scale, ringPaint);

    // Дополнительные точки / деления заземления
    final dotPaint = Paint()
      ..color = AnchorTheme.accentBlue.withOpacity(0.6)
      ..style = PaintingStyle.fill;

    const count = 12;
    for (int i = 0; i < count; i++) {
      final angle = (i * 2 * math.pi) / count;
      final dx = center.dx + (radius * 0.9 * scale) * math.cos(angle);
      final dy = center.dy + (radius * 0.9 * scale) * math.sin(angle);
      canvas.drawCircle(Offset(dx, dy), 3.0, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant BreathingPainter oldDelegate) {
    return oldDelegate.scale != scale;
  }
}
