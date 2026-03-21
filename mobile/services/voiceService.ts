import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { nodeApi } from './api';

const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ['happy', 'great', 'awesome', 'excited', 'good', 'joy', 'wonderful', 'party', 'dance', 'fun', 'love'],
  sad: ['sad', 'low', 'depressed', 'crying', 'broken', 'lonely', 'bad', 'pain', 'hurting', 'heavy'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'hate', 'fight', 'pump', 'strong', 'aggressive'],
  neutral: ['neutral', 'calm', 'relax', 'peace', ' chill', 'okay', 'fine', 'study', 'sleep'],
  surprise: ['wow', 'amazing', 'shock', 'unbelievable', 'magic', 'omg', 'surprise'],
  fear: ['scared', 'afraid', 'horror', 'fear', 'ghost', 'spooky', 'dark'],
  disgust: ['ew', 'gross', 'disgust', 'hate', 'bad', 'nasty']
};

export const detectToneFromText = (text: string): string => {
  const lowerText = text.toLowerCase();
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return mood;
    }
  }
  return 'neutral';
};

export const startVoiceRecognition = async (
  onResult: (text: string) => void,
  onError: (error: any) => void
) => {
  let recording: Audio.Recording | null = null;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const customWavPreset = {
        isMeteringEnabled: true,
        android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
        },
        ios: {
            extension: '.wav',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
        },
    };

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(customWavPreset);
    await recording.startAsync();

    // Force precisely a 4-second recording burst for analysis
    setTimeout(async () => {
      try {
        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        
        if (!uri) throw new Error("Audio recording URI failed.");

        // Convert the binary wav file seamlessly to Base64
        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        // Pipe directly to Node API
        const response = await nodeApi.post('/api/transcribe', { audio_base64: audioBase64 });
        
        if (response.data && response.data.text) {
          onResult(response.data.text);
        } else {
            // Did not hear anything clearly
            onError(new Error("Voice unclear. Please try again."));
        }
      } catch (timeoutErr) {
        console.error("Audio Encoding/Upload Failed:", timeoutErr);
        onError(timeoutErr);
      }
    }, 4000);

  } catch (err) {
    console.error("Microphone Start Error:", err);
    onError(err);
  }
};
