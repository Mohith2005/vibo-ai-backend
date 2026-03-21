require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios'); // Added for Reverse Proxy

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy for Ngrok/Cloud hosting (to prevent rate-limit false-positives)
app.set('trust proxy', 1);

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const SYSTEM_IP = getLocalIP();

// Load Local Emotion Playlists Engine
const emotionPlaylistsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'emotionPlaylists.json'), 'utf8'));

// API 0: Static Local MP3 Streaming Endpoint
// Exposes the physical Songs directory safely directly to the internet via Ngrok
app.use('/api/stream', express.static(path.join(__dirname, '../Songs')));

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow serving audio files cross-origin
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', apiLimiter);

// Remove Spotify specific caches and auth
let globalEmotionHistory = []; // In-Memory Database (100% Crash-Proof)
let localCache = new Map(); // Quick cache for History Writes

// API 1: Generate AI Playlist (ZERO LATENCY STATIC ROUTING)
app.get('/api/songs', async (req, res) => {
    try {
        let { emotion, emotion2, intent } = req.query;
        let targetEmotion = 'neutral';
        
        if (intent) {
            const i = intent.toLowerCase();
            if (i.includes('cheer') || i.includes('happy')) targetEmotion = 'happy';
            else if (i.includes('relax') || i.includes('calm')) targetEmotion = 'calm';
            else if (i.includes('party') || i.includes('dance')) targetEmotion = 'energetic';
            else if (i.includes('angry') || i.includes('pump')) targetEmotion = 'angry';
        } else if (emotion) {
            targetEmotion = emotion.toLowerCase();
            if (targetEmotion === 'neutral') targetEmotion = 'calm';
        }

        let targetEmotionList = emotionPlaylistsData[targetEmotion] || emotionPlaylistsData['calm'];
        let targetEmotionList2 = null;
        if (emotion2) {
            let t2 = emotion2.toLowerCase();
            if (t2 === 'neutral') t2 = 'calm';
            targetEmotionList2 = emotionPlaylistsData[t2];
        }

        // --- GAMIFICATION: PREMIUM FOLDER UNLOCKS ---
        const userLevel = globalEmotionHistory.length;
        let isNewUnlock = false;

        if (userLevel < 3) {
            targetEmotionList = targetEmotionList.filter(s => !s.file_path.includes("90's Tamil Golden Era"));
            if (targetEmotionList2) {
                targetEmotionList2 = targetEmotionList2.filter(s => !s.file_path.includes("90's Tamil Golden Era"));
            }
        } else if (userLevel >= 3) {
            // Check if this is exactly the third scan
            if (globalEmotionHistory.length === 3) isNewUnlock = true;
        }

        if (targetEmotionList.length === 0) targetEmotionList = emotionPlaylistsData['calm'];

        // Genuine Premium Randomizer Engine
        let finalSelection = [];
        let shuffled1 = [...targetEmotionList].sort(() => 0.5 - Math.random());
        
        if (targetEmotionList2 && targetEmotionList2.length > 0) {
            let shuffled2 = [...targetEmotionList2].sort(() => 0.5 - Math.random());
            // 👯 Vibe Blend (Couples Mode): 15 songs from Person A, 15 from Person B
            finalSelection = [...shuffled1.slice(0, 15), ...shuffled2.slice(0, 15)];
            // Interleave them dynamically
            finalSelection = finalSelection.sort(() => 0.5 - Math.random());
        } else {
            finalSelection = shuffled1.slice(0, 30);
        }

        res.setHeader('X-Vibo-Unlock', isNewUnlock ? 'true' : 'false');
        
        // Secure mapping pipeline converting physical paths into HTTP UI Streams
        const tracks = finalSelection.map(s => {
            let relativePath = '';
            // Normalize slashes to forward slashes
            const genericPath = s.file_path.replace(/\\/g, '/');
            const genericIndex = genericPath.indexOf('/Songs/');
            if (genericIndex !== -1) {
                relativePath = genericPath.substring(genericIndex + 7);
            } else {
                // Try matching just Songs/ if it starts with it
                const startStr = 'Songs/';
                const startIndex = genericPath.indexOf(startStr);
                if (startIndex !== -1) {
                    relativePath = genericPath.substring(startIndex + startStr.length);
                } else {
                    relativePath = path.basename(s.file_path);
                }
            }

            const songObj = {
                _id: `vibo_local_${Math.random().toString(36).substring(7)}`,
                title: s.title,
                artist: s.artist,
                movie: s.movie || 'Local Collection',
                emotion: targetEmotion,
                audioUrl: `/api/stream/${encodeURI(relativePath)}`,
                coverImage: 'https://picsum.photos/400'
            };
            localCache.set(songObj._id, songObj);
            return songObj;
        });

        return res.json(tracks);
    } catch (err) {
        console.error("Local Playlist Generation Error:", err.message);
        return res.status(500).json({ error: 'Failed to build local playlist.' });
    }
});

// API 2: Save Emotion
app.post('/api/emotion', (req, res) => {
    try {
        const { userId, emotion, confidence, songPlayed } = req.body;
        if (!emotion || typeof emotion !== 'string' || !confidence || isNaN(confidence) || !songPlayed) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        // History Integration with New Dynamic Memory Pool
        const songDetails = localCache.get(songPlayed) || { title: `Local ID ${songPlayed}`, artist: 'Unknown Metadata', coverImage: '' };

        const newRecord = {
            _id: `hist_${Date.now()}_${Math.random()}`,
            userId: userId || null,
            emotion,
            confidence: parseFloat(confidence),
            songPlayed: songDetails,
            detectedAt: new Date().toISOString()
        };

        globalEmotionHistory.unshift(newRecord);
        if (globalEmotionHistory.length > 100) globalEmotionHistory.pop(); // Keep latest 100

        res.status(201).json({ success: true, history: newRecord });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save emotion history', details: err.message });
    }
});

// API 3: Get History
app.get('/api/emotion-history', (req, res) => {
    try {
        res.json(globalEmotionHistory.slice(0, 50));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history', details: err.message });
    }
});

// API 4: REVERSE PROXY FOR PYTHON AI SERVER
// Ngrok only allows 1 free domain, so Node takes the domain and silently forwards AI traffic to Python locally!
app.post('/detect_emotion', async (req, res) => {
    try {
        console.log('Proxying Emotion Detection Request. Payload Size:', req.headers['content-length'] || 'Unknown');
        // Automatically route the raw React Native JSON directly to local Python Port 5000
        const pyResponse = await axios.post('http://127.0.0.1:5000/detect_emotion', req.body, {
            headers: { 'Content-Type': 'application/json' },
            maxBodyLength: Infinity, // Allow large Base64 strings
            timeout: 120000 // 120 second timeout for AI processing
        });
        console.log('AI Detection Result:', pyResponse.data.dominant_emotion);
        res.json(pyResponse.data);
    } catch (err) {

        console.error("Python Proxy Error:", err.message);
        res.status(502).json({ error: 'AI server takes too long. Please ensure face is clear.' });
    }
});

// API 5: REVERSE PROXY FOR VOICE RECOGNITION (HEY VIBO)
app.post('/api/transcribe', async (req, res) => {
    try {
        console.log('Proxying Voice Transcription Request. Payload Size:', req.headers['content-length'] || 'Unknown');
        const pyResponse = await axios.post('http://127.0.0.1:5000/transcribe', req.body, {
            headers: { 'Content-Type': 'application/json' },
            maxBodyLength: Infinity,
            timeout: 30000 // 30 seconds for speech analysis
        });
        console.log('Voice Transcription Result:', pyResponse.data.text);
        res.json(pyResponse.data);
    } catch (err) {
        console.error("Python Voice Proxy Error:", err.message);
        res.status(502).json({ error: 'Voice server takes too long or failed.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node Server running on http://0.0.0.0:${PORT}`);
});
