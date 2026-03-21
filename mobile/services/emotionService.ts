import { pythonApi } from './api';

export const detectEmotionFromImage = async (base64String: string): Promise<{ emotion: string; confidence: number; secondary_emotion?: string | null }> => {
  try {
    const response = await pythonApi.post('/detect_emotion', { image_base64: base64String });
    if (response.data.success) {
      const emo = response.data.dominant_emotion;
      const confNum = parseFloat(response.data.emotion_scores[emo].toFixed(1));
      return { 
        emotion: emo, 
        confidence: confNum, 
        secondary_emotion: response.data.secondary_emotion || null 
      };
    } else {
      throw new Error(response.data.error || 'Face detection failed');
    }
  } catch (error) {
    console.error("Emotion detection error:", error);
    throw error;
  }
};
