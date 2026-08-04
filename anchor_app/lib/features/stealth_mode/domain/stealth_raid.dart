enum RaidStatus {
  idle,
  inRaid,
  completed,
  failed,
}

class StealthRaid {
  final int durationMinutes;
  final int remainingSeconds;
  final int checkInsCount;
  final int xpEarned;
  final RaidStatus status;

  const StealthRaid({
    required this.durationMinutes,
    required this.remainingSeconds,
    required this.checkInsCount,
    required this.xpEarned,
    required this.status,
  });

  factory StealthRaid.initial(int minutes) {
    return StealthRaid(
      durationMinutes: minutes,
      remainingSeconds: minutes * 60,
      checkInsCount: 0,
      xpEarned: 0,
      status: RaidStatus.idle,
    );
  }

  // Расчет XP по формуле: (durationMinutes * 10) + (checkInsCount * 5)
  int calculateCurrentXp() {
    return (durationMinutes * 10) + (checkInsCount * 5);
  }

  StealthRaid copyWith({
    int? durationMinutes,
    int? remainingSeconds,
    int? checkInsCount,
    int? xpEarned,
    RaidStatus? status,
  }) {
    return StealthRaid(
      durationMinutes: durationMinutes ?? this.durationMinutes,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      checkInsCount: checkInsCount ?? this.checkInsCount,
      xpEarned: xpEarned ?? this.xpEarned,
      status: status ?? this.status,
    );
  }
}
