# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm start                  # Start Metro bundler (must be running for dev builds)
npm run android            # Build and install on connected device/emulator
npm run lint               # ESLint (*.ts, *.tsx)
```

Gradle commands differ by platform:
```bash
# Windows (PowerShell)
npm run clean:win          # cd android && gradlew.bat clean
npm run build:release:win  # cd android && gradlew.bat assembleRelease

# macOS / Linux
npm run clean:unix         # cd android && ./gradlew clean
npm run build:release:unix # cd android && ./gradlew assembleRelease
```

After changing Kotlin native code, you must rebuild with `npm run android` — hot reload only applies to TypeScript/JS changes.

## Architecture

This is a React Native Android launcher (home screen replacement) with a Kotlin native module bridge.

**Two layers:**
- **TypeScript UI** (`src/`) — React Native components, hooks, and state management
- **Kotlin native module** (`android/app/src/main/java/com/novalauncherrn/launcher/`) — Android system integration via `PackageManager` and `Intent`

**Native bridge flow:**
`LauncherModule.kt` exposes three methods to JS via React Native's `NativeModules`:
- `getInstalledApps(iconSize)` — queries all launchable apps, returns array of `{packageName, appName, icon}` where icon is base64-encoded PNG
- `launchApp(packageName)` — launches an app via Intent
- `openLauncherPicker()` — opens Android's default launcher chooser

The TypeScript side wraps this in `src/native/LauncherModule.ts` with type safety, and `src/hooks/useInstalledApps.ts` manages loading lifecycle + foreground refresh via `AppState` listener.

**Launcher registration:** `AndroidManifest.xml` declares `HOME` + `DEFAULT` intent categories. `MainActivity.kt` uses `singleTask` launch mode and disables back-press (launchers must not exit on back).

## Key Conventions

- All React Native components use `React.memo()` for performance
- `FlatList` in `AppGrid.tsx` uses `getItemLayout`, `removeClippedSubviews`, and batch rendering config — preserve these optimizations
- Grid layout is configurable via `GridConfig` type in `src/types/app.ts`, with defaults in `src/utils/constants.ts`
- The launcher excludes itself from the app list (filters by `selfPackage` in `LauncherModule.kt`)
- Theme is transparent with translucent status/nav bars to show wallpaper (`styles.xml`)
- Path alias `@/*` maps to `src/*` (tsconfig.json)

## Build Configuration

- Android SDK: compile/target 35 (Android 15), min 24
- Kotlin 1.9.22, JVM target 17 (requires JDK 17)
- Hermes enabled, Fabric/New Architecture disabled
- Reanimated babel plugin required in `babel.config.js`
- Native module auto-linked via `react-native.config.js`; `LauncherPackage` manually registered in `MainApplication.kt`

## Android 15 Specifics

- Edge-to-edge enforced: `WindowCompat.setDecorFitsSystemWindows(window, false)` in `MainActivity.kt`
- Predictive back gesture: `OnBackInvokedCallback` registered (no-op, launchers must not close)
- `android:enableOnBackInvokedCallback="true"` in `AndroidManifest.xml`
- Package visibility: `<queries>` block in manifest for `MAIN/LAUNCHER` intent

## Target Device: Samsung Galaxy S24 Ultra

- Stock launcher package: `com.sec.android.app.launcher` (use this for ADB reset, NOT the Pixel launcher)
- Samsung One UI may reset default launcher after reboot — user must re-select
- Secure Folder apps are invisible to `PackageManager` by design
- Samsung's "Home Up" (Good Lock) module can interfere with custom launchers

## Windows Development

- Long paths MUST be enabled (`LongPathsEnabled` registry key) or `npm install` and Gradle fail
- Use `.\gradlew.bat` in `android\` directory, not `./gradlew`
- Samsung USB driver required for ADB to detect Galaxy phones
- Windows Defender exclusions recommended for `.gradle`, `node_modules`, and SDK dirs
- `android\local.properties` must exist with `sdk.dir` pointing to the SDK (escaped backslashes)

## Current State

- Drag-and-drop is a UI placeholder only (`DragOverlay.tsx`) — long-press shows overlay but no reordering logic exists yet
- App order is not persisted; resets to alphabetical on each load
- Debug keystore used for both debug and release builds
