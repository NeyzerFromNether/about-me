import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../domain/stealth_raid.dart';
import '../../data/stealth_repository.dart';

class StealthController extends ChangeNotifier {
  final StealthRepository _repository;

  StealthRaid _raid = StealthRaid.initial(15); // default 15 mins
  Timer? _timer;
  int _totalXpBalance = 0;

  StealthRaid get raid => _raid;
  int get totalXpBalance => _totalXpBalance;

  StealthController({StealthRepository? repository})
      : _repository = repository ?? StealthRepository() {
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    _totalXpBalance = await _repository.getTotalXp();
    notifyListeners();
  }

  void startRaid(int minutes) {
    _timer?.cancel();
    _raid = StealthRaid(
      durationMinutes: minutes,
      remainingSeconds: minutes * 60,
      checkInsCount: 0,
      xpEarned: 0,
      status: RaidStatus.inRaid,
    );
    notifyListeners();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_raid.remainingSeconds > 0) {
        _raid = _raid.copyWith(remainingSeconds: _raid.remainingSeconds - 1);
        notifyListeners();
      } else {
        completeRaid();
      }
    });
  }

  void recordCheckIn() {
    if (_raid.status != RaidStatus.inRaid) return;

    final newCheckIns = _raid.checkInsCount + 1;
    final earned = (_raid.durationMinutes * 10) + (newCheckIns * 5);

    _raid = _raid.copyWith(
      checkInsCount: newCheckIns,
      xpEarned: earned,
    );
    notifyListeners();
  }

  Future<void> completeRaid() async {
    _timer?.cancel();
    final earned = _raid.calculateCurrentXp();

    _raid = _raid.copyWith(
      status: RaidStatus.completed,
      xpEarned: earned,
    );

    _totalXpBalance = await _repository.addXp(earned);
    await _repository.incrementCompletedRaids();
    await _repository.saveSessionRecord('Completed raid: ${_raid.durationMinutes}m, check-ins: ${_raid.checkInsCount}, XP: $earned');
    notifyListeners();
  }

  Future<void> failRaid() async {
    _timer?.cancel();
    _raid = _raid.copyWith(
      status: RaidStatus.failed,
    );
    await _repository.saveSessionRecord('Failed raid after ${_raid.durationMinutes}m');
    notifyListeners();
  }

  void resetRaid() {
    _timer?.cancel();
    _raid = StealthRaid.initial(15);
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
