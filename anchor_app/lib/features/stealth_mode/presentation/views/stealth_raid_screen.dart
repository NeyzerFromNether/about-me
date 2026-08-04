import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/anchor_theme.dart';
import '../../../../core/widgets/anchor_button.dart';
import '../../../../core/widgets/anchor_card.dart';
import '../../domain/stealth_raid.dart';
import '../controllers/stealth_controller.dart';
import 'breathing_vector_widget.dart';

class StealthRaidScreen extends StatelessWidget {
  const StealthRaidScreen({Key? key}) : super(key: key);

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String _getStatusText(RaidStatus status) {
    switch (status) {
      case RaidStatus.idle:
        return 'Штиль (Ожидание)';
      case RaidStatus.inRaid:
        return 'Выдержка (В рейде)';
      case RaidStatus.completed:
        return 'Рейд успешно завершен';
      case RaidStatus.failed:
        return 'Пауза прервана';
    }
  }

  Color _getStatusColor(RaidStatus status) {
    switch (status) {
      case RaidStatus.idle:
        return AnchorTheme.mutedText;
      case RaidStatus.inRaid:
        return AnchorTheme.accentBlue;
      case RaidStatus.completed:
        return AnchorTheme.successGreen;
      case RaidStatus.failed:
        return AnchorTheme.alertRed;
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<StealthController>();
    final raid = controller.raid;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Anchor / Stealth Mode'),
        backgroundColor: AnchorTheme.pureWhite,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: AnchorTheme.deepSlateText,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AnchorTheme.softSlate,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '⚡ ${controller.totalXpBalance} XP',
                  style: const TextStyle(
                    color: AnchorTheme.deepSlateText,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Информационная панель (Статус и Таймер)
              AnchorCard(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'СТАТУС',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AnchorTheme.mutedText,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getStatusText(raid.status),
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: _getStatusColor(raid.status),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      _formatTime(raid.remainingSeconds),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AnchorTheme.deepSlateText,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),

              // Центр экрана: Векторный анимированный узел дыхания
              BreathingVectorWidget(
                size: 240,
                isActive: raid.status == RaidStatus.inRaid,
              ),

              const SizedBox(height: 24),
              Text(
                raid.status == RaidStatus.inRaid
                    ? 'Сделай вдох. Рука не тянется к чату.'
                    : 'Выбери длительность рейда выдержки',
                style: const TextStyle(
                  fontSize: 16,
                  color: AnchorTheme.mutedText,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),

              // Выбор длительности, если idle или completed/failed
              if (raid.status == RaidStatus.idle ||
                  raid.status == RaidStatus.completed ||
                  raid.status == RaidStatus.failed) ...[
                Row(
                  children: [
                    Expanded(
                      child: AnchorButton(
                        text: '15 минут',
                        isPrimary: false,
                        onPressed: () => controller.startRaid(15),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnchorButton(
                        text: '30 минут',
                        isPrimary: false,
                        onPressed: () => controller.startRaid(30),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnchorButton(
                        text: '60 минут',
                        isPrimary: false,
                        onPressed: () => controller.startRaid(60),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],

              // Нижняя панель для активного рейда
              if (raid.status == RaidStatus.inRaid) ...[
                AnchorButton(
                  text: 'Я держусь (Check-In) +XP',
                  icon: Icons.shield_outlined,
                  isPrimary: true,
                  onPressed: () => controller.recordCheckIn(),
                ),
                const SizedBox(height: 12),
                AnchorButton(
                  text: 'Сдаться',
                  isPrimary: false,
                  isDestructive: true,
                  onPressed: () => controller.failRaid(),
                ),
              ] else if (raid.status == RaidStatus.completed ||
                  raid.status == RaidStatus.failed) ...[
                AnchorButton(
                  text: 'Новый рейд',
                  isPrimary: true,
                  onPressed: () => controller.resetRaid(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
