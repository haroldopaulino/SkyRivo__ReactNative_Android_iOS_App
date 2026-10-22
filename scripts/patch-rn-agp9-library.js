// Owner: Harold Paulino
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'node_modules', '@react-native', 'gradle-plugin', 'react-native-gradle-plugin', 'src', 'main', 'kotlin', 'com', 'facebook', 'react');
const file = path.join(root, 'utils', 'AgpConfiguratorUtils.kt');
if (!fs.existsSync(file)) throw new Error('React Native Android Gradle configurator missing: ' + file);
let content = fs.readFileSync(file, 'utf8');
function replaceFunction(name, replacement) {
  const re = new RegExp('\\bfun\\s+' + name + '\\s*\\(');
  const m = re.exec(content);
  if (!m) throw new Error('Expected React Native Gradle function missing: ' + name);
  const start = m.index;
  const opening = content.indexOf('{', start);
  if (opening < 0) throw new Error('Missing function body: ' + name);
  let depth = 0;
  let end = -1;
  for (let i = opening; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error('Unbalanced function: ' + name);
  content = content.slice(0, start) + replacement + content.slice(end);
}
const fields = `fun configureBuildConfigFieldsForLibraries(project: Project) {
    project.pluginManager.withPlugin("com.android.library") {
      project.extensions
        .getByType(com.android.build.api.variant.LibraryAndroidComponentsExtension::class.java)
        .finalizeDsl { ext ->
          ext.buildFeatures.buildConfig = true
        }
    }
  }`;
const namespace = `fun configureNamespaceForLibraries(project: Project) {
    project.pluginManager.withPlugin("com.android.library") {
      project.extensions
        .getByType(com.android.build.api.variant.LibraryAndroidComponentsExtension::class.java)
        .finalizeDsl { ext ->
          if (ext.namespace == null) {
            val manifestFile = project.layout.projectDirectory.file("src/main/AndroidManifest.xml").asFile
            if (manifestFile.exists()) {
              getPackageNameFromManifest(manifestFile)?.let { packageName ->
                ext.namespace = packageName
              }
            }
          }
        }
    }
  }`;
replaceFunction('configureBuildConfigFieldsForLibraries', fields);
replaceFunction('configureNamespaceForLibraries', namespace);
if (!content.includes('getPackageNameFromManifest(')) throw new Error('Manifest namespace parser missing');
fs.writeFileSync(file, content);
console.log('React Native AGP 9 library DSL callbacks scoped to each library: OK');
