#!/usr/bin/env bash
# Owner: Harold Paulino
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
command -v xcodebuild >/dev/null || { echo 'Xcode and xcodebuild are required.' >&2; exit 1; }
command -v pod >/dev/null || { echo 'CocoaPods is required (pod install).' >&2; exit 1; }
[[ -d node_modules ]] || { echo 'Run npm install first.' >&2; exit 1; }
(cd ios && pod install)
echo 'Building iOS release for the simulator (no Apple signing needed)...'
xcodebuild -workspace ios/SkyRivo.xcworkspace -scheme SkyRivo -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath "$ROOT/ios/build" CODE_SIGNING_ALLOWED=NO build
echo "iOS simulator app: $ROOT/ios/build/Build/Products/Release-iphonesimulator/SkyRivo.app"
echo 'Physical-device or App Store distribution requires your Apple development team and signing configuration.'
