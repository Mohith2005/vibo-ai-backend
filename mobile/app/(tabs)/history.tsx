import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { usePlayer, EmotionRecord } from '../../context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HistoryScreen() {
    const { emotionHistory, clearHistory, playPlaylist } = usePlayer();
    const [showMoodBooster, setShowMoodBooster] = useState(false);
    const [stats, setStats] = useState({ topEmotion: '-', totalScans: 0 });

    // Check for smart mood booster (2 consecutive sad emotions)
    useEffect(() => {
        if (emotionHistory.length >= 2) {
            if (emotionHistory[0].emotion === 'sad' && emotionHistory[1].emotion === 'sad') {
                setShowMoodBooster(true);
            } else {
                setShowMoodBooster(false);
            }
        } else {
            setShowMoodBooster(false);
        }
    }, [emotionHistory]);

    useEffect(() => {
        if (emotionHistory.length > 0) {
            const counts: any = {};
            emotionHistory.forEach(h => counts[h.emotion] = (counts[h.emotion] || 0) + 1);
            const top = Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b);
            setStats({ topEmotion: top || '-', totalScans: emotionHistory.length });
        } else {
            setStats({ topEmotion: '-', totalScans: 0 });
        }
    }, [emotionHistory]);

    const handleClear = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete your emotion reading history?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearHistory }
            ]
        );
    };

    const getEmojiForEmotion = (emo: string) => {
        switch (emo.toLowerCase()) {
            case 'happy': return '😊';
            case 'sad': return '😢';
            case 'angry': return '😡';
            case 'neutral': return '😐';
            case 'surprise': return '😲';
            case 'fear': return '😨';
            case 'disgust': return '🤢';
            case 'calm': return '😌';
            default: return '🙂';
        }
    };

    const getEmotionColor = (emo: string) => {
        switch (emo.toLowerCase()) {
            case 'happy': return '#FCD34D';
            case 'sad': return '#60A5FA';
            case 'angry': return '#F87171';
            case 'neutral': return '#34D399';
            case 'surprise': return '#A78BFA';
            case 'fear': return '#9CA3AF';
            case 'disgust': return '#059669';
            case 'calm': return '#6EE7B7';
            default: return '#D1D5DB';
        }
    };

    const formatTime = (isoString: string) => {
        try {
            const d = new Date(isoString);
            return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString()}`;
        } catch (e) { return 'Just now'; }
    };

    const renderItem = ({ item }: { item: EmotionRecord }) => (
        <TouchableOpacity 
            style={styles.historyCard}
            onPress={() => router.navigate('/player')}
        >
            <View style={styles.cardEmojiContainer}>
                <Text style={styles.emoji}>{getEmojiForEmotion(item.emotion)}</Text>
            </View>
            <View style={styles.cardDetails}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.songPlayed?.title || 'Relieving stress...'}</Text>
                <Text style={styles.timeText}>{formatTime(item.detectedAt)}</Text>
            </View>
            <View style={styles.metaCol}>
                <View style={[styles.emotionPill, { backgroundColor: item.confidence > 80 ? '#ECFDF5' : '#F9FAFB' }]}>
                    <Text style={[styles.emotionText, { color: item.confidence > 80 ? '#059669' : '#6B7280' }]}>{item.emotion.toUpperCase()}</Text>
                </View>
                <Text style={styles.confText}>{Math.round(item.confidence)}% match</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.brandContainer}>
                    <Text style={styles.title}>Vibo History</Text>
                    <View style={styles.brandDot} />
                </View>
                {emotionHistory.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Mood Dashboard */}
                <View style={styles.dashboard}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Dominant Mood</Text>
                        <Text style={styles.statValue}>{stats.topEmotion.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
                        <Text style={styles.statLabel}>Vibe Streak</Text>
                        <Text style={styles.statValue}>{stats.totalScans} 🔥</Text>
                    </View>
                </View>

                {/* Vibe Pattern Timeline */}
                {emotionHistory.length > 0 && (
                    <View style={styles.timelineContainer}>
                        <Text style={styles.timelineLabel}>Your Vibe Pattern (Last 10)</Text>
                        <View style={styles.timelineRow}>
                            {emotionHistory.slice(0, 10).reverse().map((item, idx) => (
                                <View key={idx} style={styles.timelineDotWrapper}>
                                    <View style={[styles.timelineDot, { backgroundColor: getEmotionColor(item.emotion) }]} />
                                    {idx < Math.min(emotionHistory.length, 10) - 1 && <View style={styles.timelineLine} />}
                                </View>
                            ))}
                        </View>
                        <Text style={styles.timelineSubText}>
                            {emotionHistory[0].emotion === 'happy' ? "You're ending the week on a high note! 🌟" : "Keep tracking to build a beautiful emotional mosaic."}
                        </Text>
                    </View>
                )}

                {/* Smart Mood Booster Banner */}
                {showMoodBooster && (
                    <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.moodBooster}>
                        <View style={styles.boosterContent}>
                            <Ionicons name="sparkles" size={24} color="#3B82F6" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.boosterTitle}>Smart Mood Tracker 🌧️</Text>
                                <Text style={styles.boosterText}>You've been feeling sad lately. Need a boost?</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.boosterBtn}
                            onPress={() => {
                                Alert.alert("Mood Booster Activated!", "Head to the Home screen and let's turn that frown upside down!");
                                router.navigate('/');
                            }}
                        >
                            <Text style={styles.boosterBtnText}>Boost My Mood</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )}

                {emotionHistory.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={80} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No reading history yet.</Text>
                        <Text style={styles.emptySub}>Start scanning your face to track your vibes.</Text>
                    </View>
                ) : (
                    <View style={styles.listWrapper}>
                        <Text style={styles.sectionTitle}>Recent Sessions</Text>
                        {emotionHistory.map((item, index) => (
                            <View key={item._id || index}>
                                {renderItem({ item })}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4F46E5',
        marginLeft: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1F2937',
        letterSpacing: -0.5,
    },
    clearBtn: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
    },
    dashboard: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        margin: 20,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
    },
    timelineContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    timelineLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    timelineDotWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    timelineLine: {
        width: 20,
        height: 2,
        backgroundColor: '#E5E7EB',
    },
    timelineSubText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
        fontStyle: 'italic',
    },
    moodBooster: {
        margin: 20,
        marginTop: 0,
        padding: 15,
        borderRadius: 20,
        elevation: 2,
    },
    boosterContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    boosterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E3A8A',
    },
    boosterText: {
        fontSize: 13,
        color: '#1E40AF',
    },
    boosterBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    boosterBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    listWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 15,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardEmojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    emoji: {
        fontSize: 28,
    },
    cardDetails: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    metaCol: {
        alignItems: 'flex-end',
    },
    confText: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 4,
        fontWeight: '500',
    },
    emotionPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emotionText: {
        fontSize: 11,
        fontWeight: '800',
    },
    emptyContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 15,
    },
    emptySub: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 5,
        textAlign: 'center',
    }
});
