const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidSpeech(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = [];
    }
    // Force Android 11+ OS to physically expose the Speech Recognizer to Vibo
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [
            { $: { "android:name": "android.speech.RecognitionService" } }
          ]
        }
      ]
    });
    return config;
  });
};
