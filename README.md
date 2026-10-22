# SkyRivo — React Native Weather App for Android & iOS

**A cross-platform weather experience built with React Native and TypeScript, featuring live OpenWeather conditions, US city search, current-location lookup, saved search preferences, and a unified dark interface for Android and iOS.**

SkyRivo brings a weather-focused product originally developed as a native Kotlin/Jetpack Compose Android application to a shared React Native codebase. Both implementations preserve the same recognizable experience: a clean city search, prominent current temperature and weather icon, and a concise dashboard of useful conditions.

> **Project status:** Cross-platform implementation with Android and iOS host projects. The repository notes that native build and runtime validation were not completed in its documented environment.
## Preview

<img width="1122" height="1402" alt="skyrivo-weather-showcase" src="https://github.com/user-attachments/assets/a4b71889-6e8d-4230-8acb-00f3872984c9" />

## Highlights

- **Current conditions by US city:** Search a city and display its latest weather through the OpenWeather API.
- **Location-aware lookup:** Request location permission and fetch conditions for device coordinates.
- **Saved city fallback:** Restore the most recently searched city using AsyncStorage when location is unavailable.
- **Useful weather details:** Temperature, description and icon, feels-like temperature, low/high, humidity, wind speed, pressure, and observation/update time.
- **Consistent cross-platform UI:** Dark navy weather dashboard with cyan accents and a prominent summary card on both Android and iOS.
- **Native platform integration:** Dedicated Android and iOS host projects and platform-specific location permissions.
- **Release-oriented workflows:** Repository scripts for Android release APK build/deployment and an iOS release-build script.

## Real app screen

The screenshot below represents the actual SkyRivo interface, including a search for **Clearfield, UT** and a current-conditions card. The values are an example captured at a specific moment, not a live weather forecast.

*Add the provided screenshot at `docs/images/skyrivo-app-screenshot.png` to show the real UI.*

## Technology stack

| Area | Implementation |
| --- | --- |
| Framework | React Native 0.82.1 |
| Language | TypeScript |
| UI runtime | React 19.1.1 |
| Weather source | OpenWeather API |
| Current location | `@react-native-community/geolocation` |
| Stored preferences | `@react-native-async-storage/async-storage` |
| Safe-area layout | `react-native-safe-area-context` |
| Android | Native Gradle/Android host project |
| iOS | Native Xcode/CocoaPods host project |
| Tooling | Metro, Babel, TypeScript, React Native CLI |

## Architecture and request flow

```text
        React Native weather screen
                   |
         City search or GPS lookup
                   |
        Location permission / saved city
                   |
             OpenWeather API
                   |
             Weather response
                   |
      Dark weather summary + detail panel
                   |
         Save last city to AsyncStorage
```

The React Native edition intentionally reproduces the user-facing behavior of the [native SkyRivo Android application](https://github.com/haroldopaulino/SkyRivo__Android_App), but its implementation is different. **React Native/TypeScript and AsyncStorage are used here; Kotlin, Jetpack Compose, Retrofit, Koin, and DataStore belong to the native Android repository and should not be described as this repository's application stack.**

## Project structure

```text
SkyRivo__ReactNative_Android_iOS_App/
├── android/               # Android host/build configuration
├── ios/                   # iOS host/build configuration
├── src/                   # Shared TypeScript application logic/UI
├── scripts/               # Platform setup and release tooling
├── package.json
├── README.md
└── ...
```

## Getting started

### Prerequisites

- Node.js **20.19.4 or newer**
- npm and the project's React Native dependencies
- Android Studio, Android SDK and appropriate JDK for Android development
- macOS, Xcode and CocoaPods for iOS development
- An OpenWeather API credential

### Configure the API

The repository README states that an Android test OpenWeather key is configured in `src/config.ts`. Replace the test configuration before distribution. **A key included in an app bundle is not a secret**; for stronger production control use a server-side proxy with appropriate restrictions, throttling, and monitoring.

### Install dependencies

```bash
npm install
```

### Run on Android

```bash
npm run android
```

Use an Android emulator or connected device, and grant location permission if testing location-based weather.

### Run on iOS (macOS)

```bash
cd ios
pod install
cd ..
npm run ios
```

Use a compatible simulator or iPhone and allow location permission when prompted.

### Useful development commands

```bash
npm start                 # Start Metro
npm run typecheck         # TypeScript validation
npm run check:android     # Validate Android project configuration
```

## Android release APK

To build an Android release APK without installing it:

```bash
npm run build:android:release
```

To build and deploy it using the repository script:

```bash
npm run deploy:android:release
```

If several Android devices are connected, pass a device selector as documented in the project's release script. The repository documents the output path as:

```text
android/app/build/outputs/apk/release/app-release.apk
```

For iOS, the repository declares `npm run build:ios:release`; ensure signing, capabilities, bundle identity, native dependencies and target configuration are validated in Xcode.

## Relationship to native Android SkyRivo

| Capability | Native Android app | React Native app |
| --- | --- | --- |
| UI | Kotlin + Jetpack Compose / Material 3 | Shared React Native / TypeScript UI |
| City-based current weather | OpenWeather | OpenWeather |
| Weather at current coordinates | Android location integration | React Native geolocation integration |
| Saved city/preferences | Android DataStore | AsyncStorage |
| Android support | Yes | Yes |
| iOS support | No | iOS host project included |

The cross-platform conversion demonstrates how to maintain **consistent product behavior and visual identity** while choosing a different delivery architecture.

## Engineering value

SkyRivo highlights practical mobile development skills that translate to real product teams: REST API integration, typed cross-platform development, runtime permissions, persistent settings, user-facing error/fallback flows, native project maintenance, and coordinated Android/iOS feature delivery. Having both a native Android and React Native implementation also provides a useful basis for comparing development velocity, UI consistency, platform-specific integration, and long-term maintenance tradeoffs.

## Author

**Haroldo Paulino**  
[GitHub profile](https://github.com/haroldopaulino) · [Portfolio](https://appdevdesign.com/harold/)

## Related project

- [SkyRivo — Native Android (Kotlin / Jetpack Compose)](https://github.com/haroldopaulino/SkyRivo__Android_App)

## License

Refer to the `LICENSE` file in this repository for applicable terms.
