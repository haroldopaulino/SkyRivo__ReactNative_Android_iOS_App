// Owner: Harold Paulino
const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'node_modules');
const candidates = [
  path.join(base, 'react-native', 'gradle', 'libs.versions.toml'),
  path.join(base, '@react-native', 'gradle-plugin', 'gradle', 'libs.versions.toml')
];
let changes = 0;
for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  let updated = original.replace(/^(kotlin\s*=\s*")[^"]+("\s*)$/m, (_m, a, b) => a + '2.4.10' + b);
  updated = updated.replace(/^(agp\s*=\s*")[^"]+("\s*)$/m, (_m, a, b) => a + '9.0.1' + b);
  if (!/^kotlin\s*=\s*"2\.4\.10"/m.test(updated)) throw new Error('Kotlin catalog version not aligned: ' + file);
  if (!/^agp\s*=\s*"9\.0\.1"/m.test(updated)) throw new Error('AGP catalog version not aligned: ' + file);
  if (original !== updated) fs.writeFileSync(file, updated);
  changes++;
  console.log('Aligned React Native Gradle catalog: ' + file);
}
if (!changes) throw new Error('React Native version catalog not found. Check installed node_modules layout.');

const gradlePluginRoot = path.join(base, '@react-native', 'gradle-plugin');
let adjustedApiFiles = 0;
function alignApiVersion(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'build' && item.name !== '.gradle' && item.name !== 'node_modules') alignApiVersion(absolute);
    } else if (item.name.endsWith('.gradle.kts')) {
      const before = fs.readFileSync(absolute, 'utf8');
      let after = before.replace(/apiVersion\.set\(KotlinVersion\.KOTLIN_1_8\)/g, 'apiVersion.set(KotlinVersion.KOTLIN_2_2)');
      after = after.replace(/apiVersion\s*=\s*KotlinVersion\.KOTLIN_1_8/g, 'apiVersion = KotlinVersion.KOTLIN_2_2');
      if (after !== before) {
        fs.writeFileSync(absolute, after);
        adjustedApiFiles++;
        console.log('Updated Kotlin API version: ' + absolute);
      }
    }
  }
}
alignApiVersion(gradlePluginRoot);
console.log('React Native Gradle Kotlin API files updated: ' + adjustedApiFiles);
