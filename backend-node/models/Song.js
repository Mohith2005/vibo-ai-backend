const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    movie: {
        type: String
    },
    emotion: {
        type: String,
        enum: ["happy", "sad", "angry", "neutral", "surprise", "fear", "disgust"],
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    duration: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', SongSchema);
