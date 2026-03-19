import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Dimensions, Animated, Easing, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePlayer } from '../../context/PlayerContext';

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

    return (
        <LinearGradient
            colors={[themeColor, '#121212']}
            locations={[0, 0.5]}
            style={styles.background}
        >
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

                        <View style={styles.emotionBadge}>
                            <Text style={styles.emotionEmoji}>{getEmoji(emotion)}</Text>
                            <Text style={styles.emotionText}>{emotion.toUpperCase()}</Text>
                        </View>
                    </View>

                    <MusicPlayerComponent
                        currentSong={currentSong}
                        emotion={emotion}
                        onNext={nextSong}
                        onPrev={prevSong}
                    />

                    <PlaylistComponent
                        playlist={currentPlaylist}
                        currentSongIndex={currentIndex}
                        emotion={emotion}
                        onSongSelect={(idx) => playPlaylist(currentPlaylist, idx, emotion, 0.9)}
                    />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
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
    emotionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
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
    }
});
