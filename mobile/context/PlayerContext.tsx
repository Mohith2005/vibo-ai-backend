import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import { nodeApi, getApiUrl } from '../services/api';
import { playerService } from '../services/playerService';

export interface MongoSong {
    _id: string;
    title: string;
    artist: string;
    movie: string;
    emotion: string;
    audioUrl: string;
    coverImage: string;
    duration?: number;
}

export interface PlaybackState {
    isPlaying: boolean;
    progress: number;
    position: number;
    duration: number;
}

export interface EmotionRecord {
    _id: string;
    detectedAt: string;
    emotion: string;
    confidence: number;
    songPlayed: {
        _id: string;
        title: string;
        artist: string;
    };
}

interface PlayerContextData {
    currentSong: MongoSong | null;
    currentPlaylist: MongoSong[];
    currentIndex: number;
    emotion: string;
    playbackState: PlaybackState;
    emotionHistory: EmotionRecord[];
    isRepeat: boolean;
    isShuffle: boolean;
    sleepTimer: number | null;
    setSleepTimer: (minutes: number | null) => void;
    playPlaylist: (playlist: MongoSong[], startIndex: number, emo: string, conf: number) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    nextSong: () => Promise<void>;
    prevSong: () => Promise<void>;
    seekTo: (value: number) => Promise<void>;
    fetchHistory: () => Promise<void>;
    clearHistory: () => Promise<void>;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
    shareVibe: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextData | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentSong, setCurrentSong] = useState<MongoSong | null>(null);
    const [currentPlaylist, setCurrentPlaylist] = useState<MongoSong[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [emotion, setEmotion] = useState('neutral');
    const [latestConfidence, setLatestConfidence] = useState(0);

    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const isRepeatRef = useRef(false);
    const isShuffleRef = useRef(false);

    useEffect(() => {
        isRepeatRef.current = isRepeat;
        isShuffleRef.current = isShuffle;
    }, [isRepeat, isShuffle]);

    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        isPlaying: false,
        progress: 0,
        position: 0,
        duration: 1,
    });

    const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
    const [sleepTimer, setSleepTimerState] = useState<number | null>(null);

    const setSleepTimer = (minutes: number | null) => {
        setSleepTimerState(minutes);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sleepTimer !== null && sleepTimer > 0) {
            interval = setInterval(() => {
                setSleepTimerState(prev => (prev && prev > 1 ? prev - 1 : 0));
            }, 60000);
        } else if (sleepTimer === 0) {
            if (playbackState.isPlaying) {
                playerService.pause();
            }
            setSleepTimerState(null);
        }
        return () => clearInterval(interval);
    }, [sleepTimer]);

    const shareVibe = async () => {
        if (!currentSong) return;
        const message = `Check out my vibe on Vibo AI! 🎵\n\nFeeling: ${emotion.toUpperCase()}\nListening to: ${currentSong.title} by ${currentSong.artist}\n\nJoin the Vibo community!`;
        try {
            await Share.share({ message, title: 'Share my Vibo' });
        } catch (e) {
            console.error('Sharing failed', e);
        }
    };

    const fetchHistory = async () => {
        try {
            const resp = await nodeApi.get('/api/emotion-history');
            setEmotionHistory(resp.data);
            await AsyncStorage.setItem('vibe_history', JSON.stringify(resp.data));
        } catch (e) {
            console.warn('Server history fetch failed, trying local cache...');
            const local = await AsyncStorage.getItem('vibe_history');
            if (local) setEmotionHistory(JSON.parse(local));
        }
    };

    useEffect(() => {
        fetchHistory();
        return () => {
            playerService.cleanup();
        };
    }, []);

    const addToHistory = async (emo: string, conf: number, songId: string) => {
        try {
            await nodeApi.post('/api/emotion', {
                userId: null,
                emotion: emo,
                confidence: conf,
                songPlayed: songId
            });
            await fetchHistory();
        } catch (e) {
            console.error('Failed to save history to server');
        }
    };

    const clearHistory = async () => {
        setEmotionHistory([]);
        await AsyncStorage.removeItem('vibe_history');
    };

    const nextSongRef = useRef<(() => Promise<void>) | null>(null);

    const loadAndPlayAudio = async (song: MongoSong, emo: string, conf: number) => {
        try {
            const statusCallback = (status: AVPlaybackStatus) => {
                if (status.isLoaded) {
                    setPlaybackState({
                        isPlaying: status.isPlaying,
                        progress: status.positionMillis / (status.durationMillis || 1),
                        position: status.positionMillis,
                        duration: status.durationMillis || 1,
                    });

                    if (status.didJustFinish) {
                        if (isRepeatRef.current) {
                            playerService.setPosition(0);
                            playerService.play();
                        } else if (nextSongRef.current) {
                            nextSongRef.current();
                        }
                    }
                }
            };

            const backendUrl = getApiUrl();
            const secureAudioStream = song.audioUrl.startsWith('http') ? song.audioUrl : `${backendUrl}${song.audioUrl}`;

            await playerService.loadAndPlay(secureAudioStream, statusCallback);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            addToHistory(emo, conf, song._id);
            setCurrentSong(song);
            setEmotion(emo);

        } catch (err) {
            console.warn("Audio URl loading failed.", err);
            setCurrentSong(song);
            setEmotion(emo);
            setPlaybackState({ isPlaying: true, progress: 0, position: 0, duration: 1 });
        }
    };

    const playPlaylist = async (playlist: MongoSong[], startIndex: number, emo: string, conf: number) => {
        if (!playlist || playlist.length === 0) return;
        setCurrentPlaylist(playlist);
        setCurrentIndex(startIndex);
        setLatestConfidence(conf);
        await loadAndPlayAudio(playlist[startIndex], emo, conf);
    };

    const togglePlayPause = async () => {
        if (playbackState.isPlaying) {
            await playerService.pause();
        } else {
            await playerService.play();
        }
        setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    const nextSong = async () => {
        if (currentPlaylist.length === 0) return;
        let nextIdx = 0;
        if (isShuffleRef.current) {
            nextIdx = Math.floor(Math.random() * currentPlaylist.length);
        } else {
            nextIdx = (currentIndex + 1) % currentPlaylist.length;
        }
        setCurrentIndex(nextIdx);
        await loadAndPlayAudio(currentPlaylist[nextIdx], emotion, latestConfidence);
    };

    const prevSong = async () => {
        if (currentPlaylist.length === 0) return;
        const prevIdx = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        setCurrentIndex(prevIdx);
        await loadAndPlayAudio(currentPlaylist[prevIdx], emotion, latestConfidence);
    };

    nextSongRef.current = nextSong;

    const seekTo = async (value: number) => {
        await playerService.setPosition(value * playbackState.duration);
    };

    const toggleRepeat = () => setIsRepeat(!isRepeat);
    const toggleShuffle = () => setIsShuffle(!isShuffle);

    return (
        <PlayerContext.Provider value={{
            currentSong,
            currentPlaylist,
            currentIndex,
            emotion,
            playbackState,
            emotionHistory,
            isRepeat,
            isShuffle,
            sleepTimer,
            setSleepTimer,
            playPlaylist,
            togglePlayPause,
            nextSong,
            prevSong,
            seekTo,
            fetchHistory,
            clearHistory,
            toggleRepeat,
            toggleShuffle,
            shareVibe
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};
