# React Native Android Launcher — Complete Setup Guide

This guide assumes **zero** Android development experience. Follow every step exactly.

---

## Table of Contents

1. [Software Installation](#1-software-installation)
2. [Environment Variables](#2-environment-variables)
3. [Project Setup](#3-project-setup)
4. [Running on Emulator](#4-running-on-emulator)
5. [Running on Physical Device](#5-running-on-physical-device)
6. [Setting as Default Launcher](#6-setting-as-default-launcher)
7. [Resetting / Escaping the Launcher](#7-resetting--escaping-the-launcher)
8. [Project Structure](#8-project-structure)
9. [Troubleshooting](#9-troubleshooting)
10. [Limitations & Tradeoffs](#10-limitations--tradeoffs)
11. [Comparison Table](#11-comparison-table)

---

## 1. Software Installation

### A. Install Node.js (v18 or v20 LTS)

Download from https://nodejs.org — pick the **LTS** version.

Verify after install:
```bash
node --version    # Should show v18.x or v20.x
npm --version     # Should show 9.x or 10.x
```

### B. Install Java Development Kit (JDK 17)

React Native 0.73 requires JDK 17. Download **Eclipse Temurin 17**:
https://adoptium.net/temurin/releases/?version=17

**macOS (Homebrew):**
```bash
brew install --cask temurin@17
```

**Windows:** Download the `.msi` installer from the link above.

**Linux (Ubuntu/Debian):**
```bash
sudo apt install temurin-17-jdk
```

Verify:
```bash
java -version    # Should show "openjdk version 17.x.x"
```

### C. Install Android Studio

Download from https://developer.android.com/studio

During installation, make sure these are checked:
- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)

After installing, open Android Studio and go to:
**Settings → Languages & Frameworks → Android SDK**

Under the **SDK Platforms** tab, check:
- Android 14.0 (API 34)

Under the **SDK Tools** tab, check:
- Android SDK Build-Tools 34.0.0
- Android SDK Command-line Tools
- Android Emulator
- Android SDK Platform-Tools
- NDK (Side by side) — version 25.1.8937393

Click **Apply** and let it download.

### D. Install Watchman (macOS only, recommended)

```bash
brew install watchman
```

---

## 2. Environment Variables

Add these to your shell profile (`~/.zshrc` on macOS, `~/.bashrc` on Linux, or System Environment Variables on Windows).

**macOS / Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
# export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
# export JAVA_HOME=/usr/lib/jvm/temurin-17-jdk-amd64  # Linux
```

After editing, reload:
```bash
source ~/.zshrc   # or source ~/.bashrc
```

**Windows (PowerShell as Admin):**
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot", "User")
```

Verify:
```bash
echo $ANDROID_HOME   # Should print the SDK path
adb --version        # Should print "Android Debug Bridge version..."
```

---

## 3. Project Setup

### A. Navigate to the project directory

```bash
cd /path/to/android-launcher-react-native
```

### B. Install JavaScript dependencies

```bash
npm install
```

This will take 1-3 minutes. It downloads React Native and all dependencies into `node_modules/`.

### C. Verify the project structure

Your directory should look like this:
```
android-launcher-react-native/
├── android/                  ← Open THIS folder in Android Studio
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml    ← Launcher intent filters
│   │       ├── java/com/novalauncherrn/
│   │       │   ├── MainActivity.kt
│   │       │   ├── MainApplication.kt
│   │       │   └── launcher/
│   │       │       ├── LauncherModule.kt   ← Native bridge
│   │       │       └── LauncherPackage.kt
│   │       └── res/
│   ├── build.gradle
│   └── settings.gradle
├── src/                      ← Run `npm start` from HERE (project root)
│   ├── App.tsx               ← Main UI entry point
│   ├── components/
│   │   ├── AppGrid.tsx       ← Grid layout
│   │   ├── AppIcon.tsx       ← Individual app icon
│   │   ├── DragOverlay.tsx   ← Drag placeholder
│   │   └── SearchBar.tsx     ← Search input
│   ├── hooks/
│   │   └── useInstalledApps.ts
│   ├── native/
│   │   └── LauncherModule.ts ← TypeScript bridge to Kotlin
│   ├── types/
│   │   └── app.ts
│   └── utils/
│       └── constants.ts
├── index.js
├── package.json
└── tsconfig.json
```

---

## 4. Running on Emulator

### A. Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Click **More Actions → Virtual Device Manager** (or **Tools → Device Manager**)
3. Click **Create Device**
4. Select **Pixel 6** (or any phone), click **Next**
5. Select **API 34** system image (download it if needed), click **Next**
6. Name it whatever you want, click **Finish**

### B. Start the emulator

From command line:
```bash
emulator -list-avds              # Shows your AVD names
emulator -avd Pixel_6_API_34 &   # Replace with your AVD name
```

Or just click the **Play** button next to the AVD in Android Studio's Device Manager.

### C. Start Metro bundler

Open a terminal in the **project root** directory:
```bash
npm start
```

Leave this terminal **running**. This is the JavaScript bundler.

### D. Build and install the app

Open a **second** terminal in the **project root**:
```bash
npm run android
```

This runs `react-native run-android`, which:
1. Compiles the Kotlin/Java code via Gradle
2. Installs the APK onto the emulator
3. Connects to the Metro bundler

**First build takes 3-8 minutes.** Subsequent builds are much faster.

---

## 5. Running on Physical Device

### A. Enable Developer Options

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times (a toast will say "You are now a developer!")
3. Go back to **Settings → System → Developer Options**
4. Enable **USB Debugging**

### B. Connect your phone via USB

```bash
adb devices    # Should show your device listed
```

If it shows "unauthorized", check your phone screen — there should be a prompt asking to allow USB debugging. Tap **Allow**.

### C. Build and run

Same as emulator:
```bash
npm start          # Terminal 1 — Metro bundler
npm run android    # Terminal 2 — Build and install
```

---

## 6. Setting as Default Launcher

### On Emulator or Device:

1. After the app is installed, press the **Home button** (circle or swipe up)
2. Android will show a picker: "Complete action using..."
3. Select **Launcher (RN)**
4. Choose **Always** (to set as default) or **Just once** (to test)

### If the picker doesn't appear:

Go to **Settings → Apps → Default Apps → Home app** and select **Launcher (RN)**.

---

## 7. Resetting / Escaping the Launcher

This is critical — if the launcher crashes or you want to go back to the stock launcher:

### Method 1: ADB (always works)

```bash
# Open system settings
adb shell am start -a android.settings.HOME_SETTINGS

# OR force-set a different launcher
adb shell cmd package set-home-activity com.google.android.apps.nexuslauncher/.NexusLauncherActivity
```

### Method 2: From the App Itself

The app includes a "launcher picker" function you can trigger from code. Add a settings button that calls `LauncherModule.openLauncherPicker()`.

### Method 3: Uninstall via ADB

```bash
adb uninstall com.novalauncherrn
```

This immediately removes the app and Android falls back to the stock launcher.

### Method 4: Safe Mode

1. Hold the **Power** button
2. Long-press **Power Off**
3. Tap **OK** to boot into Safe Mode
4. Safe mode uses the stock launcher
5. Go to **Settings → Apps → Launcher (RN) → Uninstall**
6. Reboot normally

---

## 8. Project Structure

### Which directory to open in Android Studio:
```
android-launcher-react-native/android/
```
Open the `android/` subfolder, NOT the project root.

### Which directory to run npm from:
```
android-launcher-react-native/
```
Run `npm install`, `npm start`, and `npm run android` from the **project root**.

### Key files explained:

| File | Purpose |
|------|---------|
| `AndroidManifest.xml` | Registers as HOME launcher with intent filters |
| `MainActivity.kt` | Entry point, disables back-press (launchers don't exit) |
| `LauncherModule.kt` | Native bridge — queries apps, launches apps, encodes icons |
| `LauncherPackage.kt` | Registers the native module with React Native |
| `MainApplication.kt` | App initialization, adds LauncherPackage |
| `src/App.tsx` | Main React Native UI — search, grid, drag overlay |
| `src/native/LauncherModule.ts` | TypeScript wrapper around the Kotlin native module |
| `src/hooks/useInstalledApps.ts` | Hook that loads apps, re-fetches on foreground |
| `src/components/AppGrid.tsx` | FlatList-based grid with performance optimizations |
| `src/components/AppIcon.tsx` | Single app icon with tap-to-launch |

---

## 9. Troubleshooting

### Gradle Errors

**"SDK location not found"**
```
Create a file: android/local.properties
Add this line:
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk     (macOS)
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk  (Windows)
```

**"Could not determine java version from '21'"**
You have the wrong JDK. Install JDK 17 and set JAVA_HOME:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**"Unsupported class file major version 65"**
Same issue — JDK version mismatch. Must be JDK 17.

**Build failed with "Could not find com.facebook.react:react-android"**
```bash
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install
npm run android
```

### SDK Mismatch Errors

**"Installed Build Tools revision X does not match Y"**
Open Android Studio → SDK Manager → SDK Tools → install the version that Gradle is asking for (34.0.0).

### Emulator Issues

**"No connected devices" or emulator not starting**
```bash
# Check if emulator is listed
adb devices

# If empty, start emulator manually
emulator -list-avds
emulator -avd YOUR_AVD_NAME

# If adb doesn't see it, restart adb
adb kill-server
adb start-server
```

**Emulator is extremely slow**
- Enable hardware acceleration: Android Studio → SDK Manager → SDK Tools → check "Intel HAXM" or use "Android Emulator Hypervisor Driver"
- Use an x86_64 system image, not ARM
- Allocate at least 4GB RAM to the AVD

### Metro Bundler Issues

**"Metro has encountered an error: ENOSPC"**
```bash
# Increase file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**"Unable to resolve module" errors**
```bash
npm start -- --reset-cache
```

**Metro not connecting to emulator/device**
```bash
adb reverse tcp:8081 tcp:8081
```

### App Not Showing in Launcher Picker

1. Verify `AndroidManifest.xml` has the HOME intent filter
2. Rebuild completely:
```bash
cd android && ./gradlew clean && cd ..
npm run android
```
3. On Android 11+, the `<queries>` block in the manifest is required

### App Crashes on Launch

Check logs:
```bash
adb logcat -s ReactNative:V ReactNativeJS:V
```

Common causes:
- Metro bundler not running — start it with `npm start`
- Native module not linked — verify `MainApplication.kt` includes `LauncherPackage()`
- Missing permissions — check the manifest

---

## 10. Limitations & Tradeoffs

### React Native as a Launcher — Honest Assessment

#### Performance

| Aspect | Impact | Detail |
|--------|--------|--------|
| Cold start | **Significant** | RN launcher adds 500-1500ms to home screen load due to JS bundle initialization + Hermes startup. Native launchers load in ~100-200ms. |
| App list loading | **Moderate** | Icons must be serialized to base64, sent over the bridge, and decoded in JS. For 100+ apps, this takes 200-500ms. Native can display directly. |
| Scroll performance | **Minor** | FlatList with `removeClippedSubviews` and `getItemLayout` handles this well. 60fps is achievable with proper optimization. |
| Memory | **Moderate** | Base64 icon strings consume ~2-3x the memory of native Bitmaps. For 150 apps, expect ~80-120MB RAM for icons alone. |

#### Gesture Limitations

- **No system gesture interception**: React Native cannot intercept the system back gesture, home gesture, or recent apps gesture. These are handled by the Android system before reaching your app.
- **Swipe-to-notification-shade**: Cannot be implemented from React Native. Native launchers hook into `WindowManager` for this.
- **Widget hosting**: Android widgets (`AppWidgetHost`) require native implementation. React Native cannot render native Android widgets. You must build a native view manager to embed them.
- **Live wallpaper integration**: The transparent background theme shows the wallpaper, but you cannot interact with live wallpapers or control wallpaper-related APIs from JS.

#### Background Execution

- **React Native's JS thread suspends** when the app is backgrounded. A launcher needs to feel instant when the user presses Home. With RN, there's a brief re-render on resume.
- **No foreground service by default**: Native launchers can run a foreground service for instant responsiveness. RN launchers need a native module to do this.

#### What Works Well

- **Rapid UI iteration**: Hot reload makes UI tweaking fast
- **App drawer and search**: Pure UI features work great in RN
- **Cross-platform logic sharing**: If you ever want an iOS launcher (jailbreak), the UI code is reusable
- **Complex animations**: Reanimated + Gesture Handler give near-native animation performance

#### What Requires Native Modules

| Feature | Why Native |
|---------|-----------|
| App list query | `PackageManager` API is Android-only |
| App launching | `Intent` system is Android-only |
| Widget hosting | `AppWidgetHost` is a native Android API |
| Notification access | `NotificationListenerService` |
| Wallpaper control | `WallpaperManager` |
| System settings | Various Android settings APIs |

#### Recommendation

React Native is viable for a **custom home screen app** (app drawer, search, favorites, folders). It is **not ideal** for a **full system launcher replacement** that needs widgets, notification shade integration, and sub-100ms home button response times. For that, go native Kotlin.

---

## 11. Comparison: React Native vs Native Android Launcher

| Criteria | React Native | Native Android (Kotlin) |
|----------|-------------|------------------------|
| **Cold start time** | 500-1500ms (JS init + Hermes) | 100-200ms |
| **Scroll performance** | Good (60fps with optimization) | Excellent (native RecyclerView) |
| **Memory usage** | Higher (~2-3x for icon bridge) | Optimal |
| **Widget support** | Requires native module | Native `AppWidgetHost` |
| **Gesture support** | Limited (no system gestures) | Full system integration |
| **Development speed** | Fast (hot reload, JSX) | Moderate (XML layouts, compile) |
| **UI flexibility** | Excellent (Flexbox, Reanimated) | Good (ConstraintLayout, MotionLayout) |
| **Production readiness** | MVP / Personal use | Production-grade |
| **Long-term maintainability** | RN upgrades can break native modules | Stable Android APIs |
| **Team hiring** | Easier (JS/TS developers) | Harder (Android specialists) |
| **Feasibility score** | 6/10 for production launcher | 9/10 for production launcher |

### Bottom Line

- **Use React Native** if: You want to prototype fast, the launcher is for personal use or a niche audience, and you don't need widgets or system gesture integration.
- **Use Native Kotlin** if: You're building a production launcher for public release, need widgets, want optimal performance, and plan long-term maintenance.
