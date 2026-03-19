import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Dimensions, Animated, Easing, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePlayer } from '../../context/PlayerContext';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import { detectEmotionFromImage } from '../../services/emotionService';
import { startVoiceRecognition, detectToneFromText } from '../../services/voiceService';
import { nodeApi } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentSong, playbackState, togglePlayPause, playPlaylist, emotion: globalEmotion } = usePlayer();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [weather, setWeather] = useState<{ temp: number, condition: string, city: string } | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [confidence, setConfidence] = useState(0);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
            const location = await Location.getCurrentPositionAsync({});
            setWeather({
              temp: 24,
              condition: Math.random() > 0.7 ? 'Rainy' : 'Sunny',
              city: 'Local Area'
            });
        } catch (e) {
            console.warn("Location fetch failed", e);
        }
      }
    })();
  }, []);

  const handleVoiceStart = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
        alert("Microphone permission is required to detect your vibe.");
        return;
    }

    setIsListening(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await startVoiceRecognition(
      (text) => {
        setIsListening(false);
        analyzeEmotion(null, text);
      },
      (error) => {
        setIsListening(false);
        alert("Native Voice Blocked! Tip: Tap the Text-box below and use the powerful 🎤 Microphone button on your phone's native keyboard to seamlessly speak exactly how you feel!");
      }
    );
  };

  const getEmojiForEmotion = (emo: string) => {
    switch (emo) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😡';
      case 'neutral': return '😐';
      case 'surprise': return '😲';
      case 'fear': return '😨';
      case 'disgust': return '🤢';
      default: return '🙂';
    }
  };

  const getGradientColors = (emo: string): readonly [string, string, ...string[]] => {
    switch (emo) {
      case 'happy': return ['#FDE68A', '#FEF3C7', '#F3F4F6'];
      case 'sad': return ['#93C5FD', '#BFDBFE', '#F3F4F6'];
      case 'angry': return ['#FCA5A5', '#FECACA', '#F3F4F6'];
      case 'neutral': return ['#6EE7B7', '#A7F3D0', '#F3F4F6'];
      case 'surprise': return ['#C4B5FD', '#DDD6FE', '#F3F4F6'];
      case 'fear': return ['#4B5563', '#9CA3AF', '#F3F4F6'];
      case 'disgust': return ['#059669', '#34D399', '#F3F4F6'];
      default: return ['#E0F2FE', '#F0F9FF', '#F3F4F6'];
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    if (!result.canceled) handleImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) return alert("Camera access required");
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    if (!result.canceled) handleImage(result.assets[0]);
  };

  const handleImage = (asset: any) => {
    setImageUri(asset.uri);
    analyzeEmotion(asset.base64);
  };

  const analyzeEmotion = async (base64String: string | null | undefined, voiceIntent?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let emo = 'neutral';
      let confNum = 100;
      if (base64String) {
        const result = await detectEmotionFromImage(base64String);
        emo = result.emotion;
        confNum = result.confidence;
      } else if (voiceIntent) {
        emo = detectToneFromText(voiceIntent);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (base64String) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const params = new URLSearchParams({
        emotion: emo,
        weather: weather?.condition.toLowerCase() || '',
        intent: voiceIntent || '',
        session: Math.random().toString(36).substring(7)
      });
      // Utilizing centralized API service nodeApi
      const playlistResponse = await nodeApi.get(`/api/songs?${params.toString()}`);
      const playlist = playlistResponse.data;

      setDetectedEmotion(emo);
      setConfidence(confNum);
      setIsTransitioning(true);
      
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playPlaylist(playlist, 0, emo, confNum);
        setIsTransitioning(false);
        setImageUri(null);
        router.navigate('/player');
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with Vibo AI servers');
    } finally {
      setLoading(false);
    }
  };

  if (isTransitioning) {
    return (
      <LinearGradient colors={getGradientColors(detectedEmotion)} style={styles.transitionContainer}>
        <Text style={styles.transitionEmoji}>{getEmojiForEmotion(detectedEmotion)}</Text>
        <Text style={styles.transitionTitle}>Generating your Vibo...</Text>
        <Text style={styles.confidenceText}>{detectedEmotion.toUpperCase()} detected • {confidence}% confidence</Text>
        <ActivityIndicator size="large" color="#1F2937" style={{ marginVertical: 40 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={getGradientColors(globalEmotion || 'neutral')} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Vibo AI</Text>
            {weather && (
              <View style={styles.weatherWidget}>
                <Ionicons name={weather.condition === 'Sunny' ? 'sunny' : 'rainy'} size={18} color="#F59E0B" />
                <Text style={styles.weatherText}>{weather.city} • {weather.condition} {weather.temp}°C</Text>
              </View>
            )}
            <Text style={styles.subtitle}>Personalized music for every vibe.</Text>
          </View>

          <Animated.View style={[styles.cameraPanel, { transform: [{ scale: pulseAnim }], shadowColor: getGradientColors(globalEmotion || 'neutral')[0], shadowRadius: 30, shadowOpacity: 0.8 }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="scan-outline" size={100} color="#E5E7EB" />
                <Text style={styles.placeholderText}>Scan face to start</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.btnGradient}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                  <Text style={styles.btnText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#4F46E5" />
                <Text style={styles.secondaryText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity style={[styles.voiceTrigger, isListening && styles.listeningMode]} onPress={handleVoiceStart}>
            <Ionicons name={isListening ? "pulse" : "mic"} size={32} color="#FFF" />
            <Text style={styles.voiceLabel}>{isListening ? "Listening..." : '"Hey Vibo"'}</Text>
          </TouchableOpacity>

          <View style={styles.textInputBox}>
            <TextInput 
              placeholder="Or manually type your vibe here..." 
              placeholderTextColor="#9CA3AF" 
              style={styles.textInputStyle} 
              onSubmitEditing={(e) => {
                if (e.nativeEvent.text.trim()) {
                  analyzeEmotion(null, e.nativeEvent.text);
                }
              }} 
            />
            <Ionicons name="send" size={20} color="#4F46E5" />
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Syncing vibes...</Text>
            </View>
          )}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  mainContent: { padding: 24, alignItems: 'center' },
  header: { width: '100%', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 40, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  weatherWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, marginTop: 12, elevation: 2 },
  weatherText: { fontSize: 14, color: '#4B5563', marginLeft: 8, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 12, textAlign: 'center' },
  cameraPanel: { width: '100%', backgroundColor: '#FFF', borderRadius: 32, padding: 24, alignItems: 'center', elevation: 10 },
  imagePreview: { width: width - 80, height: 320, borderRadius: 24, marginBottom: 24 },
  placeholderContainer: { width: width - 80, height: 320, borderRadius: 24, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E5E7EB' },
  placeholderText: { fontSize: 18, color: '#9CA3AF', marginTop: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 16 },
  actionBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#4F46E5', borderRadius: 16, gap: 8 },
  secondaryText: { color: '#4F46E5', fontSize: 16, fontWeight: '800' },
  voiceTrigger: { backgroundColor: '#111827', paddingHorizontal: 32, paddingVertical: 20, borderRadius: 40, flexDirection: 'row', alignItems: 'center', marginTop: 40, elevation: 15 },
  listeningMode: { backgroundColor: '#7C3AED' },
  voiceLabel: { color: '#FFF', marginLeft: 16, fontSize: 20, fontWeight: '900' },
  textInputBox: { marginTop: 16, marginHorizontal: 32, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, elevation: 2, width: width - 64 },
  textInputStyle: { flex: 1, height: 50, color: '#111827', fontSize: 16, fontWeight: '500' },
  loadingOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', borderRadius: 32 },
  loadingText: { marginTop: 12, color: '#4F46E5', fontWeight: 'bold' },
  errorText: { color: '#EF4444', marginTop: 24, textAlign: 'center', fontWeight: '600' },
  transitionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  transitionEmoji: { fontSize: 80, marginBottom: 24 },
  transitionTitle: { fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center' },
  confidenceText: { fontSize: 16, color: '#4B5563', marginTop: 8, fontWeight: '600' },
});
