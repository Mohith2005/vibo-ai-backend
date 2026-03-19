const fs = require('fs');
const path = require('path');

// The Root Songs Directory
const SONGS_DIR = path.join(__dirname, '..', 'Songs');
const OUT_FILE = path.join(__dirname, '..', 'backend-node', 'emotionPlaylists.json');

// The user-provided dataset with emotion tags
const TamilSongsDataset = [
    { title: "Vaseegara", artist: "Harris Jayaraj", movie: "Minnale", year: 2001, emotion: ["calm", "romantic"] },
    { title: "Pachai Nirame", artist: "A.R Rahman", movie: "Alaipayuthey", year: 2000, emotion: ["calm", "romantic"] },
    { title: "Munbe Vaa", artist: "A.R Rahman", movie: "Sillunu Oru Kadhal", year: 2006, emotion: ["calm", "romantic"] },
    { title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", year: 2008, emotion: ["calm", "romantic"] },
    { title: "Thalli Pogathey", artist: "A.R Rahman", movie: "Achcham Yenbadhu Madamaiyada", year: 2016, emotion: ["calm", "romantic"] },
    { title: "Hosanna", artist: "A.R Rahman", movie: "Vinnaithaandi Varuvaayaa", year: 2010, emotion: ["happy", "romantic", "calm"] },
    { title: "New York Nagaram", artist: "A.R Rahman", movie: "Sillunu Oru Kadhal", year: 2006, emotion: ["calm", "sad"] },
    { title: "Kadhal Rojave", artist: "A.R Rahman", movie: "Roja", year: 1992, emotion: ["sad", "calm"] },
    { title: "Vennilave Vennilave", artist: "A.R Rahman", movie: "Minsara Kanavu", year: 1997, emotion: ["calm", "romantic"] },
    { title: "Uyire Uyire", artist: "A.R Rahman", movie: "Bombay", year: 1995, emotion: ["sad", "romantic"] },

    { title: "Why This Kolaveri Di", artist: "Anirudh", movie: "3", year: 2012, emotion: ["sad"] },
    { title: "Po Nee Po", artist: "Anirudh", movie: "3", year: 2012, emotion: ["sad"] },
    { title: "Kanave Kanave", artist: "Anirudh", movie: "David", year: 2013, emotion: ["sad"] },
    { title: "Unakkenna Venum Sollu", artist: "Harris Jayaraj", movie: "Yennai Arindhaal", year: 2015, emotion: ["sad"] },
    { title: "Oru Naalil", artist: "Yuvan Shankar Raja", movie: "Pudhupettai", year: 2006, emotion: ["sad"] },
    { title: "Nallai Allai", artist: "A.R Rahman", movie: "Kaatru Veliyidai", year: 2017, emotion: ["sad"] },
    { title: "Ennai Konjam Maatri", artist: "Harris Jayaraj", movie: "Kaakha Kaakha", year: 2003, emotion: ["romantic", "sad"] },
    { title: "Suttrum Vizhi", artist: "Harris Jayaraj", movie: "Ghajini", year: 2005, emotion: ["romantic", "sad"] },
    { title: "Aaruyire", artist: "A.R Rahman", movie: "Guru", year: 2007, emotion: ["romantic", "sad"] },

    { title: "Arabic Kuthu", artist: "Anirudh", movie: "Beast", year: 2022, emotion: ["happy", "energetic"] },
    { title: "Vaathi Coming", artist: "Anirudh", movie: "Master", year: 2021, emotion: ["happy", "energetic"] },
    { title: "Rowdy Baby", artist: "Yuvan Shankar Raja", movie: "Maari 2", year: 2018, emotion: ["happy", "energetic"] },
    { title: "Donu Donu Donu", artist: "Anirudh", movie: "Maari", year: 2015, emotion: ["happy"] },
    { title: "Private Party", artist: "Anirudh", movie: "Don", year: 2022, emotion: ["happy"] },
    { title: "Google Google", artist: "Harris Jayaraj", movie: "Thuppakki", year: 2012, emotion: ["happy"] },
    { title: "Aaluma Doluma", artist: "Anirudh", movie: "Vedalam", year: 2015, emotion: ["happy", "energetic"] },
    { title: "Jolly O Gymkhana", artist: "Anirudh", movie: "Beast", year: 2022, emotion: ["happy"] },
    { title: "Appadi Podu", artist: "Vidyasagar", movie: "Ghilli", year: 2004, emotion: ["happy", "energetic"] },
    { title: "Kutty Story", artist: "Anirudh", movie: "Master", year: 2021, emotion: ["happy"] },

    { title: "Neruppu Da", artist: "Santhosh Narayanan", movie: "Kabali", year: 2016, emotion: ["angry", "power"] },
    { title: "Aalaporan Thamizhan", artist: "A.R Rahman", movie: "Mersal", year: 2017, emotion: ["angry", "power", "energetic"] },
    { title: "Surviva", artist: "Anirudh", movie: "Vivegam", year: 2017, emotion: ["angry", "power"] },
    { title: "Petta Paraak", artist: "Anirudh", movie: "Petta", year: 2019, emotion: ["angry", "power"] },
    { title: "Karuppu Vellai", artist: "Sam C.S", movie: "Vikram Vedha", year: 2017, emotion: ["angry", "power"] },
    { title: "Arjunar Villu", artist: "Vidyasagar", movie: "Ghilli", year: 2004, emotion: ["angry", "power"] },
    { title: "Vaathi Raid", artist: "Anirudh", movie: "Master", year: 2021, emotion: ["angry", "power"] },
    { title: "Sultan Title Track", artist: "Vivek Mervin", movie: "Sultan", year: 2021, emotion: ["angry", "power"] },
    { title: "Ethir Neechal", artist: "Anirudh", movie: "Ethir Neechal", year: 2013, emotion: ["angry", "energetic"] },
    { title: "Danga Maari Oodhari", artist: "Harris Jayaraj", movie: "Anegan", year: 2015, emotion: ["angry", "energetic"] },

    { title: "Jimikki Ponnu", artist: "Thaman", movie: "Varisu", year: 2023, emotion: ["happy", "surprise"] },
    { title: "Marana Mass", artist: "Anirudh", movie: "Petta", year: 2019, emotion: ["energetic", "surprise"] },
    { title: "Otha Sollaala", artist: "G.V Prakash", movie: "Aadukalam", year: 2011, emotion: ["energetic", "surprise"] },
    { title: "Sodakku", artist: "Anirudh", movie: "Thaanaa Serndha Koottam", year: 2018, emotion: ["energetic", "surprise"] },
    { title: "Vaadi Pulla Vaadi", artist: "Hiphop Tamizha", movie: "Meesaya Murukku", year: 2017, emotion: ["happy", "surprise"] },

    { title: "Anbil Avan", artist: "A.R Rahman", movie: "Vinnaithaandi Varuvaayaa", year: 2010, emotion: ["romantic"] },
    { title: "Kangal Irandal", artist: "James Vasanthan", movie: "Subramaniapuram", year: 2008, emotion: ["romantic"] },
    { title: "Nila Kaigirathu", artist: "A.R Rahman", movie: "Indira", year: 1995, emotion: ["calm"] },
    { title: "Chinna Chinna Aasai", artist: "A.R Rahman", movie: "Roja", year: 1992, emotion: ["happy"] },
    { title: "Ennavale Adi Ennavale", artist: "A.R Rahman", movie: "Kadhalan", year: 1994, emotion: ["romantic"] },
    { title: "Snehithane", artist: "A.R Rahman", movie: "Alaipayuthey", year: 2000, emotion: ["romantic"] }
];

// Utility: Normalize Song Title
// Removes dashes, underscores, and converts to lowercase
function normalizeTitle(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[_-]/g, ' ')       // replace dash/underscore with space
        .replace(/\s+/g, '')         // optionally remove all spaces for aggressive matching
        .replace(/[^a-z0-9]/g, '');   // keep only alphanumeric
}

// Map dataset titles for fast matching
const datasetMap = {};
TamilSongsDataset.forEach(song => {
    const normTitle = normalizeTitle(song.title);
    datasetMap[normTitle] = song;
});

// Recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// STEP 1 — Scan Songs Folder
let allFiles = [];
if (fs.existsSync(SONGS_DIR)) {
    console.log(`Scanning local Songs directory: ${SONGS_DIR}`);
    allFiles = getAllFiles(SONGS_DIR);
} else {
    console.log("WARN: Songs directory does not exist or hasn't been mapped properly!");
}

// Only keep mp3, wav, etc
const audioFiles = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.m4a', '.flac'].includes(ext);
});
console.log(`Found ${audioFiles.length} total audio files.`);

// STEP 5 — Group Songs by Emotion
const EmotionPlaylists = {
    happy: [],
    sad: [],
    calm: [],
    angry: [],
    romantic: [],
    energetic: [],
    power: [],
    surprise: []
};

// To prevent duplicates
const processedTitles = new Set();

// STEP 2 & 3 & 4 — Normalize, Match, Detect
audioFiles.forEach(filePath => {
    const baseName = path.basename(filePath);
    const ext = path.extname(baseName);
    const nameWithoutExt = baseName.replace(ext, '');

    // Cleaned filename
    const cleanedFileTitle = normalizeTitle(nameWithoutExt);

    // Look for a match in dataset using substring or exact match.
    // We'll prioritize exact match on the aggressive cleaned string.
    let matchedSong = datasetMap[cleanedFileTitle];

    // If exact match fails, let's try a substring match as a fallback
    if (!matchedSong) {
        for (const [normTitle, song] of Object.entries(datasetMap)) {
            if (cleanedFileTitle.includes(normTitle) || normTitle.includes(cleanedFileTitle)) {
                matchedSong = song;
                break;
            }
        }
    }

    if (matchedSong) {
        // Determine unique id based on song title so we avoid exact duplicates
        if (!processedTitles.has(matchedSong.title)) {
            processedTitles.add(matchedSong.title);

            const songData = {
                title: matchedSong.title,
                artist: matchedSong.artist,
                movie: matchedSong.movie,
                year: matchedSong.year,
                file_path: filePath,
                emotion: matchedSong.emotion
            };

            // Ensure emotion is an array
            const emotionsArray = Array.isArray(matchedSong.emotion)
                ? matchedSong.emotion
                : [matchedSong.emotion];

            // STEP 6 — Add Songs to Correct Playlist
            emotionsArray.forEach(tag => {
                // Tag could be 'calm', 'romantic', 'happy', etc.
                const lowerTag = tag.toLowerCase().trim();
                if (!EmotionPlaylists[lowerTag]) {
                    EmotionPlaylists[lowerTag] = []; // initialize dynamic tags
                }
                EmotionPlaylists[lowerTag].push(songData);
            });

            console.log(`✓ Matched: ${matchedSong.title} -> Tags: [${emotionsArray.join(', ')}]`);
        }
    }
});

// STEP 8 — Sort Playlists
// Sorting by year descending (latest first). Could also be ascending.
for (const emotion in EmotionPlaylists) {
    EmotionPlaylists[emotion].sort((a, b) => (b.year || 0) - (a.year || 0));
}

// Remove empty arrays to keep JSON clean
for (const emotion in EmotionPlaylists) {
    if (EmotionPlaylists[emotion].length === 0) {
        delete EmotionPlaylists[emotion];
    }
}

// STEP 9 — Export Playlists
fs.writeFileSync(OUT_FILE, JSON.stringify(EmotionPlaylists, null, 2), 'utf8');

console.log(`\n🎉 Success! Generated ${OUT_FILE}`);
Object.keys(EmotionPlaylists).forEach(emotion => {
    console.log(` - ${emotion}: ${EmotionPlaylists[emotion].length} songs`);
});
