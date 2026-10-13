# Aware Campus Navigation — Flutter Mobile Application

An accessibility-first cross-platform mobile application (Android & iOS) for **Mewar University, Gangrar, Chittorgarh, Rajasthan** and **Maharana Kumbha Hostel (Ground Floor Rooms 1–16)**.

---

## 🌟 Key Features

1. **Outdoor Campus Navigation (Zero API Keys Required)**:
   - Real, interactive full-screen map using **OpenStreetMap** tiles via `flutter_map`.
   - Verified coordinates: `25.031338° N, 74.636520° E`.
   - University landmarks, main academic blocks, hostel pavilions, sports grounds, and gate entrances.
   - Direct integration to "Open in Google Maps" without requiring proprietary API tokens.

2. **Kumbha Hostel Indoor Navigator**:
   - High-fidelity architectural floor plan (`assets/images/kumbah-ground-floor.png`).
   - Ground-floor Rooms **1 to 16**, Entrance Foyer, West Washroom, and East Washroom.
   - Interactive room selection with the established **green selection highlight**.
   - Step-free Dijkstra routing algorithm showing glowing navigation path polyline.
   - Dual-language turn-by-turn guidance (**English and Hindi**).
   - Architectural layout disclaimer (Calibrated indoor schematic).

3. **Backend & Offline-First Resilience**:
   - Integrated with the existing FastAPI backend (`/api/mewar/locations`, `/api/mewar/indoor`).
   - Android Emulator configured to host machine address `http://10.0.2.2:8000`.
   - Automatic graceful fallback to bundled offline JSON assets (`assets/data/mewar_locations.json` and `assets/data/mewar_indoor.json`) so the application never crashes if the network or backend is unreachable.

4. **Modern Material 3 UI**:
   - Splash Screen with Mewar University branding.
   - Home Dashboard with quick room jumpers and navigation module cards.
   - Universal search across campus buildings and indoor rooms.
   - Accessibility settings: step-free routes, ramp priority, tactile paving alerts, and backend configuration.
   - About screen with official helplines, coordinates, and university details.

---

## 📁 Project Architecture

```
mobile_app/
├── android/                         # Android native project & Gradle config
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # Cleartext HTTP (for local dev) & Permissions
│   │   │   └── kotlin/com/aware/campusnavigation/MainActivity.kt
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── assets/
│   ├── data/
│   │   ├── mewar_indoor.json        # Ground floor room & corridor topology
│   │   └── mewar_locations.json     # Campus outdoor GPS landmark markers
│   └── images/
│       └── kumbah-ground-floor.png  # Kumbha hostel architectural floor plan
├── lib/
│   ├── constants/
│   │   ├── app_constants.dart       # Verified GPS coordinates & disclaimers
│   │   └── app_theme.dart           # Material 3 color palettes & styles
│   ├── models/
│   │   ├── campus_location.dart     # Landmark data model
│   │   ├── indoor_building.dart     # Floor, corridor nodes, edges & room models
│   │   └── route_result.dart        # Route path, waypoints & step guidance
│   ├── screens/
│   │   ├── about_screen.dart        # Helplines, location details & disclaimers
│   │   ├── accessibility_settings_screen.dart # Mobility filters & API server config
│   │   ├── campus_map_screen.dart   # Interactive OpenStreetMap with pins
│   │   ├── home_screen.dart         # Dashboard with quick room chips
│   │   ├── hostel_navigator_screen.dart # Indoor navigator (Rooms 1–16)
│   │   ├── search_screen.dart       # Unified search across campus & rooms
│   │   └── splash_screen.dart       # Animated launch screen
│   ├── services/
│   │   ├── api_service.dart         # HTTP service with offline JSON fallback
│   │   └── indoor_routing_service.dart # Dijkstra algorithm & bilingual steps
│   ├── widgets/
│   │   └── floor_plan_canvas.dart   # Custom painter for layout & neon route
│   └── main.dart                    # App entry point & routing
├── test/
│   ├── campus_location_test.dart    # Model unit tests
│   └── indoor_routing_test.dart     # Dijkstra path & step guidance tests
└── pubspec.yaml                     # Dependencies & asset declarations
```

---

## 🚀 How to Build and Run

### Step 1: Install Flutter SDK (if not already installed)
1. Download Flutter SDK for Windows from [flutter.dev](https://docs.flutter.dev/get-started/install/windows/mobile).
2. Extract the archive (e.g., to `C:\flutter`).
3. Add `C:\flutter\bin` to your Windows user/system `PATH` environment variable.
4. Verify by opening a terminal and running:
   ```powershell
   flutter doctor
   ```

### Step 2: Fetch Dependencies
Navigate into the `mobile_app` folder:
```powershell
cd "c:\Users\Nitish kumar\OneDrive\Desktop\Aware Campus Navigation\mobile_app"
flutter pub get
```

### Step 3: Run Tests & Analysis
```powershell
flutter analyze
flutter test
```

### Step 4: Run on Android Emulator or Device
Make sure an Android emulator is running or a phone with USB debugging enabled is plugged in:
```powershell
flutter run
```

---

## 📦 How to Generate Android APK

### Debug APK (For Immediate Testing & Sideloading)
Run:
```powershell
flutter build apk --debug
```
**Output Path**:
```
mobile_app/build/app/outputs/flutter-apk/app-debug.apk
```

#### Installing on your Android phone:
1. **Via USB / ADB**:
   ```powershell
   adb install -r build/app/outputs/flutter-apk/app-debug.apk
   ```
2. **Via File Transfer (Direct)**:
   - Copy `app-debug.apk` to your phone via USB cable, Google Drive, or WhatsApp.
   - Tap on the APK file on your phone.
   - If prompted, allow "Install from Unknown Sources" in Android Settings and tap **Install**.

---

### Release APK (Signed Production Build)

To build a release-ready APK for distribution or Google Play:

1. **Create an Android Keystore**:
   ```powershell
   keytool -genkey -v -keystore C:\Users\Nitish kumar\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. **Create `mobile_app/android/key.properties`**:
   ```properties
   storePassword=<your-password>
   keyPassword=<your-password>
   keyAlias=upload
   storeFile=C:\\Users\\Nitish kumar\\upload-keystore.jks
   ```
3. **Build the release APK**:
   ```powershell
   flutter build apk --release
   ```
   **Output Path**:
   ```
   mobile_app/build/app/outputs/flutter-apk/app-release.apk
   ```
