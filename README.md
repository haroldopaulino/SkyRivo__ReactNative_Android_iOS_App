# SkyRivo — React Native Android & iOS

Cross-platform conversion of the SkyRivo native Android weather app, using the working AudiVix React Native 0.82.1 host project as the Android/iOS starting point. Owner: Harold Paulino.

## Implemented

- Dark weather screen matching the native Android app's general structure
- Search for current weather by US city (OpenWeather)
- Device current-location weather and permission request
- Fallback to saved last city if location cannot be retrieved
- Last searched city persisted with AsyncStorage
- Temperature, feels-like, low/high, humidity, wind, pressure, updated timestamp, and weather icons
- Android and iOS host projects with appropriate location permissions

## Setup

1. The native Android test OpenWeather key is configured in `src/config.ts`. Replace it with a production-ready configuration before publishing.
2. Install Node.js 20.19.4+ and project dependencies: `npm install`.
3. Android: `npm run android` from the root with an emulator or device ready. The Android Gradle wrapper is included in this project.
4. iOS (macOS): `cd ios && pod install && cd ..`, then `npm run ios`.
5. Android release: `npm run build:android:release` (the inherited reference project signs with debug keys; configure release signing before distribution).

## Notes

Native builds and runtime behavior have not been verified in this environment. The underlying platform configuration originates from the provided AudiVix archive; adjust deployment IDs, signing, icons, and iOS release setup prior to publishing. For a production API key, use a protected server-side proxy instead of a key shipped in the app bundle.

## One-command release deployment

From the project root:

```bash
npm install
npm run deploy:android:release
```

If multiple devices are connected, specify one:

```bash
npm run deploy:android:release -- --device R58R77TZLQZ
# Or use the same positional-device syntax as AudiVix:
./scripts/build-install-release.sh R58R77TZLQZ
```

To build the APK without installing it:

```bash
npm run build:android:release
```

The Android APK is written to `android/app/build/outputs/apk/release/app-release.apk`.

The release build uses debug signing by default **for local sideloading only**. For distribution, configure a permanent release keystore and provide `SKYRIVO_KEYSTORE_FILE`, `SKYRIVO_KEYSTORE_PASSWORD`, `SKYRIVO_KEY_ALIAS`, and `SKYRIVO_KEY_PASSWORD` as environment variables or Gradle properties. The file `android/release-signing.properties.example` lists the expected values; never commit actual credentials. A production build signed with a different key cannot update a debug-signed installation without uninstalling it first.

Build the iOS simulator Release app on macOS with Xcode and CocoaPods installed:

```bash
npm run build:ios:release
```

Deploying a signed build to a physical iPhone or the App Store requires Apple signing setup in Xcode.

## Android release Gradle version

The Android Gradle Plugin is pinned to 9.0.1, so the Gradle wrapper must be 9.1 or newer. This project includes Gradle **9.8.1**, matching the working AudiVix reference project. The release script validates the wrapper setting before starting the build.

If a build reports `Current version is 8.14.3`, replace the old local `android/gradle/wrapper/gradle-wrapper.properties` with the file in this ZIP. Confirm from your project root with:

```bash
cd android
./gradlew --version
cd ..
npm run deploy:android:release
```

Use the wrapper (`./gradlew`), not a globally installed `gradle` command.

## iOS safe area and appearance

SkyRivo uses `react-native-safe-area-context` for both iOS and Android top/bottom screen insets. The iOS app enforces dark appearance and a light status-bar clock and icons. iOS location permission uses `NSLocationWhenInUseUsageDescription` in `ios/SkyRivo/Info.plist`.
