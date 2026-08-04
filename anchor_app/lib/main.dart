import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/anchor_theme.dart';
import 'features/stealth_mode/presentation/controllers/stealth_controller.dart';
import 'features/stealth_mode/presentation/views/stealth_raid_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AnchorApp());
}

class AnchorApp extends StatelessWidget {
  const AnchorApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => StealthController()),
      ],
      child: MaterialApp(
        title: 'Anchor — Эмоциональный щит',
        debugShowCheckedModeBanner: false,
        theme: AnchorTheme.lightTheme,
        home: const StealthRaidScreen(),
      ),
    );
  }
}
