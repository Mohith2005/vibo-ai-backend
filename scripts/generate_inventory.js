// scripts/generate_inventory.js
// Scan the backend-node seedSongs array (hard‑coded) and write a CSV file
// This is a simple utility you can run with `node scripts/generate_inventory.js`

const fs = require('fs');
const path = require('path');

// Re‑use the seed data (duplicate of server.js seedSongs). Keep in sync manually if you add more songs.
const seedSongs = [
    { title: "Arabic Kuthu", artist: "Anirudh", movie: "Beast", emotion: "happy", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Vaathi Coming", artist: "Anirudh", movie: "Master", emotion: "happy", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Rowdy Baby", artist: "Yuvan", movie: "Maari 2", emotion: "happy", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Verithanam", artist: "A.R. Rahman", movie: "Bigil", emotion: "happy", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Megham Karukatha", artist: "Dhanush", movie: "Thiruchitrambalam", emotion: "happy", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Vaseegara", artist: "Harris Jayaraj", movie: "Minnale", emotion: "calm", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Munbe Vaa", artist: "A.R. Rahman", movie: "Sillunu Oru Kadhal", emotion: "calm", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Ennodu Nee Irundhaal", artist: "A.R. Rahman", movie: "I", emotion: "calm", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Kadhal Rojave", artist: "A.R. Rahman", movie: "Roja", emotion: "calm", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Po Nee Po", artist: "Anirudh", movie: "3", emotion: "sad", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Kanave Kanave", artist: "Anirudh", movie: "David", emotion: "sad", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "New York Nagaram", artist: "A.R. Rahman", movie: "Sillunu Oru Kadhal", emotion: "sad", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Kadhale Kadhale", artist: "Yuvan", movie: "96", emotion: "sad", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Aalaporan Thamizhan", artist: "A.R. Rahman", movie: "Mersal", emotion: "angry", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Veera Thurandhara", artist: "Santhosh Narayanan", movie: "Kabali", emotion: "angry", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" },
    { title: "Danga Maari", artist: "Harris Jayaraj", movie: "Anegan", emotion: "angry", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png" }
];

const csvHeaders = ["song_id", "file_path", "title", "folder", "emotion_discrete", "valence", "arousal", "notes"]; // notes will hold artist+movie

const rows = seedSongs.map((song, idx) => {
    // Using placeholder file_path (since we use remote URLs). You can replace with local paths later.
    const filePath = `remote://${song.audioUrl}`;
    const notes = `${song.artist} - ${song.movie}`;
    return [idx + 1, filePath, song.title, "seed", song.emotion, "", "", notes].join(",");
});

const csvContent = [csvHeaders.join(","), ...rows].join("\n");

const outPath = path.resolve(__dirname, "..", "song_inventory.csv");
fs.writeFileSync(outPath, csvContent, "utf8");
console.log(`✅ Generated CSV at ${outPath}`);
