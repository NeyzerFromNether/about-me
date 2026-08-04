import 'package:shared_preferences/shared_preferences.dart';

class StealthRepository {
  static const String _keyTotalXp = 'anchor_total_xp';
  static const String _keyCompletedRaids = 'anchor_completed_raids';
  static const String _keyHistory = 'anchor_raid_history';

  Future<int> getTotalXp() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyTotalXp) ?? 0;
  }

  Future<void> saveTotalXp(int xp) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyTotalXp, xp);
  }

  Future<int> addXp(int amount) async {
    final current = await getTotalXp();
    final updated = current + amount;
    await saveTotalXp(updated);
    return updated;
  }

  Future<int> getCompletedRaidsCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyCompletedRaids) ?? 0;
  }

  Future<void> incrementCompletedRaids() async {
    final prefs = await SharedPreferences.getInstance();
    final count = await getCompletedRaidsCount();
    await prefs.setInt(_keyCompletedRaids, count + 1);
  }

  Future<void> saveSessionRecord(String summary) async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_keyHistory) ?? [];
    history.add('${DateTime.now().toIso8601String()}: $summary');
    await prefs.setStringList(_keyHistory, history);
  }

  Future<List<String>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keyHistory) ?? [];
  }
}
