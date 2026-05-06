# Launcher (RN)

A custom Android home screen launcher built with React Native (TypeScript) and Kotlin native modules. Targets **Android 15 (API 35)**, tested on **Samsung Galaxy S24 Ultra**, developed on **Windows 11**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Entry Point Chain](#entry-point-chain)
- [Native Bridge Flow](#native-bridge-flow)
- [Component Tree](#component-tree)
- [App Lifecycle Flow](#app-lifecycle-flow)
- [Launcher Registration Flow](#launcher-registration-flow)
- [Data Flow Diagram](#data-flow-diagram)
- [Key Files Reference](#key-files-reference)
- [Available Commands](#available-commands)
- [Where to Start Reading Code](#where-to-start-reading-code)
- [Features](#features)
- [Limitations](#limitations)
- [React Native vs Native Kotlin](#react-native-vs-native-kotlin)
- [Setting as Default Launcher](#setting-as-default-launcher)
- [Escaping the Launcher](#escaping-the-launcher)
- [Windows 11 Development Environment Setup](#windows-11-development-environment-setup)
- [Running on Your Phone with the Debugger](#running-on-your-phone-with-the-debugger)
- [Android 15 Compatibility](#android-15-compatibility)
- [Samsung Galaxy S24 Ultra Notes](#samsung-galaxy-s24-ultra-notes)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler (Terminal 1)
npm start

# 3. Build and run on connected device/emulator (Terminal 2)
npm run android
```

---

## Project Structure

```
android-launcher-react-native/
│
│── index.js                     ★ JS ENTRY POINT — registers "LauncherRN" component
│── app.json                       App name + display name config
│── package.json                   Dependencies, npm scripts
│── tsconfig.json                  TypeScript config (strict, path alias @/* → src/*)
│── babel.config.js                Babel preset + Reanimated plugin
│── metro.config.js                Metro bundler config (default)
│── .eslintrc.js                   Linting rules
│── react-native.config.js         Points RN CLI to android/ source dir
│── .gitignore
│── CLAUDE.md                      AI assistant context file
│── SETUP_GUIDE.md                 Full beginner setup guide
│── README.md                      ← You are here
│
├── src/                           ★ REACT NATIVE UI LAYER (TypeScript)
│   │── App.tsx                    ★ MAIN COMPONENT — search, grid, drag, states
│   │
│   ├── components/                  UI Components (all memoized with React.memo)
│   │   │── AppGrid.tsx              FlatList grid with perf optimizations
│   │   │── AppIcon.tsx              Single app icon — tap to launch, long-press
│   │   │── SearchBar.tsx            Text input — filters by name or package
│   │   └── DragOverlay.tsx          Drag-and-drop placeholder overlay
│   │
│   ├── hooks/
│   │   └── useInstalledApps.ts      Custom hook — loads apps, refreshes on foreground
│   │
│   ├── native/
│   │   └── LauncherModule.ts        TypeScript wrapper around Kotlin native module
│   │
│   ├── types/
│   │   └── app.ts                   InstalledApp, GridConfig, DragState interfaces
│   │
│   └── utils/
│       └── constants.ts             Grid defaults, colors, cell width calculator
│
└── android/                       ★ KOTLIN NATIVE LAYER
    │── build.gradle                 Root Gradle — SDK versions, Kotlin version
    │── settings.gradle              Project name, module includes
    │── gradle.properties            JVM args, architecture flags, Hermes toggle
    │
    └── app/
        │── build.gradle             App module — dependencies, signing, compile options
        │── proguard-rules.pro       ProGuard rules for release builds
        │
        └── src/main/
            │── AndroidManifest.xml  ★ LAUNCHER REGISTRATION — HOME intent filter
            │
            ├── java/com/novalauncherrn/
            │   │── MainActivity.kt      ★ Activity — edge-to-edge, back gesture, singleTask
            │   │── MainApplication.kt     RN host — registers LauncherPackage, Hermes
            │   │
            │   └── launcher/
            │       │── LauncherModule.kt  ★ NATIVE BRIDGE — getApps, launchApp, picker
            │       └── LauncherPackage.kt   Registers LauncherModule with React Native
            │
            └── res/values/
                │── strings.xml          App name: "Launcher (RN)"
                └── styles.xml           Transparent wallpaper theme, edge-to-edge
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        ANDROID SYSTEM                            │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Home Button  │  │ PackageManager  │  │  Intent System      │  │
│  │ (triggers    │  │ (queries all    │  │  (launches apps,    │  │
│  │  launcher)   │  │  installed apps)│  │   opens picker)     │  │
│  └──────┬───────┘  └────────┬────────┘  └──────────┬──────────┘  │
│         │                   │                      │              │
├─────────┼───────────────────┼──────────────────────┼──────────────┤
│         ▼                   │                      │              │
│  ┌──────────────┐           │    KOTLIN NATIVE     │              │
│  │ MainActivity │           │         LAYER        │              │
│  │  • singleTask│           │                      │              │
│  │  • edge2edge │           │                      │              │
│  │  • no back   │           │                      │              │
│  └──────┬───────┘           │                      │              │
│         │                   │                      │              │
│         ▼                   ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              LauncherModule.kt (Native Bridge)           │    │
│  │                                                          │    │
│  │  getInstalledApps(iconSize)                              │    │
│  │    → PackageManager.queryIntentActivities()              │    │
│  │    → filter out self                                     │    │
│  │    → encode icons to base64 PNG                          │    │
│  │    → return [{packageName, appName, icon}]               │    │
│  │                                                          │    │
│  │  launchApp(packageName)                                  │    │
│  │    → getLaunchIntentForPackage()                          │    │
│  │    → startActivity(intent)                               │    │
│  │                                                          │    │
│  │  openLauncherPicker()                                    │    │
│  │    → startActivity(HOME intent)                          │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                     │
│            React Native Bridge (NativeModules)                    │
│                             │                                     │
├─────────────────────────────┼─────────────────────────────────────┤
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              REACT NATIVE UI LAYER (TypeScript)          │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐     │    │
│  │  │  App.tsx (Root Component)                        │     │    │
│  │  │  State: searchQuery, gridConfig, dragState       │     │    │
│  │  │                                                  │     │    │
│  │  │  ┌─────────────┐  ┌────────────────────────┐    │     │    │
│  │  │  │  SearchBar   │  │  useInstalledApps()    │    │     │    │
│  │  │  │  (filters)   │  │  • loads on mount      │    │     │    │
│  │  │  └─────────────┘  │  • refreshes on fg      │    │     │    │
│  │  │                    │  • sorts alphabetical   │    │     │    │
│  │  │                    └────────────────────────┘    │     │    │
│  │  │  ┌──────────────────────────────────────────┐    │     │    │
│  │  │  │  AppGrid (FlatList)                       │    │     │    │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │     │    │
│  │  │  │  │ AppIcon  │ │ AppIcon  │ │ AppIcon  │   │    │     │    │
│  │  │  │  │ tap→     │ │ tap→     │ │ tap→     │   │    │     │    │
│  │  │  │  │ launch   │ │ launch   │ │ launch   │   │    │     │    │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘    │    │     │    │
│  │  │  └──────────────────────────────────────────┘    │     │    │
│  │  │  ┌──────────────┐                               │     │    │
│  │  │  │ DragOverlay   │  (placeholder, long-press)    │     │    │
│  │  │  └──────────────┘                               │     │    │
│  │  └─────────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│                     WALLPAPER (visible through transparent bg)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Entry Point Chain

How the app boots from zero to pixels on screen:

```
ANDROID OS
    │
    │  User presses Home button / selects "Launcher (RN)"
    ▼
AndroidManifest.xml
    │  Intent filter: HOME + DEFAULT
    │  Resolves to → MainActivity
    ▼
MainActivity.kt
    │  • onCreate():
    │     - WindowCompat.setDecorFitsSystemWindows(false)   ← edge-to-edge
    │     - Register OnBackInvokedCallback (no-op)          ← Android 15 back gesture
    │  • getMainComponentName() → "LauncherRN"
    ▼
MainApplication.kt
    │  • ReactNativeHost configured:
    │     - Hermes enabled
    │     - LauncherPackage() added to packages
    │     - JS entry module: "index"
    │  • SoLoader.init() — loads native libraries
    ▼
index.js
    │  AppRegistry.registerComponent("LauncherRN", () => App)
    │  Loads from app.json: name = "LauncherRN"
    ▼
src/App.tsx
    │  Root functional component mounts
    │  • useState: searchQuery, gridConfig, dragState
    │  • useInstalledApps() hook fires
    ▼
src/hooks/useInstalledApps.ts
    │  • useEffect → loadApps() on mount
    │  • AppState listener → reload on foreground
    │  • Calls: LauncherModule.getInstalledApps(192)
    ▼
src/native/LauncherModule.ts
    │  • Type-safe wrapper around NativeModules.LauncherModule
    │  • Runtime check: throws if native module not linked
    ▼
LauncherModule.kt (Kotlin)
    │  • @ReactMethod getInstalledApps(iconSize, promise)
    │  • PackageManager.queryIntentActivities(MAIN/LAUNCHER)
    │  • Filters out self (com.novalauncherrn)
    │  • For each app:
    │     - loadLabel(pm) → app name
    │     - loadIcon(pm) → Drawable
    │     - drawableToBitmap() → scale to 192×192
    │     - bitmap.compress(PNG) → Base64 string
    │  • promise.resolve([{packageName, appName, icon}])
    ▼
Back in useInstalledApps.ts
    │  • Sorts apps alphabetically by appName
    │  • Sets state: apps[], loading=false
    ▼
App.tsx re-renders
    │  • filteredApps = useMemo(filter by searchQuery)
    │  • Renders: StatusBar → SearchBar → AppGrid → DragOverlay
    ▼
AppGrid.tsx
    │  • FlatList with numColumns=4
    │  • Performance: removeClippedSubviews, getItemLayout,
    │    maxToRenderPerBatch=20, windowSize=10
    ▼
AppIcon.tsx (× number of visible apps)
    │  • Image: data:image/png;base64,{icon}
    │  • Text: app name (with text shadow)
    │  • onPress → LauncherModule.launchApp(packageName)
    │  • onLongPress → sets dragState in App.tsx
    ▼
SCREEN: Grid of app icons over wallpaper
```

---

## Native Bridge Flow

How JavaScript talks to Android and back:

```
┌─────────────────────┐          ┌─────────────────────┐
│   JAVASCRIPT SIDE    │          │     KOTLIN SIDE      │
│                     │          │                     │
│  useInstalledApps() │          │  LauncherModule.kt  │
│         │           │          │         │           │
│         ▼           │          │         │           │
│  LauncherModule.ts  │          │         │           │
│  (typed wrapper)    │          │         │           │
│         │           │          │         │           │
│         ▼           │  BRIDGE  │         │           │
│  NativeModules      │─────────▶│  @ReactMethod       │
│  .LauncherModule    │          │  getInstalledApps() │
│  .getInstalledApps  │          │         │           │
│  (192)              │          │         ▼           │
│                     │          │  PackageManager     │
│                     │          │  .queryIntent       │
│                     │          │  Activities()       │
│                     │          │         │           │
│                     │          │         ▼           │
│                     │          │  Filter + encode    │
│                     │          │  icons to base64    │
│                     │          │         │           │
│                     │          │         ▼           │
│  Promise resolves   │◀─────────│  promise.resolve    │
│  with InstalledApp[]│          │  (WritableArray)    │
│         │           │          │                     │
│         ▼           │          │                     │
│  Sort + setState    │          │                     │
│  → re-render grid   │          │                     │
└─────────────────────┘          └─────────────────────┘


USER TAPS AN APP ICON:

┌─────────────────────┐          ┌─────────────────────┐
│  AppIcon.tsx         │          │  LauncherModule.kt  │
│  onPress()           │          │                     │
│         │           │  BRIDGE  │                     │
│  LauncherModule     │─────────▶│  @ReactMethod       │
│  .launchApp         │          │  launchApp(pkg)     │
│  ("com.whatsapp")   │          │         │           │
│                     │          │         ▼           │
│                     │          │  getLaunchIntent     │
│                     │          │  ForPackage(pkg)     │
│                     │          │         │           │
│                     │          │         ▼           │
│                     │          │  startActivity      │
│                     │          │  (intent +          │
│  Promise resolves   │◀─────────│   NEW_TASK flag)    │
│  with true          │          │                     │
└─────────────────────┘          └─────────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────────┐
                                 │  TARGET APP OPENS    │
                                 │  (e.g., WhatsApp)    │
                                 └─────────────────────┘
```

---

## Component Tree

What renders what, with props flowing down:

```
App.tsx
│
│  State: searchQuery, gridConfig, dragState
│  Hook:  useInstalledApps() → { apps, loading, error, refresh }
│  Memo:  filteredApps (apps filtered by searchQuery)
│
├── StatusBar
│     translucent, transparent bg, light-content
│
├── [loading state] → ActivityIndicator + "Loading apps..."
├── [error state]   → Error text + Retry button (calls refresh)
│
├── SearchBar ─────────────────────────────────────────────────
│     Props: value={searchQuery}
│            onChangeText={setSearchQuery}
│     Renders: TextInput with search styling
│     Memo: React.memo (re-renders only when value changes)
│
├── Text (app count: "{N} apps")
│
├── AppGrid ───────────────────────────────────────────────────
│     Props: apps={filteredApps}
│            gridConfig={gridConfig}
│            onAppLongPress={handleAppLongPress}
│     Renders: FlatList (numColumns=4)
│     Memo: React.memo
│     Perf: removeClippedSubviews, getItemLayout,
│           maxToRenderPerBatch=20, windowSize=10
│     │
│     └── AppIcon (× N visible apps) ─────────────────────────
│           Props: app={InstalledApp}
│                  gridConfig={gridConfig}
│                  onLongPress={onAppLongPress}
│           Renders: TouchableOpacity → Image + Text
│           Memo: React.memo
│           Actions:
│             onPress     → LauncherModule.launchApp(packageName)
│             onLongPress → parent sets dragState
│
├── DragOverlay ───────────────────────────────────────────────
│     Props: dragState={dragState}
│            onCancel={handleDragCancel}
│     Renders: [if dragging] overlay + dragged icon + hint text
│     Memo: React.memo
│     Status: PLACEHOLDER — no actual reordering logic yet
│
└── [if dragging] TouchableOpacity "Tap to cancel"
      onPress → handleDragCancel (resets dragState)
```

---

## App Lifecycle Flow

How the app responds to user actions and system events:

```
┌─────────────────────────────────────────────────────────────┐
│                     APP STATE MACHINE                        │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐     App installed &     ┌──────────────────┐
    │  NOT     │──── user taps Home ────▶│  LOADING         │
    │  RUNNING │     button              │  loading=true    │
    └──────────┘                         │  apps=[]         │
                                         └────────┬─────────┘
                                                  │
                              ┌────────────────────┼────────────────────┐
                              │                    │                    │
                              ▼                    ▼                    ▼
                     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                     │  ERROR       │    │  READY       │    │  EMPTY       │
                     │  error!=null │    │  apps=[...]  │    │  apps=[]     │
                     │  apps=[]    │    │  loading=    │    │  (no launch- │
                     └──────┬───────┘    │  false       │    │   able apps) │
                            │           └──────┬───────┘    └──────────────┘
                     Retry  │                  │
                     button │                  │
                            ▼                  ▼
                     ┌──────────────┐   ┌─────────────────────────────────┐
                     │  RE-LOADING  │   │         USER INTERACTIONS       │
                     │  (try again) │   │                                 │
                     └──────────────┘   │  Type in search → filteredApps  │
                                        │  Tap icon → launchApp()         │
                                        │  Long-press → DragOverlay shown │
                                        │  Tap cancel → DragOverlay hides │
                                        └───────────────┬─────────────────┘
                                                        │
                                              User launches
                                              another app
                                                        │
                                                        ▼
                                               ┌──────────────┐
                                               │ BACKGROUNDED │
                                               │ JS thread    │
                                               │ suspends     │
                                               └──────┬───────┘
                                                      │
                                               User presses
                                               Home button
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │ FOREGROUNDED │
                                               │ AppState →   │
                                               │ "active"     │
                                               │ → reload     │
                                               │   apps list  │
                                               └──────────────┘
                                               (picks up new
                                                installs /
                                                uninstalls)
```

---

## Launcher Registration Flow

How Android knows this app is a launcher:

```
AndroidManifest.xml declares:
┌─────────────────────────────────────────────┐
│  <intent-filter>                            │
│    <action: android.intent.action.MAIN />   │
│    <category: android.intent.category.HOME />│
│    <category: android.intent.category.DEFAULT />│
│  </intent-filter>                           │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  Android System reads manifest at install   │
│  Registers app as a HOME candidate          │
└──────────────────────┬──────────────────────┘
                       │
         User presses Home button
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  Android: "Multiple HOME apps detected"     │
│                                             │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ One UI Home  │  │ Launcher (RN)   │   │
│  │ (Samsung)    │  │ (this app)         │   │
│  └──────────────┘  └────────────────────┘   │
│                                             │
│  "Just once" or "Always"                    │
└──────────────────────┬──────────────────────┘
                       │
              User selects "Always"
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  Launcher (RN) is now the default        │
│  Home button → always opens this app        │
│  MainActivity launches with singleTask      │
│  (only one instance ever exists)            │
└─────────────────────────────────────────────┘
```

---

## Data Flow Diagram

How data moves through the entire system:

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   ANDROID OS                                                      │
│   ┌─────────────────────────────────────────────────────────┐     │
│   │  PackageManager                                          │     │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │     │
│   │  │ WhatsApp │ │ Chrome   │ │ Settings │ │ Camera   │   │     │
│   │  │ pkg name │ │ pkg name │ │ pkg name │ │ pkg name │   │     │
│   │  │ label    │ │ label    │ │ label    │ │ label    │   │     │
│   │  │ icon     │ │ icon     │ │ icon     │ │ icon     │   │     │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │     │
│   └──────────────────────┬──────────────────────────────────┘     │
│                          │                                         │
│          queryIntentActivities(MAIN/LAUNCHER)                      │
│                          │                                         │
│                          ▼                                         │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  LauncherModule.kt                                        │    │
│   │                                                           │    │
│   │  ResolveInfo[] ──filter self──▶ for each app:            │    │
│   │                                  │                        │    │
│   │                          loadLabel(pm) → "WhatsApp"       │    │
│   │                          loadIcon(pm)  → Drawable         │    │
│   │                                  │                        │    │
│   │                          drawableToBitmap(192×192)        │    │
│   │                                  │                        │    │
│   │                          bitmap.compress(PNG, 90%)        │    │
│   │                                  │                        │    │
│   │                          Base64.encodeToString()          │    │
│   │                                  │                        │    │
│   │                          WritableMap {                    │    │
│   │                            packageName: "com.whatsapp"    │    │
│   │                            appName: "WhatsApp"            │    │
│   │                            icon: "iVBORw0KGgo..."         │    │
│   │                          }                                │    │
│   └──────────────────────────┬───────────────────────────────┘    │
│                              │                                     │
│              promise.resolve(WritableArray)                         │
│                              │                                     │
├──────────────────────────────┼─────────────────────────────────────┤
│                              │    RN BRIDGE (serialized JSON)      │
├──────────────────────────────┼─────────────────────────────────────┤
│                              ▼                                     │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  useInstalledApps.ts                                      │    │
│   │                                                           │    │
│   │  InstalledApp[] ──sort by appName──▶ setApps(sorted)     │    │
│   └──────────────────────────┬───────────────────────────────┘    │
│                              │                                     │
│                    React state update                               │
│                              │                                     │
│                              ▼                                     │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  App.tsx                                                  │    │
│   │                                                           │    │
│   │  apps ──useMemo(searchQuery)──▶ filteredApps             │    │
│   │                                      │                    │    │
│   │                                      ▼                    │    │
│   │                                 AppGrid.tsx               │    │
│   │                                      │                    │    │
│   │                              FlatList renders              │    │
│   │                                      │                    │    │
│   │                     ┌────────────────┼────────────────┐   │    │
│   │                     ▼                ▼                ▼   │    │
│   │               AppIcon.tsx      AppIcon.tsx      AppIcon   │    │
│   │               ┌─────────┐      ┌─────────┐      ...      │    │
│   │               │  Image  │      │  Image  │               │    │
│   │               │ base64  │      │ base64  │               │    │
│   │               │  icon   │      │  icon   │               │    │
│   │               │         │      │         │               │    │
│   │               │  Text   │      │  Text   │               │    │
│   │               │ "Whats" │      │"Chrome" │               │    │
│   │               └─────────┘      └─────────┘               │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│                          SCREEN                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Key Files Reference

| File | Purpose | Entry? |
|------|---------|--------|
| `index.js` | Registers root component with `AppRegistry` | JS entry |
| `src/App.tsx` | Main screen — search, grid, drag, loading/error states | UI entry |
| `src/native/LauncherModule.ts` | Type-safe TS wrapper for Kotlin native module | Bridge |
| `src/hooks/useInstalledApps.ts` | Loads apps on mount, refreshes on foreground | Data |
| `src/components/AppGrid.tsx` | Optimized FlatList grid (4 columns) | UI |
| `src/components/AppIcon.tsx` | Tap-to-launch, long-press, base64 icon render | UI |
| `src/components/SearchBar.tsx` | Search input — filters by name or package | UI |
| `src/components/DragOverlay.tsx` | Drag-and-drop placeholder (UI only, no logic) | UI |
| `src/types/app.ts` | `InstalledApp`, `GridConfig`, `DragState` interfaces | Types |
| `src/utils/constants.ts` | Grid defaults (4 col, 56px), colors, cell width calc | Config |
| `AndroidManifest.xml` | HOME + DEFAULT intent filters, QUERY permissions | System |
| `MainActivity.kt` | singleTask, back-press disabled, edge-to-edge | System |
| `MainApplication.kt` | RN host, LauncherPackage registration, Hermes | System |
| `LauncherModule.kt` | getInstalledApps, launchApp, openLauncherPicker | Bridge |
| `LauncherPackage.kt` | Registers LauncherModule with React Native | Bridge |
| `styles.xml` | Transparent wallpaper theme, translucent bars | Theme |

---

## Available Commands

| Command | Platform | Description |
|---------|----------|-------------|
| `npm start` | All | Start Metro bundler |
| `npm run android` | All | Build and install on device/emulator |
| `npm run lint` | All | ESLint on TypeScript files |
| `npm run clean:win` | Windows | Clean Gradle build (`gradlew.bat`) |
| `npm run clean:unix` | macOS/Linux | Clean Gradle build (`./gradlew`) |
| `npm run build:release:win` | Windows | Release APK (`gradlew.bat`) |
| `npm run build:release:unix` | macOS/Linux | Release APK (`./gradlew`) |

Direct Gradle (from `android/` directory):

```powershell
# Windows
.\gradlew.bat clean
.\gradlew.bat assembleDebug
.\gradlew.bat assembleRelease
.\gradlew.bat installDebug

# macOS / Linux
./gradlew clean
./gradlew assembleDebug
./gradlew assembleRelease
./gradlew installDebug
```

---

## Where to Start Reading Code

If you're new to this codebase, read files in this order:

```
1. src/types/app.ts              ← Understand the data shapes first
2. src/native/LauncherModule.ts  ← How JS talks to Kotlin
3. LauncherModule.kt             ← What the native side actually does
4. src/hooks/useInstalledApps.ts ← How app data is loaded and managed
5. src/App.tsx                   ← How the UI orchestrates everything
6. src/components/AppIcon.tsx    ← How a single app icon works
7. src/components/AppGrid.tsx    ← How the grid renders efficiently
8. AndroidManifest.xml           ← How Android knows this is a launcher
9. MainActivity.kt               ← How the activity is configured
```

---

## Features

- Registers as Android HOME launcher — selectable as default home screen
- Dynamically loads all installed apps via `PackageManager`
- Configurable grid layout (4 columns, 56px icons, labels)
- Tap any app to launch it
- Search/filter by app name or package name
- Auto-refreshes app list on foreground (detects install/uninstall)
- Transparent theme — shows system wallpaper
- Drag-and-drop overlay placeholder (UI foundation only)
- Android 15 edge-to-edge support
- Android 15 predictive back gesture handling
- Samsung Galaxy S24 Ultra tested

---

## Limitations

| Area | Detail |
|------|--------|
| Cold start | 500-1500ms (Hermes + JS bundle init). Native launchers: ~100ms. |
| Memory | Base64 icons use ~2-3x memory vs native Bitmaps. ~80-120MB for 150 apps. |
| System gestures | Cannot intercept home, back, or recents. Android handles these first. |
| Widgets | Not implemented. Requires native `AppWidgetHost` module. |
| Notification shade | Cannot swipe down from launcher. Needs `WindowManager` hook. |
| Background | JS thread suspends when backgrounded. Brief delay on resume. |
| Drag-and-drop | UI placeholder only. No reorder logic or persistence. |
| App order | Alphabetical only. Not persisted. Resets on reload. |

---

## React Native vs Native Kotlin

| Criteria | React Native | Native Kotlin |
|----------|-------------|---------------|
| Cold start | 500-1500ms | 100-200ms |
| Scroll perf | Good (60fps) | Excellent |
| Memory | Higher (base64 bridge) | Optimal |
| Widgets | Needs native module | Built-in `AppWidgetHost` |
| Gestures | Limited | Full system integration |
| Dev speed | Fast (hot reload) | Moderate (compile cycle) |
| Production ready | MVP / personal use | Yes |
| Maintainability | RN upgrades risk breakage | Stable Android APIs |
| **Verdict** | **6/10** for production | **9/10** for production |

**Use React Native** for prototyping, personal use, or when you need fast UI iteration.
**Use Native Kotlin** for a public, production-grade launcher with widgets and system gestures.

---

## Setting as Default Launcher

After installing, press the **Home button**. Android shows a launcher picker — select **Launcher (RN)** and choose **Always**.

If the picker doesn't appear:
- **Samsung**: Settings → Apps → Default Apps → Home app → Launcher (RN)
- **Stock Android**: Settings → Apps → Default Apps → Home app

---

## Escaping the Launcher

If the launcher is buggy or you're stuck in a loop:

```powershell
# Method 1: Open home settings via ADB
adb shell am start -a android.settings.HOME_SETTINGS

# Method 2: Uninstall entirely (instant recovery)
adb uninstall com.novalauncherrn

# Method 3: Force-set Samsung One UI as default
adb shell cmd package set-home-activity com.sec.android.app.launcher/.activities.LauncherActivity

# Method 4: Force-set Pixel launcher (non-Samsung)
adb shell cmd package set-home-activity com.google.android.apps.nexuslauncher/.NexusLauncherActivity
```

**Safe mode fallback**: Hold Power → long-press Power Off → OK → boot into Safe Mode → uninstall from Settings → reboot.

---

## Windows 11 Development Environment Setup

This section is written for **Windows 11** deploying to **Samsung Galaxy S24 Ultra (Android 15)**.

### Warnings — Read Before Starting

1. **Windows 260-char path limit** will break `node_modules`. You MUST enable long paths or builds fail silently.
2. **Samsung USB driver** is required. The stock Windows driver does NOT work for ADB.
3. **Windows Defender** slows Gradle builds 2-5x. Add exclusions.
4. **Use PowerShell**, not Command Prompt. All commands below are PowerShell syntax.
5. **Samsung One UI** may reset your default launcher after reboots. Just re-select it.
6. **Gradle on Windows** uses `.\gradlew.bat`, not `./gradlew`.

### Step 1: Enable Long Paths (MANDATORY)

PowerShell as Administrator:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
git config --system core.longpaths true
```

**Restart your computer.** This does not take effect until reboot.

### Step 2: Install Node.js v20 LTS

Download from https://nodejs.org — pick **v20 LTS** (not v22, not v18).

Run the `.msi` installer. Ensure **"Add to PATH"** is checked.

Verify in a **new** PowerShell window:
```powershell
node --version    # Expected: v20.x.x
npm --version     # Expected: 10.x.x
```

### Step 3: Install JDK 17

Download **Eclipse Temurin JDK 17** from https://adoptium.net/temurin/releases/?version=17&os=windows&arch=x64&package=jdk

Run the `.msi` installer. During installation check:
- **Set JAVA_HOME variable**
- **Add to PATH**

Verify:
```powershell
java -version        # Expected: openjdk version "17.x.x"
echo $env:JAVA_HOME  # Expected: C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
```

If `JAVA_HOME` is empty or wrong:
```powershell
# Find where JDK 17 was installed
Get-ChildItem "C:\Program Files\Eclipse Adoptium"

# Set it manually (replace with your actual path)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.13+11", "User")
```

Restart PowerShell and verify again.

### Step 4: Install Android Studio

Download from https://developer.android.com/studio

Run installer with all defaults. When the setup wizard runs:

1. Choose **Standard** installation
2. Let it download SDK, Emulator, Platform-Tools

Then go to **File → Settings → Languages & Frameworks → Android SDK**:

**SDK Platforms tab** — check:
- Android 15.0 (VanillaIceCream) — API 35
- Android 14.0 (UpsideDownCake) — API 34

**SDK Tools tab** — check:
- Android SDK Build-Tools 35.0.0
- Android SDK Command-line Tools (latest)
- Android SDK Platform-Tools
- Android Emulator
- NDK (Side by side) 25.1.8937393
- Google USB Driver

Click **Apply** and wait for downloads.

Note the SDK path shown at the top. Default:
```
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

### Step 5: Set Environment Variables

PowerShell as Administrator:

```powershell
# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

# Add tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$androidPaths = "$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\tools\bin"

if ($currentPath -notlike "*Android\Sdk\platform-tools*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$androidPaths", "User")
}
```

Restart PowerShell. Verify:
```powershell
echo $env:ANDROID_HOME    # C:\Users\...\AppData\Local\Android\Sdk
adb --version              # Android Debug Bridge version 1.0.xx
```

### Step 6: Install Samsung USB Driver

**Option A (via Android Studio):**
File → Settings → SDK Tools → check **Google USB Driver** → Apply

**Option B (Samsung's own driver):**
Download from https://developer.samsung.com/android-usb-driver → run installer → restart.

### Step 7: Add Antivirus Exclusions

PowerShell as Administrator:
```powershell
Add-MpExclusion -Path "$env:LOCALAPPDATA\Android\Sdk"
Add-MpExclusion -Path "$env:USERPROFILE\.gradle"
Add-MpExclusion -Path "$env:USERPROFILE\.android"
# Add your project path:
Add-MpExclusion -Path "C:\path\to\android-launcher-react-native"
```

Or: Windows Security → Virus & threat protection → Exclusions → add the folders above.

### Step 8: Create local.properties

```powershell
cd C:\path\to\android-launcher-react-native
Set-Content -Path "android\local.properties" -Value "sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk"
```

Replace `YOUR_USERNAME`. Double backslashes are required.

### Step 9: Install Dependencies

```powershell
cd C:\path\to\android-launcher-react-native
npm install
```

Takes 2-5 minutes. If you get path-length errors, go back to Step 1.

### Step 10: Connect Galaxy S24 Ultra

**Enable Developer Options:**
1. Settings → About Phone → Software Information
2. Tap **Build Number** 7 times → enter PIN → "Developer mode enabled"

**Enable USB Debugging:**
1. Settings → Developer Options → **USB Debugging** ON → OK

**Samsung-specific — set USB mode:**
1. Developer Options → **Default USB Configuration** → **File Transfer**

**Connect:**
1. Use the USB-C cable that came with the phone
2. Phone shows "Allow USB debugging?" → tap **Allow** + check "Always allow"
3. If USB mode popup appears → select **File Transfer**

**Verify:**
```powershell
adb devices
# Expected:
# R5CT*****    device
```

If nothing:
```powershell
adb kill-server
adb start-server
adb devices
```

If `unauthorized`: check phone for the Allow prompt. If no prompt: Developer Options → Revoke USB debugging authorizations → reconnect.

### Step 11: Build and Run

**Terminal 1 — Metro:**
```powershell
cd C:\path\to\android-launcher-react-native
npm start
```

**Terminal 2 — Build:**
```powershell
cd C:\path\to\android-launcher-react-native
npm run android
```

First build: **5-12 minutes** on Windows. Subsequent: 1-2 minutes.

After the app launches on phone:
```powershell
adb reverse tcp:8081 tcp:8081
```

---

## Running on Your Phone with the Debugger

### Open the Dev Menu

```powershell
adb shell input keyevent 82
```

Or shake the phone (Samsung may have shake disabled — use the ADB command).

### Debugging Options

**Chrome DevTools (simplest):**
1. Dev menu → **"Debug with Chrome"** or **"Open Debugger"**
2. Chrome opens `http://localhost:8081/debugger-ui/`
3. Press F12 → Console (logs), Sources (breakpoints), Network

**Flipper (full-featured):**
Download from https://fbflipper.com/ — provides React DevTools, network inspector, layout inspector, Hermes debugger.

**React DevTools standalone:**
```powershell
npx react-devtools
```
Then dev menu → "Debug with React DevTools".

**ADB Logcat (native + JS logs):**
```powershell
# React Native logs
adb logcat -s ReactNative:V ReactNativeJS:V

# Crash logs
adb logcat -s AndroidRuntime:E

# All logs for this app (get PID first)
adb shell pidof com.novalauncherrn
adb logcat --pid=12345
```

### VS Code Debugger

1. Install "React Native Tools" extension
2. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to React Native",
      "type": "reactnative",
      "request": "attach",
      "cwd": "${workspaceFolder}",
      "port": 8081
    }
  ]
}
```
3. Start Metro + app, then press F5 in VS Code
4. Set breakpoints directly in `.tsx` files

### Hot Reload

Enabled by default. Save a `.tsx` file → updates on phone in 1-2 seconds.

If not working: dev menu → ensure **Fast Refresh** is ON.

Changed Kotlin files? Hot reload won't work — rebuild with `npm run android`.

### Wireless Debugging (no cable after setup)

```powershell
# Option 1: TCP/IP (requires initial USB)
adb tcpip 5555
adb connect YOUR_PHONE_IP:5555
# Unplug cable. Verify:
adb devices

# Option 2: Android 11+ native wireless (no USB ever)
# Phone: Developer Options → Wireless Debugging → ON → Pair device
adb pair PHONE_IP:PAIRING_PORT PAIRING_CODE
adb connect PHONE_IP:DEBUG_PORT
```

### Useful Commands Reference

```powershell
adb devices                              # List connected devices
adb reverse tcp:8081 tcp:8081            # Port forward (run after USB reconnect)
adb shell input keyevent 82             # Open RN dev menu
adb shell input text "RR"               # Reload JS bundle
adb exec-out screencap -p > shot.png    # Screenshot
adb shell screenrecord /sdcard/demo.mp4 # Record (Ctrl+C to stop)
adb pull /sdcard/demo.mp4               # Pull recording to PC
adb shell am start -n com.novalauncherrn/.MainActivity  # Force launch
adb shell am start -a android.settings.HOME_SETTINGS    # Open launcher settings
adb uninstall com.novalauncherrn        # Uninstall app
adb shell pm clear com.novalauncherrn   # Clear app data
```

---

## Android 15 Compatibility

This project targets API 35 with these specific accommodations:

| Android 15 Behavior | Implementation |
|---------------------|----------------|
| Edge-to-edge enforced | `WindowCompat.setDecorFitsSystemWindows(window, false)` in `MainActivity.kt` |
| Transparent system bars | `android:statusBarColor` + `android:navigationBarColor` = transparent in `styles.xml` |
| Predictive back gesture | `android:enableOnBackInvokedCallback="true"` in manifest + `OnBackInvokedCallback` in `MainActivity.kt` |
| Package visibility | `<queries>` block in manifest for `MAIN/LAUNCHER` intent |
| Background launch restrictions | `FLAG_ACTIVITY_NEW_TASK` on all launched intents in `LauncherModule.kt` |

---

## Samsung Galaxy S24 Ultra Notes

| Topic | Detail |
|-------|--------|
| Stock launcher package | `com.sec.android.app.launcher` (use for ADB reset) |
| Screen resolution | 3120x1440 (QHD+) — grid auto-adapts via `Dimensions.get('window')` |
| S Pen | Hover and Air Actions don't trigger RN touch events. Long-press with S Pen works. |
| One UI gestures | Samsung's swipe navigation takes priority. Launcher cannot intercept. |
| Good Lock / Home Up | Can interfere with custom launchers. Disable if installed. |
| Secure Folder | Apps inside Secure Folder are invisible to `PackageManager`. By design. |
| Dual Messenger | Cloned apps appear as separate entries with different package names. |
| Launcher reset on reboot | One UI may reset default launcher. Re-select after reboot. |
| USB config | Set Default USB Configuration to **File Transfer** in Developer Options. |

---

## Troubleshooting

### Windows Build Issues

| Problem | Solution |
|---------|----------|
| Path length errors during `npm install` | Enable long paths (Step 1 of Windows setup) and restart |
| "SDK location not found" | Create `android\local.properties` with `sdk.dir=C\:\\Users\\NAME\\AppData\\Local\\Android\\Sdk` |
| "Could not determine java version" | Install JDK 17, set `JAVA_HOME`, restart PowerShell |
| `'react-native' is not recognized` | Use `npx react-native run-android` instead |
| Build extremely slow (10+ min every time) | Add antivirus exclusions. Use SSD. Enable Gradle caching: add `org.gradle.caching=true` to `gradle.properties` |
| EPERM errors from Metro | Close Android Studio and file explorers in project dir. Run `npm start -- --reset-cache` |

### Phone Connection Issues

| Problem | Solution |
|---------|----------|
| `adb devices` empty | Use a data-capable USB-C cable. Try different port. Install Samsung USB driver. |
| `unauthorized` | Unlock phone, tap Allow on debugging prompt. If no prompt: revoke authorizations in Dev Options. |
| `offline` | `adb kill-server && adb start-server`. Unplug and replug. |
| App shows white/red screen | Run `adb reverse tcp:8081 tcp:8081`. Ensure Metro is running. |
| App crashes immediately | Check `adb logcat -s ReactNative:V ReactNativeJS:V`. Common: Metro not running. |
| Port 8081 in use | `netstat -ano \| findstr :8081` → `taskkill /PID XXXX /F` |
| Dev menu won't open on shake | Samsung may disable shake. Use `adb shell input keyevent 82`. |

### Samsung-Specific Issues

| Problem | Solution |
|---------|----------|
| "App not installed" error | Settings → Security → Install unknown apps → allow ADB source |
| Launcher resets after reboot | Re-select in Settings → Apps → Default Apps → Home app |
| USB defaults to "Charging only" | Developer Options → Default USB Configuration → File Transfer |
| Good Lock interferes | Disable "Home Up" module in Good Lock |
