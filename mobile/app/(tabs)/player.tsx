import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Dimensions, Animated, Easing, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePlayer } from '../../context/PlayerContext';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const emotionTheme: Record<string, string> = {
    happy: "#FFD54F",
    sad: "#1E3A5F",
    calm: "#81C784",
    angry: "#E53935",
    surprise: "#9C27B0",
    neutral: "#81C784",
    fear: "#1E3A5F",
    disgust: "#E53935",
};

const getEmoji = (emo: string) => {
    switch (emo) {
        case 'happy': return '😊';
        case 'sad': return '😢';
        case 'angry': return '😡';
        case 'calm': return '😌';
        case 'neutral': return '😐';
        case 'surprise': return '😲';
        default: return '😌';
    }
};

import MusicPlayerComponent from '../../components/MusicPlayerComponent';
import PlaylistComponent from '../../components/PlaylistComponent';

export default function PlayerScreen() {
    const { currentSong, currentPlaylist, currentIndex, emotion, nextSong, prevSong, playPlaylist, playbackState } = usePlayer();
    const viewShotRef = React.useRef<any>(null);

    const shareVibe = async () => {
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Share your Vibo AI Vibe!',
                    mimeType: 'image/jpeg',
                });
            }
        } catch (error) {
            console.error("Error sharing vibe card:", error);
            Alert.alert("Share Failed", "Could not generate the vibe card.");
        }
    };

    if (!currentSong) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="musical-notes-outline" size={80} color="#9CA3AF" />
                <Text style={styles.emptyText}>No music playing</Text>
                <Text style={styles.subText}>Detect your emotion on the Home screen to start a playlist.</Text>
            </View>
        );
    }

    const themeColor = emotionTheme[emotion] || "#1E3A5F";

    const floatAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: 1, duration: 8000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(floatAnim, { toValue: 0, duration: 8000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();
    }, []);

    const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
    const scaleX = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
    const scaleY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });

    return (
        <View style={[styles.background, { backgroundColor: '#0A0A0A' }]}>
            {/* Ambient Liquid Gradient Orb */}
            <Animated.View style={[
                StyleSheet.absoluteFill, 
                { opacity: 0.85, transform: [{ translateY }, { scaleX }, { scaleY }] }
            ]}>
                <LinearGradient
                    colors={[themeColor, 'transparent']}
                    locations={[0, 0.7]}
                    style={{
                        position: 'absolute',
                        top: -width * 0.4,
                        left: -width * 0.5,
                        width: width * 2,
                        height: width * 2,
                        borderRadius: width,
                    }}
                />
            </Animated.View>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.navigate('/')} style={styles.backButton}>
                            <Ionicons name="chevron-down" size={32} color="white" />
                        </TouchableOpacity>

                        <View style={styles.brandTitleContainer}>
                            <Text style={styles.brandTitle}>VIBO</Text>
                            <View style={styles.brandDot} />
                        </View>

                        <TouchableOpacity style={styles.shareBadge} onPress={shareVibe}>
                            <Ionicons name="share-social" size={18} color="white" style={{ marginRight: 6 }} />
                            <Text style={styles.emotionEmoji}>{getEmoji(emotion)}</Text>
                            <Text style={styles.emotionText}>SHARE</Text>
                        </TouchableOpacity>
                    </View>

                    <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.viewShotContainer}>
                        <LinearGradient colors={[themeColor, '#121212']} style={styles.watermarkGradient}>
                            <View style={styles.watermarkHeader}>
                                <Text style={styles.watermarkText}>VIBO AI APP</Text>
                                <Text style={styles.watermarkEmotion}>{getEmoji(emotion)} {emotion.toUpperCase()}</Text>
                            </View>
                            
                            <MusicPlayerComponent
                                currentSong={currentSong}
                                emotion={emotion}
                                onNext={nextSong}
                                onPrev={prevSong}
                            />
                        </LinearGradient>
                    </ViewShot>

                    <PlaylistComponent
                        playlist={currentPlaylist}
                        currentSongIndex={currentIndex}
                        emotion={emotion}
                        onSongSelect={(idx) => playPlaylist(currentPlaylist, idx, emotion, 0.9)}
                    />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    brandTitleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 2,
    },
    brandDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4F46E5',
        marginLeft: 2,
    },
    shareBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    emotionEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    emotionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 20,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
    },
    subText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 10,
    },
    viewShotContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    watermarkGradient: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        width: '100%',
    },
    watermarkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    watermarkText: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    watermarkEmotion: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
    }
});
