#!/usr/bin/env bash
# Owner: Harold Paulino
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE="com.skyrivo"
SERIAL="${ANDROID_SERIAL:-}"
INSTALL=1
LAUNCH=1
CLEAN=0
SKIP_NPM=0

usage() {
  cat <<'USAGE'
Usage: ./scripts/build-install-release.sh [--device SERIAL | SERIAL] [--build-only] [--no-launch] [--clean] [--skip-npm]

Builds a release Android APK, optionally installs it and launches SkyRivo.
  --device SERIAL   Pick an adb device when multiple devices are connected
  --build-only      Generate APK without installing
  --no-launch       Install APK without launching the app
  --clean           Clean Gradle outputs before building
  --skip-npm        Do not install npm packages when node_modules is missing
  -h, --help        Show help

Example: npm run deploy:android:release -- --device R58R77TZLQZ
USAGE
}

while (($#)); do
  case "$1" in
    --device) [[ $# -ge 2 ]] || { echo 'Missing serial after --device' >&2; exit 2; }; SERIAL="$2"; shift 2 ;;
    --build-only) INSTALL=0; shift ;;
    --no-launch) LAUNCH=0; shift ;;
    --clean) CLEAN=1; shift ;;
    --skip-npm) SKIP_NPM=1; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
    *) if [[ -z "$SERIAL" ]]; then SERIAL="$1"; shift; else echo "Unexpected argument: $1" >&2; exit 2; fi ;;
  esac
done

command -v node >/dev/null || { echo 'Node.js is required.' >&2; exit 1; }
command -v npm >/dev/null || { echo 'npm is required.' >&2; exit 1; }
cd "$ROOT"
if [[ ! -d node_modules ]]; then
  if ((SKIP_NPM)); then echo 'node_modules is missing; run npm install.' >&2; exit 1; fi
  echo 'Installing JavaScript dependencies...'
  if [[ -f package-lock.json ]]; then npm ci; else npm install; fi
fi
node scripts/align-gradle-versions.js
node scripts/patch-rn-agp9-library.js

WRAPPER_PROPERTIES="$ROOT/android/gradle/wrapper/gradle-wrapper.properties"
EXPECTED_GRADLE="9.8.1"
if ! grep -Eq "gradle-${EXPECTED_GRADLE}-((bin)|(all))\.zip" "$WRAPPER_PROPERTIES"; then
  echo "Android wrapper mismatch: AGP 9.0.1 requires Gradle 9.1.0 or newer." >&2
  echo "SkyRivo expects Gradle ${EXPECTED_GRADLE}; update $WRAPPER_PROPERTIES." >&2
  exit 1
fi
if [[ ! -f "$ROOT/android/gradle/wrapper/gradle-wrapper.jar" ]]; then
  echo "Gradle wrapper JAR is missing; restore android/gradle/wrapper/gradle-wrapper.jar." >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" && ! -f android/local.properties ]]; then
  echo 'Android SDK location is not set. Set ANDROID_HOME or create android/local.properties.' >&2
  exit 1
fi
[[ -x android/gradlew ]] || chmod +x android/gradlew
GRADLE_TASKS=()
((CLEAN)) && GRADLE_TASKS+=(clean)
GRADLE_TASKS+=(assembleRelease)
echo 'Building Android release APK...'
(cd android && ./gradlew "${GRADLE_TASKS[@]}")
[[ -f "$APK" ]] || { echo "APK not found: $APK" >&2; exit 1; }
echo "Release APK: $APK"

if ((!INSTALL)); then exit 0; fi
command -v adb >/dev/null || { echo 'adb is required for installation. Use --build-only to skip.' >&2; exit 1; }
if [[ -z "$SERIAL" ]]; then
  mapfile_devices=()
  while IFS= read -r line; do [[ -n "$line" ]] && mapfile_devices+=("$line"); done < <(adb devices | awk 'NR > 1 && $2 == "device" {print $1}')
  if ((${#mapfile_devices[@]} == 0)); then echo 'No authorized Android devices connected. Use --build-only to build.' >&2; exit 1; fi
  if ((${#mapfile_devices[@]} > 1)); then printf 'Multiple devices connected; choose --device SERIAL:\n' >&2; printf '  %s\n' "${mapfile_devices[@]}" >&2; exit 1; fi
  SERIAL="${mapfile_devices[0]}"
fi
adb -s "$SERIAL" get-state >/dev/null
echo "Installing on $SERIAL..."
adb -s "$SERIAL" install -r "$APK"
if ((LAUNCH)); then
  echo 'Launching SkyRivo...'
  adb -s "$SERIAL" shell am force-stop "$PACKAGE" || true
  adb -s "$SERIAL" shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1
fi
echo 'Deployment complete.'
