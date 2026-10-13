import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_constants.dart';
import '../constants/app_theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Future<void> _openExternal(String urlString) async {
    final uri = Uri.parse(urlString);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About & Helpline'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header Card
          Center(
            child: Column(
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.mewarBlue, Color(0xFF38BDF8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.navigation_rounded,
                    size: 40,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  AppConstants.appName,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Mewar University, Gangrar, Chittorgarh',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Version 1.0.0 (Android Build)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.mewarBlue,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Overview Section
          const Text(
            'Campus Overview',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Aware Campus Navigation provides full outdoor campus mapping and indoor guidance for Mewar University. Outdoor maps use verified OpenStreetMap data without requiring proprietary API keys, while indoor navigation assists students and visitors with step-free route calculations for Maharana Kumbha Hostel (Rooms 1–16) and key facilities.',
            style: TextStyle(
              fontSize: 13,
              height: 1.5,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 20),

          // Verified Coordinates Card
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.pin_drop_rounded,
                          color: AppTheme.mewarBlue, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Verified Campus Location',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'NH-79 Gangrar, Chittorgarh, Rajasthan 312901\nLatitude: 25.031338° N\nLongitude: 74.636520° E',
                    style: TextStyle(fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => _openExternal(
                      'https://www.google.com/maps/search/?api=1&query=25.031338,74.636520',
                    ),
                    icon: const Icon(Icons.map_rounded, size: 16),
                    label: const Text('Open in Google Maps'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Emergency & Campus Helplines
          const Text(
            'Helpline & Support',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Column(
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEFF6FF),
                    child: Icon(Icons.phone_rounded,
                        color: AppTheme.mewarBlue, size: 20),
                  ),
                  title: const Text('University Helpline'),
                  subtitle: const Text('+91 1471 220881 / 220882'),
                  onTap: () => _openExternal('tel:+911471220881'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEFF6FF),
                    child: Icon(Icons.email_rounded,
                        color: AppTheme.mewarBlue, size: 20),
                  ),
                  title: const Text('Email Inquiries'),
                  subtitle: const Text('info@mewaruniversity.org'),
                  onTap: () => _openExternal('mailto:info@mewaruniversity.org'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEFF6FF),
                    child: Icon(Icons.language_rounded,
                        color: AppTheme.mewarBlue, size: 20),
                  ),
                  title: const Text('Official Website'),
                  subtitle: const Text('www.mewaruniversity.org'),
                  onTap: () =>
                      _openExternal('https://www.mewaruniversity.org'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Architectural Floor Plan Disclaimer (Requirement 9)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.warning_amber_rounded,
                    size: 20, color: Colors.amber.shade800),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    AppConstants.floorPlanDisclaimer,
                    style: TextStyle(
                      fontSize: 12,
                      height: 1.4,
                      color: Colors.amber.shade900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
