const mongoose = require('mongoose');

const EmotionHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    emotion: {
        type: String,
        required: true
    },
    confidence: {
        type: Number
    },
    songPlayed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    },
    detectedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmotionHistory', EmotionHistorySchema);
