# Developer Guide — Launcher (React Native)

A React Native + Kotlin Android home screen launcher. UI in TypeScript, system integration in a Kotlin native module.

## Toolchain

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| JDK | 17 (Temurin recommended) |
| Gradle | 8.6 (CI auto-installs) |
| Kotlin | 1.9.22 |
| Compile / Target SDK | 35 (Android 15) |
| Min SDK | 24 |
| React Native | 0.74.x |

## Local build

```bash
npm install --legacy-peer-deps
npm run android                  # Build debug + install + start Metro
npm start                        # Start Metro bundler only
```

Direct gradle (after `cd android`):

```bash
gradle assembleDebug             # Debug APK → android/app/build/outputs/apk/debug/
gradle assembleRelease           # Release APK → android/app/build/outputs/apk/release/
gradle clean
```

Hot reload only updates TypeScript/JS. Kotlin native module changes need a full rebuild (`npm run android`).

## Install on phone (sideload)

1. Go to the [Actions tab](../../actions) and open the latest successful **Build APK** run.
2. Download `android-launcher-rn-debug-apk` from the Artifacts section.
3. Unzip — you'll get `app-debug.apk`.
4. Install:
   - **ADB**: `adb install -r app-debug.apk`
   - **Manual**: copy the APK to your phone and open it from the Files app.
5. Set as default launcher: Settings → Apps → Default apps → Home app.
6. Revert to Samsung One UI launcher:
   ```bash
   adb shell cmd package set-home-activity com.sec.android.app.launcher/.activities.LauncherActivity
   ```

> Note: debug builds embed a Metro bundle URL. If launching standalone (no `npm start` running), make sure the JS bundle is included in the APK (`assembleRelease` does this automatically; `assembleDebug` requires Metro running on the same network unless you bundle manually with `npx react-native bundle`).

## CI

`.github/workflows/build.yml` runs on push to `main`/`master`, on PRs, and on manual dispatch. It installs npm deps, sets up Gradle 8.6, and produces a debug APK artifact.

## Target device

Samsung Galaxy S24 Ultra, Android 15. Stock launcher package: `com.sec.android.app.launcher`. Long paths must be enabled on Windows for `npm install` and Gradle to work.
