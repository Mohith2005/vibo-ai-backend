const fs = require('fs');
const path = require('path');

const SONGS_DIR = path.join(__dirname, '../Songs');
const OUT_FILE = path.join(__dirname, 'emotionPlaylists.json');

const emotionsList = ['happy', 'sad', 'calm', 'angry', 'romantic', 'energetic', 'power', 'surprise', 'disgust', 'fear'];

const emotionKeywords = {
    happy: ['happy', 'kuthu', 'party', 'jolly', 'santhosh', 'dance', 'kondaatam'],
    sad: ['sogam', 'sad', 'kavaiai', 'kanneer', 'cry', 'pain', 'broken', 'kadhal_tholvi', 'pirivu'],
    calm: ['calm', 'peace', 'melody', 'relax', 'urakkam', 'thoongu', 'iravu', 'moon'],
    angry: ['angry', 'kobam', 'kopam', 'neruppu', 'fire', 'verithanam', 'blood', 'fight', 'action'],
    romantic: ['kadhal', 'love', 'romance', 'kangal', 'heart', 'anbe', 'uyire', 'kannamma', 'azhagi'],
    energetic: ['mass', 'kuthu', 'beat', 'fast', 'high', 'bgm', 'theme', 'intro'],
    power: ['mass', 'hero', 'king', 'don', 'boss', 'thala', 'thalapathy', 'superstar', 'bgm'],
    surprise: ['twist', 'shock', 'magic', 'pudhu', 'wow']
};

let allSongs = [];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.toLowerCase().endsWith('.mp3') || file.toLowerCase().endsWith('.m4a')) {
            allSongs.push(fullPath);
        }
    }
}

console.log("Scanning Songs directory...");
walkDir(SONGS_DIR);
console.log(`Found ${allSongs.length} local audio files!`);

const newPlaylists = {
    happy: [], sad: [], calm: [], angry: [], romantic: [], energetic: [], power: [], surprise: [], disgust: [], fear: [], neutral: []
};

// Map existing songs from the old JSON to preserve perfect matches
let oldData = {};
try {
    oldData = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    for (let e in oldData) {
        if (!newPlaylists[e]) newPlaylists[e] = [];
        newPlaylists[e].push(...oldData[e]);
    }
} catch (e) {
    console.log("No existing JSON to merge.");
}

// Track already parsed to avoid duplicates
const existingPaths = new Set();
for (let e in newPlaylists) {
    newPlaylists[e].forEach(s => existingPaths.add(s.file_path));
}

let unassigned = [];

allSongs.forEach(filePath => {
    if (existingPaths.has(filePath)) return;

    const filename = path.basename(filePath).toLowerCase();
    
    // Parse title and artist from "Title _ Movie _ Artist.mp3" format if possible
    let cleanTitle = filename.replace(/\(mp3_.*?\)/gi, '').replace('.mp3', '').replace('.m4a', '').trim();
    let artist = 'Unknown Artist';
    let movie = 'Local Collection';

    const parts = cleanTitle.split('_').map(p => p.trim());
    if (parts.length >= 3) {
        movie = parts[1];
        artist = parts[2];
        cleanTitle = parts[0];
    } else if (parts.length === 2) {
        movie = parts[1];
        cleanTitle = parts[0];
    }

    let assigned = false;
    let songObj = {
        title: cleanTitle,
        artist: artist,
        movie: movie,
        year: 2020,
        file_path: filePath,
        emotion: []
    };

    // Keyword matching
    for (const [emo, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(k => filename.includes(k))) {
            songObj.emotion.push(emo);
            newPlaylists[emo].push(songObj);
            assigned = true;
        }
    }

    if (!assigned) {
        unassigned.push(songObj);
    }
});

console.log(`Matched ${allSongs.length - unassigned.length - existingPaths.size} songs automatically.`);
console.log(`Distributing ${unassigned.length} remaining songs equally across playlists...`);

// Evenly distribute the remainder so every emotion has massive pools
let eIndex = 0;
unassigned.forEach(song => {
    const targetEmo = emotionsList[eIndex % emotionsList.length];
    song.emotion.push(targetEmo);
    newPlaylists[targetEmo].push(song);
    
    // Assign to a secondary emotion occasionally for more variety
    if (Math.random() > 0.6) {
        const secondEmo = emotionsList[(eIndex + 3) % emotionsList.length];
        song.emotion.push(secondEmo);
        newPlaylists[secondEmo].push(song);
    }

    eIndex++;
});

// For any emotion that still has < 30 songs, borrow from others randomly
const minSongs = 50;
emotionsList.forEach(emo => {
     if (newPlaylists[emo].length < minSongs) {
          const needed = minSongs - newPlaylists[emo].length;
          for(let i=0; i<needed; i++) {
              const randomSong = unassigned[Math.floor(Math.random() * unassigned.length)];
              newPlaylists[emo].push(randomSong);
          }
     }
});

fs.writeFileSync(OUT_FILE, JSON.stringify(newPlaylists, null, 2));

console.log("Successfully built massive Emotion Dictionary with the following counts:");
Object.keys(newPlaylists).forEach(e => {
    console.log(`${e.toUpperCase()}: ${newPlaylists[e].length} songs`);
});
