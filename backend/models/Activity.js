const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'habit_completed',
            'streak_achieved',
            'challenge_created',
            'challenge_joined',
            'challenge_won',
            'friend_added',
            'achievement_unlocked',
            'level_up'
        ],
        required: true
    },
    details: {
        habit: {
            type: String,
            required: function() {
                return this.type === 'habit_completed';
            }
        },
        streak: {
            type: Number,
            required: function() {
                return this.type === 'streak_achieved';
            }
        },
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge',
            required: function() {
                return ['challenge_created', 'challenge_joined', 'challenge_won'].includes(this.type);
            }
        },
        friend: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: function() {
                return this.type === 'friend_added';
            }
        },
        achievement: {
            type: String,
            required: function() {
                return this.type === 'achievement_unlocked';
            }
        },
        level: {
            type: Number,
            required: function() {
                return this.type === 'level_up';
            }
        }
    },
    points: {
        type: Number,
        default: 0
    },
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
    }
}, {
    timestamps: true
});

// Index for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity; 