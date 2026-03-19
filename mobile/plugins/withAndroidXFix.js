const { withProjectBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin to:
 * 1. Force modern AndroidX core versions.
 * 2. Exclude legacy Android Support modules that cause duplicate class errors.
 * 3. Ensure android.enableJetifier=true is set in gradle.properties.
 */
const withAndroidXFix = (config) => {
  // 1. Modify build.gradle to add resolution strategy
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const resolutionStrategy = `
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.16.0'
            force 'androidx.core:core-ktx:1.16.0'
            force 'androidx.versionedparcelable:versionedparcelable:1.2.0'
            exclude group: 'com.android.support', module: 'support-compat'
            exclude group: 'com.android.support', module: 'support-v4'
            exclude group: 'com.android.support', module: 'versionedparcelable'
        }
    }`;

      // Insert resolutionStrategy inside allprojects block if not already present
      if (!config.modResults.contents.includes('resolutionStrategy')) {
        config.modResults.contents = config.modResults.contents.replace(
          /allprojects\s*{/,
          `allprojects {${resolutionStrategy}`
        );
      } else {
        // Update existing strategy if necessary (simple replacement for this task)
        config.modResults.contents = config.modResults.contents.replace(
          /resolutionStrategy\s*{[^}]*}/s,
          `resolutionStrategy {
            force 'androidx.core:core:1.16.0'
            force 'androidx.core:core-ktx:1.16.0'
            force 'androidx.versionedparcelable:versionedparcelable:1.2.0'
            exclude group: 'com.android.support', module: 'support-compat'
            exclude group: 'com.android.support', module: 'support-v4'
            exclude group: 'com.android.support', module: 'versionedparcelable'
        }`
        );
      }
    }
    return config;
  });

  // 2. Modify gradle.properties to enable Jetifier
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.enableJetifier',
      value: 'true',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.useAndroidX',
      value: 'true',
    });
    return config;
  });

  return config;
};

module.exports = withAndroidXFix;
