import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

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
  try {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        onResult(e.value[0]);
        Voice.stop();
        Voice.destroy();
      }
    };
    Voice.onSpeechError = (e: any) => {
      onError(e);
      Voice.destroy();
    };
    await Voice.start('en-US');
  } catch (err) {
    onError(err);
  }
};
