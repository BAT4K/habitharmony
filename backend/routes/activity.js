const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user's activity feed
router.get('/feed', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends');
        const friendIds = user.friends.map(f => f._id);

        const activities = await Activity.find({
            $or: [
                { user: req.user.id },
                {
                    user: { $in: friendIds },
                    visibility: { $in: ['public', 'friends'] }
                }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name surname')
        .populate('details.friend', 'name surname')
        .populate('details.challenge', 'title');

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's activities
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const isFriend = user.friends.includes(req.params.userId);

        const query = {
            user: req.params.userId,
            visibility: isFriend ? { $in: ['public', 'friends'] } : 'public'
        };

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'name surname')
            .populate('details.friend', 'name surname')
            .populate('details.challenge', 'title');

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new activity
router.post('/', auth, async (req, res) => {
    try {
        const activity = new Activity({
            user: req.user.id,
            ...req.body
        });

        await activity.save();

        // Emit socket event for real-time updates
        const user = await User.findById(req.user.id).populate('friends');
        const friendIds = user.friends.map(f => f._id);

        req.app.get('io').to(friendIds).emit('newActivity', {
            activity: await activity.populate('user', 'name surname')
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update activity visibility
router.patch('/:id/visibility', auth, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        activity.visibility = req.body.visibility;
        await activity.save();

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete activity
router.delete('/:id', auth, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await activity.remove();
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 