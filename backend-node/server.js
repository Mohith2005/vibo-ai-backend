require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const Song = require('./models/Song');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const EmotionHistory = require('./models/EmotionHistory');
const os = require('os'); // Auto-detect IP

const app = express();
const PORT = process.env.PORT || 5001;

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

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow serving audio files cross-origin
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', apiLimiter);

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// Serve the local Songs directory over HTTP so the mobile app can stream them
const SONGS_DIR = path.resolve(__dirname, '..', 'Songs');
app.use('/audio', express.static(SONGS_DIR));
console.log(`Serving local songs from ${SONGS_DIR} at /audio`);

const { MongoMemoryServer } = require('mongodb-memory-server');


let globalMongoServer = null;

// 1. Get Songs by Emotion (Randomized for each request)
app.get('/api/songs', async (req, res) => {
    try {
        const { emotion, weather, intent } = req.query;
        let query = {};
        
        // Voice Intent priority
        if (intent) {
            if (intent.includes('cheer') || intent.includes('happy')) query.emotion = 'happy';
            else if (intent.includes('relax') || intent.includes('calm')) query.emotion = 'neutral';
            else if (intent.includes('party') || intent.includes('dance')) query.emotion = 'happy';
            else if (intent.includes('angry') || intent.includes('pump')) query.emotion = 'angry';
        } else if (emotion) {
            query.emotion = emotion.toLowerCase(); // Ensure emotion is lowercased if present
            // Handle Synonyms/Robustness
            if (query.emotion === 'calm') query.emotion = 'neutral';
        }

        let songs = await Song.find(query);
        
        // Weather Blending: If it's rainy/cloudy, favor specific songs
        if (weather && (weather.includes('rain') || weather.includes('cloud'))) {
            // Find lo-fi or melancholic neutral songs if it's rainy
            const rainySongs = await Song.find({ 
                emotion: 'neutral',
                $or: [{ title: /lo-fi/i }, { title: /relax/i }, { title: /rain/i }]
            });
            if (rainySongs.length > 0 && Math.random() > 0.5) {
                songs = [...rainySongs, ...songs];
            }
        }

        // If still no songs found, fallback to neutral
        if (songs.length === 0 && (!query.emotion || query.emotion !== 'neutral')) {
            songs = await Song.find({ emotion: 'neutral' });
        }

        // Randomize and limit
        for (let i = songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }

        res.json(songs.slice(0, 10)); // Return top 10 for AI Smart Playlist
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching songs', details: err.message });
    }
});

// Helper to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.toLowerCase().endsWith('.mp3')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

// SMARTER CATEGORIZATION LOGIC
function guessEmotionFromPath(filePath) {
    const lowerPath = filePath.toLowerCase();
    
    // Keyword based matching
    if (lowerPath.includes('party') || lowerPath.includes('dance') || lowerPath.includes('happy') || lowerPath.includes('joy') || lowerPath.includes('celebration') || lowerPath.includes('upbeat') || lowerPath.includes('cheerful') || lowerPath.includes('energetic')) return 'happy';
    if (lowerPath.includes('sad') || lowerPath.includes('pain') || lowerPath.includes('cry') || lowerPath.includes('broken') || lowerPath.includes('lonely') || lowerPath.includes('melancholy') || lowerPath.includes('emotional') || lowerPath.includes('heartbreak')) return 'sad';
    if (lowerPath.includes('angry') || lowerPath.includes('fight') || lowerPath.includes('warrior') || lowerPath.includes('power') || lowerPath.includes('aggressive') || lowerPath.includes('heavy') || lowerPath.includes('metal') || lowerPath.includes('rock')) return 'angry';
    if (lowerPath.includes('surprise') || lowerPath.includes('shock') || lowerPath.includes('wow') || lowerPath.includes('magic') || lowerPath.includes('wonder') || lowerPath.includes('unexpected')) return 'surprise';
    if (lowerPath.includes('fear') || lowerPath.includes('horror') || lowerPath.includes('ghost') || lowerPath.includes('scary') || lowerPath.includes('dark') || lowerPath.includes('creepy') || lowerPath.includes('thriller')) return 'fear';
    if (lowerPath.includes('disgust') || lowerPath.includes('bad') || lowerPath.includes('hate') || lowerPath.includes('nasty') || lowerPath.includes('gross')) return 'disgust';
    
    // Check specific folder names if they exist in the path
    if (lowerPath.includes('melody') || lowerPath.includes('calm') || lowerPath.includes('relax') || lowerPath.includes('peaceful') || lowerPath.includes('lofi') || lowerPath.includes('chill') || lowerPath.includes('ambient') || lowerPath.includes('sleep') || lowerPath.includes('soft')) return 'neutral';

    // Default to a balanced distribution if no keywords match
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprise', 'fear', 'disgust'];
    // Use hash of filepath to keep it consistent
    let hash = 0;
    for (let i = 0; i < lowerPath.length; i++) {
        hash = ((hash << 5) - hash) + lowerPath.charCodeAt(i);
        hash |= 0; 
    }
    return emotions[Math.abs(hash) % emotions.length];
}

// Revised loadSongs to scan all local files and categorize them
async function loadSongs() {
    console.log(`Scanning local Songs directory: ${SONGS_DIR}`);
    const allFiles = getAllFiles(SONGS_DIR);
    console.log(`Found ${allFiles.length} MP3 files.`);

    const songs = [];

    allFiles.forEach((absoluteFilePath, index) => {
        const fileName = path.basename(absoluteFilePath, '.mp3');
        const emotion = guessEmotionFromPath(absoluteFilePath);

        // Convert absolute Windows path to a relative URL served by Express /audio
        const absolutePath = absoluteFilePath.replace(/\\/g, '/');
        const songsRoot = SONGS_DIR.replace(/\\/g, '/');
        const relPath = absolutePath.replace(songsRoot + '/', '');
        const encodedPath = relPath.split('/').map(encodeURIComponent).join('/');
        
        const SERVER_HOST = process.env.SERVER_IP || SYSTEM_IP;
        const httpUrl = `http://${SERVER_HOST}:${PORT}/audio/${encodedPath}`;
        const fallbackCover = 'https://picsum.photos/seed/' + encodeURIComponent(fileName) + '/400/400';

        // Extract Title and Artist from filename if it follows "Artist - Title" or just use filename
        let title = fileName;
        let artist = 'Local Artist';
        if (fileName.includes(' - ')) {
            const parts = fileName.split(' - ');
            artist = parts[0].trim();
            title = parts[1].trim();
        }

        songs.push({
            title: title,
            artist: artist,
            movie: 'VibeFlow Library',
            emotion: emotion,
            audioUrl: httpUrl,
            coverImage: fallbackCover
        });
    });

    return songs;
}

// MongoDB Connection with Auto-Failover to In-Memory DB
async function initializeDB() {
    try {
        console.log('Attempting to connect to Local MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emotion-music-player', { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.log('Local MongoDB not serving! Booting In-Memory Demo MongoDB Environment...');
        await mongoose.disconnect();
        globalMongoServer = await MongoMemoryServer.create();
        const uri = globalMongoServer.getUri();
        await mongoose.connect(uri);
        console.log('In-Memory MongoDB Active at', uri);
    }

    try {
        // ALWAYS clear db and seed from latest Local Files on boot
        await Song.deleteMany({});
        console.log('Database cleared! Auto-seeding music from Local Songs Directory...');
        const songs = await loadSongs();
        await Song.insertMany(songs);
        console.log('Music Database Bootstrapped!');
    } catch (e) { console.error("Auto-seed error:", e); }
}
initializeDB();


// 2. Save Emotion Detection History
app.post('/api/emotion', async (req, res) => {
    try {
        const { userId, emotion, confidence, songPlayed } = req.body;
        
        // Input validation
        if (!emotion || typeof emotion !== 'string' || !confidence || isNaN(confidence) || !songPlayed) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }
        
        console.log(`Saving history: ${emotion} (${confidence}%)`);

        const newHistory = new EmotionHistory({
            userId: userId || null, 
            emotion,
            confidence: parseFloat(confidence),
            songPlayed
        });

        await newHistory.save();
        res.status(201).json({ success: true, history: newHistory });
    } catch (err) {
        console.error('History Save Error:', err.message);
        res.status(500).json({ error: 'Failed to save emotion history', details: err.message });
    }
});

// 3. Get Emotion History (Populating Song details)
app.get('/api/emotion-history', async (req, res) => {
    try {
        const history = await EmotionHistory.find()
            .populate('songPlayed', 'title artist coverImage') // Get song details
            .sort({ detectedAt: -1 })
            .limit(50); // Get latest 50

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history', details: err.message });
    }
});

// 4. (Bonus) Basic Analytics Dashboard Endpoint
app.get('/api/analytics', async (req, res) => {
    try {
        // Group by emotion
        const emotionCounts = await EmotionHistory.aggregate([
            { $group: { _id: "$emotion", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ emotionCounts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to compute analytics', details: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node Server running on http://0.0.0.0:${PORT}`);
});
