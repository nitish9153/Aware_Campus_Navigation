import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_theme.dart';
import '../services/api_service.dart';

class AccessibilitySettingsScreen extends StatefulWidget {
  const AccessibilitySettingsScreen({super.key});

  @override
  State<AccessibilitySettingsScreen> createState() =>
      _AccessibilitySettingsScreenState();
}

class _AccessibilitySettingsScreenState
    extends State<AccessibilitySettingsScreen> {
  bool _stepFreeOnly = true;
  bool _preferRamps = true;
  bool _tactilePaving = false;
  bool _highContrast = false;
  String _language = 'en';

  final TextEditingController _apiUrlController = TextEditingController();
  bool _isCheckingBackend = false;
  bool? _backendConnected;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _stepFreeOnly = prefs.getBool('pref_step_free') ?? true;
      _preferRamps = prefs.getBool('pref_prefer_ramps') ?? true;
      _tactilePaving = prefs.getBool('pref_tactile_paving') ?? false;
      _highContrast = prefs.getBool('pref_high_contrast') ?? false;
      _language = prefs.getString('pref_language') ?? 'en';
      _apiUrlController.text = ApiService().baseUrl;
    });
    _checkServer();
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is String) {
      await prefs.setString(key, value);
    }
  }

  Future<void> _checkServer() async {
    setState(() {
      _isCheckingBackend = true;
    });
    final ok = await ApiService().checkBackendHealth();
    if (mounted) {
      setState(() {
        _isCheckingBackend = false;
        _backendConnected = ok;
      });
    }
  }

  Future<void> _applyNewApiUrl() async {
    final newUrl = _apiUrlController.text.trim();
    if (newUrl.isNotEmpty) {
      await ApiService().setBaseUrl(newUrl);
      _checkServer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('API Base URL updated: $newUrl')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Accessibility & Settings'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Mobility & Routing Preferences
          _sectionHeader('Mobility & Navigation Preferences'),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text(
                    'Step-Free Routes Only',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Eliminate stairs, ledges, and steep steps from recommended routes.',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _stepFreeOnly,
                  activeColor: AppTheme.accessibleGreen,
                  onChanged: (val) {
                    setState(() => _stepFreeOnly = val);
                    _savePreference('pref_step_free', val);
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text(
                    'Prioritize Wheelchair Ramps',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Highlight dedicated access ramps and gentle slopes.',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _preferRamps,
                  activeColor: AppTheme.accessibleGreen,
                  onChanged: (val) {
                    setState(() => _preferRamps = val);
                    _savePreference('pref_prefer_ramps', val);
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text(
                    'Tactile Paving Guidance',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Show paths equipped with blister and directional paving.',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _tactilePaving,
                  activeColor: AppTheme.mewarBlue,
                  onChanged: (val) {
                    setState(() => _tactilePaving = val);
                    _savePreference('pref_tactile_paving', val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Display & Language Preferences
          _sectionHeader('Display & Language'),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                ListTile(
                  title: const Text(
                    'Turn-by-Turn Guidance Language',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(_language == 'hi' ? 'हिंदी (Hindi)' : 'English'),
                  trailing: DropdownButton<String>(
                    value: _language,
                    underline: const SizedBox.shrink(),
                    items: const [
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'hi', child: Text('हिंदी')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _language = val);
                        _savePreference('pref_language', val);
                      }
                    },
                  ),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text(
                    'High Contrast Mode',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Enhance legibility for low-vision navigation.',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _highContrast,
                  activeColor: AppTheme.mewarBlue,
                  onChanged: (val) {
                    setState(() => _highContrast = val);
                    _savePreference('pref_high_contrast', val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Backend API Server Integration
          _sectionHeader('Backend Server Integration'),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _backendConnected == true
                              ? AppTheme.accessibleGreen
                              : (_backendConnected == false
                                  ? Colors.orange
                                  : Colors.grey),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _backendConnected == true
                            ? 'Backend Connected (FastAPI)'
                            : (_backendConnected == false
                                ? 'Offline Asset Fallback Active'
                                : 'Checking backend status...'),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: _backendConnected == true
                              ? AppTheme.accessibleGreen
                              : (_backendConnected == false
                                  ? Colors.orange.shade800
                                  : Colors.grey.shade700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'For Android Emulator, use http://10.0.2.2:8000 to connect to host PC. For a physical device on the same Wi-Fi, enter your PC LAN IP (e.g., http://192.168.1.X:8000). Bundled assets ensure full offline operation if server is unavailable.',
                    style: TextStyle(fontSize: 12, color: Colors.black54),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _apiUrlController,
                    decoration: InputDecoration(
                      labelText: 'API Base URL',
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.check_circle_outline),
                        onPressed: _applyNewApiUrl,
                        tooltip: 'Save URL',
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: _isCheckingBackend ? null : _checkServer,
                        icon: _isCheckingBackend
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Test Connection'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.mewarBlue,
                          foregroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      TextButton(
                        onPressed: () {
                          _apiUrlController.text = 'http://10.0.2.2:8000';
                          _applyNewApiUrl();
                        },
                        child: const Text('Reset Emulator Default'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
