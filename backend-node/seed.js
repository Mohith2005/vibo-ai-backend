require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('./models/Song');

const seedSongs = [
    {
        title: "Arabic Kuthu",
        artist: "Anirudh Ravichander",
        movie: "Beast",
        emotion: "happy",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png"
    },
    {
        title: "Vaathi Coming",
        artist: "Anirudh",
        movie: "Master",
        emotion: "happy",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png"
    },
    {
        title: "Vaseegara",
        artist: "Harris Jayaraj",
        movie: "Minnale",
        emotion: "calm",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png"
    },
    {
        title: "Po Nee Po",
        artist: "Anirudh Ravichander",
        movie: "3",
        emotion: "sad",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png"
    },
    {
        title: "Aalaporan Thamizhan",
        artist: "A.R. Rahman",
        movie: "Mersal",
        emotion: "angry",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        coverImage: "https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png"
    }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emotion-music-player')
    .then(async () => {
        console.log('MongoDB Connected for Seeding');

        // Clear existing
        await Song.deleteMany({});
        console.log('Cleared existing songs');

        // Insert new
        await Song.insertMany(seedSongs);
        console.log('Database Seeded Successfully!');

        process.exit();
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });
