const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Create a new challenge
router.post('/', auth, async (req, res) => {
    try {
        const challenge = new Challenge({
            ...req.body,
            creator: req.user.id,
            participants: [{ user: req.user.id, progress: 0, streak: 0 }]
        });
        await challenge.save();

        // Create activity
        await Activity.create({
            user: req.user.id,
            type: 'challenge_created',
            details: { challenge: challenge._id }
        });

        res.status(201).json(challenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all challenges for a user
router.get('/', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            $or: [
                { creator: req.user.id },
                { 'participants.user': req.user.id }
            ]
        }).populate('creator', 'name surname')
          .populate('participants.user', 'name surname');

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Join a challenge
router.post('/:id/join', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.status !== 'active') {
            return res.status(400).json({ message: 'Challenge is not active' });
        }

        const isParticipant = challenge.participants.some(
            p => p.user.toString() === req.user.id
        );
        if (isParticipant) {
            return res.status(400).json({ message: 'Already participating' });
        }

        challenge.participants.push({
            user: req.user.id,
            progress: 0,
            streak: 0
        });
        await challenge.save();

        // Create activity
        await Activity.create({
            user: req.user.id,
            type: 'challenge_joined',
            details: { challenge: challenge._id }
        });

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update challenge progress
router.post('/:id/progress', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const participant = challenge.participants.find(
            p => p.user.toString() === req.user.id
        );
        if (!participant) {
            return res.status(400).json({ message: 'Not a participant' });
        }

        participant.progress += req.body.progress;
        participant.lastCheckIn = new Date();

        // Update streak
        const lastCheckIn = participant.lastCheckIn;
        const today = new Date();
        const diffDays = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            participant.streak += 1;
        } else if (diffDays > 1) {
            participant.streak = 1;
        }

        // Check if challenge is completed
        if (participant.progress >= challenge.goal) {
            challenge.status = 'completed';
            
            // Create activity for winning
            await Activity.create({
                user: req.user.id,
                type: 'challenge_won',
                details: { challenge: challenge._id }
            });
        }

        await challenge.save();
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get challenge details
router.get('/:id', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('creator', 'name surname')
            .populate('participants.user', 'name surname');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 