// Owner: Harold Paulino
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const required = [
  'android/settings.gradle',
  'android/build.gradle',
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/java/com/skyrivo/MainActivity.kt',
  'android/app/src/main/java/com/skyrivo/MainApplication.kt',
  'android/gradle/wrapper/gradle-wrapper.properties'
];
let failed = false;
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error('Missing Android project file: ' + file);
    failed = true;
  }
}
if (failed) process.exit(1);
const gradle = read('android/app/build.gradle');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const activity = read('android/app/src/main/java/com/skyrivo/MainActivity.kt');
const application = read('android/app/src/main/java/com/skyrivo/MainApplication.kt');
const checks = {
  namespace: /namespace\s*=\s*["']com\.skyrivo["']/.test(gradle),
  applicationId: /applicationId\s*=\s*["']com\.skyrivo["']/.test(gradle),
  activityPackage: /package\s+com\.skyrivo/.test(activity),
  applicationPackage: /package\s+com\.skyrivo/.test(application),
  locationPermission: manifest.includes('android.permission.ACCESS_FINE_LOCATION')
};
for (const [name, pass] of Object.entries(checks)) {
  console.log((pass ? 'PASS ' : 'FAIL ') + name);
  if (!pass) failed = true;
}
const cli = path.join(root, 'node_modules/@react-native-community/cli/build/bin.js');
if (!fs.existsSync(cli)) {
  console.error('Missing installed React Native CLI. Run npm install before check:android.');
  process.exit(1);
}
try {
  const result = execFileSync(process.execPath, [cli, 'config'], {cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024});
  const config = JSON.parse(result);
  const native = Object.entries(config.dependencies || {}).filter(([, dep]) => dep.platforms?.android).map(([name]) => name);
  console.log(JSON.stringify({packageName: config.project?.android?.packageName, sourceDir: config.project?.android?.sourceDir, detectedNativeDependencies: native}, null, 2));
  if (config.project?.android?.packageName !== 'com.skyrivo') failed = true;
} catch (error) {
  console.error('React Native Android configuration failed: ' + (error.stderr?.toString() || error.message));
  failed = true;
}
process.exitCode = failed ? 1 : 0;
