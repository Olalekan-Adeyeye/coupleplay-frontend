const { withAppBuildGradle } = require("@expo/config-plugins");

function replaceOrThrow(contents, search, replacement) {
  if (!contents.includes(search)) {
    throw new Error(
      `with-android-abi-splits: template anchor not found: ${JSON.stringify(search.slice(0, 80))}`
    );
  }
  return contents.replace(search, replacement);
}

const SIGNING_PROPERTIES = `
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.withInputStream { keystoreProperties.load(it) }
}
`;

const SIGNING_CONFIGS = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile keystorePropertiesFile.exists() ? file(keystoreProperties.storeFile) : null
            storePassword keystoreProperties.storePassword
            keyAlias keystoreProperties.keyAlias
            keyPassword keystoreProperties.keyPassword
        }
    }`;

const SPLITS_BLOCK = `    splits {
        abi {
            enable true
            reset()
            include 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
            universalApk true
        }
    }

`;

module.exports = (config) =>
  withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    contents = replaceOrThrow(
      contents,
      'apply plugin: "com.facebook.react"',
      `apply plugin: "com.facebook.react"\n${SIGNING_PROPERTIES}`
    );
    contents = replaceOrThrow(
      contents,
      "    signingConfigs {\n        debug {\n            storeFile file('debug.keystore')\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }",
      SIGNING_CONFIGS
    );
    contents = replaceOrThrow(
      contents,
      "signingConfig signingConfigs.debug\n            def enableShrinkResources",
      "keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug\n            def enableShrinkResources"
    );
    contents = replaceOrThrow(
      contents,
      "    buildTypes {\n        debug {",
      `${SPLITS_BLOCK}    buildTypes {\n        debug {`
    );
    config.modResults.contents = contents;
    return config;
  });
