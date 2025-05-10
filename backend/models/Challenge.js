const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    habit: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        progress: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
        lastCheckIn: {
            type: Date,
            default: null
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    type: {
        type: String,
        enum: ['streak', 'total', 'custom'],
        default: 'streak'
    },
    goal: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
challengeSchema.index({ creator: 1, status: 1 });
challengeSchema.index({ 'participants.user': 1, status: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge; 