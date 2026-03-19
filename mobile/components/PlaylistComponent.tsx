import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MongoSong } from '../context/PlayerContext';

interface PlaylistProps {
    playlist: MongoSong[];
    currentSongIndex: number;
    emotion: string;
    onSongSelect: (index: number) => void;
}

export default function PlaylistComponent({ playlist, currentSongIndex, emotion, onSongSelect }: PlaylistProps) {
    if (!playlist || playlist.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>
                    UP NEXT • {emotion.toUpperCase()}
                </Text>
                <Text style={styles.countText}>{playlist.length} songs</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.listContainer}>
                {playlist.map((item, index) => {
                    const isPlaying = index === currentSongIndex;
                    return (
                        <TouchableOpacity
                            key={item._id?.toString() || index.toString()}
                            style={[styles.songRow, isPlaying && styles.activeRow]}
                            onPress={() => onSongSelect(index)}
                        >
                            <View style={styles.songIconCol}>
                                {isPlaying ? (
                                    <Ionicons name="stats-chart" size={16} color="#1DB954" />
                                ) : (
                                    <Text style={styles.indexText}>{index + 1}</Text>
                                )}
                            </View>

                            <View style={styles.songDetails}>
                                <Text style={[styles.songTitle, isPlaying && { color: '#1DB954' }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text style={styles.songArtist} numberOfLines={1}>
                                    {item.artist}
                                </Text>
                            </View>

                            <Ionicons name="heart-outline" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20,
        marginBottom: 60,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    header: {
        fontSize: 12,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    countText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    listContainer: {
        width: '100%',
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        paddingHorizontal: 10,
    },
    activeRow: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    songIconCol: {
        width: 25,
        alignItems: 'flex-start',
    },
    indexText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '500',
    },
    songDetails: {
        flex: 1,
        paddingRight: 15,
    },
    songTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    songArtist: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
    }
});
