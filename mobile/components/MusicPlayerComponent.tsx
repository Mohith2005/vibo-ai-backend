import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { MongoSong, usePlayer } from '../context/PlayerContext';
import PlaylistComponent from './PlaylistComponent';

const { width } = Dimensions.get('window');

interface MusicPlayerProps {
  currentSong: MongoSong | null;
  emotion: string;
  onNext: () => void;
  onPrev: () => void;
}

const formatTime = (millis: number) => {
  if (!millis || isNaN(millis)) return '0:00';
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function MusicPlayerComponent({ currentSong, emotion, onNext, onPrev }: MusicPlayerProps) {
  const {
    playbackState,
    togglePlayPause,
    seekTo,
    isRepeat,
    isShuffle,
    toggleRepeat,
    toggleShuffle,
    sleepTimer,
    setSleepTimer,
    shareVibe
  } = usePlayer();

  const [timerModalVisible, setTimerModalVisible] = React.useState(false);
  const [customTimeInput, setCustomTimeInput] = React.useState('');

  if (!currentSong) return null;

  const handleSetTimer = (minutes: number | null) => {
    setSleepTimer(minutes);
    setTimerModalVisible(false);
    if (minutes) {
        Alert.alert("Timer Set", `Vibo will pause in ${minutes} minutes.`);
    }
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customTimeInput);
    if (!isNaN(mins) && mins > 0) {
        handleSetTimer(mins);
        setCustomTimeInput('');
    } else {
        Alert.alert("Invalid Time", "Please enter a valid number of minutes.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Premium Sleep Timer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={timerModalVisible}
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setTimerModalVisible(false)}
        >
            <View style={styles.modalContent}>
                <LinearGradient
                    colors={['#1F2937', '#111827']}
                    style={styles.modalGradient}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sleep Timer</Text>
                        <TouchableOpacity onPress={() => setTimerModalVisible(false)}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>How long should Vibo play?</Text>

                    <View style={styles.timerGrid}>
                        {[15, 30, 45, 60].map((m) => (
                            <TouchableOpacity 
                                key={m} 
                                style={[styles.timerChip, sleepTimer === m && styles.timerChipActive]}
                                onPress={() => handleSetTimer(m)}
                            >
                                <Text style={styles.timerChipText}>{m}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.customInputRow}>
                        <TextInput
                            style={styles.customInput}
                            placeholder="Custom mins..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            keyboardType="numeric"
                            value={customTimeInput}
                            onChangeText={setCustomTimeInput}
                        />
                        <TouchableOpacity 
                            style={styles.customSetBtn}
                            onPress={handleCustomTimer}
                        >
                            <Ionicons name="arrow-forward" size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.offBtn}
                        onPress={() => handleSetTimer(null)}
                    >
                        <Text style={styles.offBtnText}>Turn Off Timer</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.coverWrapper}>
        <Image 
          source={{ uri: currentSong.coverImage }} 
          style={styles.coverImage} 
        />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.textColumn}>
          <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist} • {currentSong.movie}</Text>
        </View>
        <TouchableOpacity onPress={shareVibe}>
            <Ionicons name="share-social-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={isNaN(playbackState.progress) ? 0 : playbackState.progress}
          onSlidingComplete={(val) => seekTo(val)}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(playbackState.position)}</Text>
          <Text style={styles.timeText}>
            {sleepTimer ? `[Timer: ${sleepTimer}m] ` : ''}
            {formatTime(playbackState.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={toggleShuffle} style={styles.sideBtn}>
          <Ionicons name="shuffle" size={24} color={isShuffle ? "#1DB954" : "rgba(255,255,255,0.6)"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPrev} style={styles.skipBtn}>
          <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
          <View style={styles.playBtnCircle}>
            <Ionicons name={playbackState.isPlaying ? "pause" : "play"} size={36} color="#000000" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} style={styles.skipBtn}>
          <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeat} style={styles.sideBtn}>
          <Ionicons name="repeat" size={24} color={isRepeat ? "#1DB954" : "rgba(255,255,255,0.6)"} />
        </TouchableOpacity>
      </View>

      <View style={styles.extraControls}>
        <TouchableOpacity style={styles.extraBtn} onPress={() => setTimerModalVisible(true)}>
          <Ionicons name="timer-outline" size={22} color={sleepTimer ? "#FFD54F" : "rgba(255,255,255,0.8)"} />
          <Text style={[styles.extraText, sleepTimer ? { color: "#FFD54F" } : null]}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.extraBtn} onPress={shareVibe}>
          <Ionicons name="sparkles-outline" size={22} color="rgba(255,255,255,0.8)" />
          <Text style={styles.extraText}>Share Vibe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  coverWrapper: {
    width: width - 60,
    height: width - 60,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 40,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  textColumn: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  songArtist: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  controlsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  playBtn: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 5,
  },
  skipBtn: {
    padding: 10,
  },
  sideBtn: {
    padding: 10,
  },
  extraControls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 32,
    marginTop: 10,
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  extraText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  modalGradient: {
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  timerChip: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timerChipActive: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFD54F',
  },
  timerChipText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customInputRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    height: 50,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  customSetBtn: {
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offBtn: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  offBtnText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
