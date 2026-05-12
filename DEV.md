# Developer Guide — Launcher (React Native)

React Native + Kotlin Android home screen launcher. UI in TypeScript, system integration via a Kotlin native module. Targets Android 15 (SDK 35), min SDK 24, JDK 17, Node 20.x.

## Quick Start

```bash
npm install --legacy-peer-deps
npm start                  # Metro bundler
npm run android            # build debug, install, run on device/emulator
```

Direct gradle builds:

```bash
cd android
./gradlew assembleDebug    # debug APK -> android/app/build/outputs/apk/debug/
./gradlew assembleRelease  # release APK -> android/app/build/outputs/apk/release/
./gradlew clean
```

Sideload from CI:

```bash
# Download android-launcher-rn-debug-apk from the latest Build APK Actions run, unzip, then:
adb install -r app-debug.apk
# Revert to Samsung One UI launcher:
adb shell cmd package set-home-activity com.sec.android.app.launcher/.activities.LauncherActivity
```

Hot reload covers TS/JS only; Kotlin native module changes require a full `npm run android` rebuild.
