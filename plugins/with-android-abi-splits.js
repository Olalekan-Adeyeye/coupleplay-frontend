const { withAppBuildGradle } = require("@expo/config-plugins");

const SIGNING_PROPERTIES = `
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.withInputStream { keystoreProperties.load(it) }
}
`;

const SPLITS_BLOCK = `    splits {
        abi {
            enable true
            reset()
            include 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
            universalApk true
        }
    }

`;

const RELEASE_SIGNING_CONFIG = `
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

module.exports = (config) =>
  withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents
      .replace(
        "apply plugin: \"com.facebook.react\"",
        `apply plugin: "com.facebook.react"\n${SIGNING_PROPERTIES}`
      )
      .replace(
        "    signingConfigs {\n        debug {\n            storeFile file('debug.keystore')\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }",
        RELEASE_SIGNING_CONFIG
      )
      .replace(
        "signingConfig signingConfigs.debug\n            def enableShrinkResources",
        "keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug\n            def enableShrinkResources"
      )
      .replace(
        "    buildTypes {\n        debug {",
        `${SPLITS_BLOCK}    buildTypes {\n        debug {`
      );
    return config;
  });
