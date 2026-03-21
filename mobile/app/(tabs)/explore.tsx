import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FDE68A', dark: '#1F2937' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#FEF3C7"
          name="sparkles"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Vibo AI Guide
        </ThemedText>
      </ThemedView>
      <ThemedText>Welcome to Vibo AI 3.0. Here is how to get the most out of your experience.</ThemedText>
      
      <Collapsible title="Emotion Detection">
        <ThemedText>
          Vibo AI uses advanced DeepFace models to analyze your facial expressions and detect 7 key emotions: Happy, Sad, Angry, Neutral, Surprise, Fear, and Disgust.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Hey Vibo Voice Commands">
        <ThemedText>
          Simply tap the microphone icon or use the text box to say how you feel. Vibo understands your tone and intent to curate the perfect playlist.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Spotify Integration">
        <ThemedText>
          Vibo AI is powered by the Spotify Web API, giving you access to millions of tracks. It dynamically adjusts recommendation parameters like Valence and Energy to match your mood.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Generative UI">
        <ThemedText>
          The interface color palette and animations shift in real-time based on your detected vibe, creating a fully immersive emotional experience.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Privacy & History">
        <ThemedText>
          Your data is stored locally on your device. You can clear your history anytime in the Settings tab.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
