import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../../context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setApiUrls, getApiUrl, getPyUrl } from '../../services/api';

export default function SettingsScreen() {
    const { clearHistory } = usePlayer();

    const [nodeUrl, setNodeUrl] = useState(getApiUrl());
    const [pyUrl, setPyUrl] = useState(getPyUrl());

    useEffect(() => {
        setNodeUrl(getApiUrl());
        setPyUrl(getPyUrl());
    }, []);

    const handleClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all emotion and listening history?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: async () => {
                    await clearHistory();
                    Alert.alert("Success", "Your history has been cleared.");
                }}
            ]
        );
    };

    const handleSaveNetwork = async () => {
        await setApiUrls(nodeUrl, pyUrl);
        Alert.alert('Network Link Saved!', 'The app will now forcefully route all traffic to these custom URLs to bypass any carrier firewalls.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <Text style={styles.title}>Vibo Settings</Text>
                        <View style={styles.brandDot} />
                    </View>
                    <Text style={styles.subtitle}>Manage your Vibo AI experience</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="hardware-chip-outline" size={24} color="#4F46E5" />
                        <Text style={styles.sectionTitleD}>Developer Network Override</Text>
                    </View>
                    <Text style={styles.description}>
                        If your Indian mobile internet provider (like Jio/Airtel) blocks free Localtunnels, enter your computer's local IP address or a custom Pinggy URL here.
                    </Text>
                    
                    <Text style={styles.label}>Node Music Server URL</Text>
                    <TextInput 
                        style={styles.input} 
                        value={nodeUrl} 
                        onChangeText={setNodeUrl} 
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#666"
                        placeholder="e.g. http://192.168.1.5:5001"
                    />

                    <Text style={styles.label}>Python AI Server URL</Text>
                    <TextInput 
                        style={styles.input} 
                        value={pyUrl} 
                        onChangeText={setPyUrl} 
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#666"
                        placeholder="e.g. http://192.168.1.5:5000"
                    />

                    <TouchableOpacity style={styles.actionBtn} onPress={handleSaveNetwork}>
                        <LinearGradient
                            colors={['#4F46E5', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        >
                            <Text style={styles.actionBtnText}>Save Network Config</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                        <Text style={styles.sectionTitle}>Data Management</Text>
                    </View>
                    
                    <Text style={styles.hint}>
                        Clear your locally stored emotion tracking history and cached playlists. This action cannot be undone.
                    </Text>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleClearHistory}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        >
                            <Text style={styles.actionBtnText}>Clear Local History</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.infoBox}>
                    <Ionicons name="cloud-done-outline" size={20} color="#10B981" />
                    <Text style={styles.infoText}>
                        Vibo AI automatically connects to global production servers unless manually overridden above.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionHeader}>VIBO AI</Text>
                    <Text style={styles.versionSub}>v3.0.0 • Pro Build</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: 24 },
    header: { marginBottom: 32, marginTop: 10 },
    title: { fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: -1 },
    brandContainer: { flexDirection: 'row', alignItems: 'baseline' },
    brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5', marginLeft: 4 },
    subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
    section: { backgroundColor: '#FEF2F2', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FEE2E2', marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#991B1B', marginLeft: 10 },
    sectionTitleD: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginLeft: 10 },
    hint: { fontSize: 13, color: '#B91C1C', lineHeight: 18, marginBottom: 24 },
    actionBtn: { borderRadius: 14, overflow: 'hidden' },
    gradient: { paddingVertical: 14, alignItems: 'center' },
    actionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, marginTop: 24, alignItems: 'center' },
    infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#047857', lineHeight: 20 },
    footer: { marginTop: 60, alignItems: 'center' },
    versionHeader: { fontSize: 18, fontWeight: '900', color: '#D1D5DB', letterSpacing: 2 },
    versionSub: { fontSize: 12, color: '#D1D5DB', marginTop: 4, fontWeight: 'bold' },
    description: { color: '#a0a0a0', fontSize: 13, marginBottom: 15, lineHeight: 18 },
    label: { color: '#111827', fontSize: 14, fontWeight: '600', marginBottom: 5 },
    input: { backgroundColor: '#f3f4f6', color: '#111827', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb' },
});
