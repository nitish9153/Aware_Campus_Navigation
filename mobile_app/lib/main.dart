import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'constants/app_constants.dart';
import 'constants/app_theme.dart';
import 'screens/about_screen.dart';
import 'screens/accessibility_settings_screen.dart';
import 'screens/campus_map_screen.dart';
import 'screens/home_screen.dart';
import 'screens/hostel_navigator_screen.dart';
import 'screens/search_screen.dart';
import 'screens/splash_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations & status bar overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize central API service
  await ApiService().initialize();

  runApp(const AwareCampusApp());
}

class AwareCampusApp extends StatelessWidget {
  const AwareCampusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
      routes: {
        '/home': (_) => const HomeScreen(),
        '/map': (_) => const CampusMapScreen(),
        '/hostel': (_) => const HostelNavigatorScreen(),
        '/search': (_) => const SearchScreen(),
        '/settings': (_) => const AccessibilitySettingsScreen(),
        '/about': (_) => const AboutScreen(),
      },
    );
  }
}
