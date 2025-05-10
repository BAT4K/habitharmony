const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get global leaderboard
router.get('/global', auth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find()
            .sort({ points: -1 })
            .limit(100)
            .populate('user', 'name surname');

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get friends leaderboard
router.get('/friends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends');
        const friendIds = user.friends.map(f => f._id);
        
        const leaderboard = await Leaderboard.find({
            user: { $in: [...friendIds, req.user.id] }
        })
        .sort({ points: -1 })
        .populate('user', 'name surname');

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user's leaderboard stats
router.post('/update', auth, async (req, res) => {
    try {
        const { points, streak, habitsCompleted, challengesWon } = req.body;
        
        let leaderboard = await Leaderboard.findOne({ user: req.user.id });
        
        if (!leaderboard) {
            leaderboard = new Leaderboard({ user: req.user.id });
        }

        // Update stats
        leaderboard.points += points || 0;
        leaderboard.streak = Math.max(leaderboard.streak, streak || 0);
        leaderboard.longestStreak = Math.max(leaderboard.longestStreak, streak || 0);
        leaderboard.habitsCompleted += habitsCompleted || 0;
        leaderboard.challengesWon += challengesWon || 0;
        leaderboard.lastUpdated = new Date();

        // Check for achievements
        const newAchievements = [];
        
        if (leaderboard.streak >= 7 && !leaderboard.achievements.some(a => a.type === 'streak_7')) {
            newAchievements.push({
                type: 'streak_7',
                name: 'Week Warrior',
                description: 'Maintained a 7-day streak'
            });
        }
        
        if (leaderboard.streak >= 30 && !leaderboard.achievements.some(a => a.type === 'streak_30')) {
            newAchievements.push({
                type: 'streak_30',
                name: 'Monthly Master',
                description: 'Maintained a 30-day streak'
            });
        }
        
        if (leaderboard.habitsCompleted >= 100 && !leaderboard.achievements.some(a => a.type === 'habits_100')) {
            newAchievements.push({
                type: 'habits_100',
                name: 'Habit Hero',
                description: 'Completed 100 habits'
            });
        }

        if (newAchievements.length > 0) {
            leaderboard.achievements.push(...newAchievements);
        }

        await leaderboard.save();

        // Update rank
        const allUsers = await Leaderboard.find().sort({ points: -1 });
        const rank = allUsers.findIndex(u => u.user.toString() === req.user.id) + 1;
        leaderboard.rank = rank;
        await leaderboard.save();

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's achievements
router.get('/achievements', auth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findOne({ user: req.user.id });
        if (!leaderboard) {
            return res.json({ achievements: [] });
        }
        res.json({ achievements: leaderboard.achievements });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 