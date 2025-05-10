const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const auth = require('../middleware/auth');

// Get all friends of the current user
router.get('/', auth, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            $or: [{ user1: req.user._id }, { user2: req.user._id }],
            status: 'active'
        }).populate('user1 user2', 'name surname email habits');

        const friends = friendships.map(friendship => {
            const friend = friendship.user1._id.equals(req.user._id) ? friendship.user2 : friendship.user1;
            return {
                id: friend._id,
                name: friend.name,
                surname: friend.surname,
                email: friend.email,
                habits: friend.habits,
                friendshipId: friendship._id
            };
        });

        res.json({ friends });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Get pending friend requests
router.get('/requests', auth, async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            toUser: req.user._id,
            status: 'pending'
        }).populate('fromUser', 'name surname email');

        res.json({
            requests: requests.map(req => ({
                id: req._id,
                fromUser: {
                    id: req.fromUser._id,
                    name: req.fromUser.name,
                    surname: req.fromUser.surname,
                    email: req.fromUser.email
                },
                createdAt: req.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
});

// Send a friend request
router.post('/request', auth, async (req, res) => {
    try {
        const { toUserId } = req.body;

        // Check if users exist
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1: req.user._id, user2: toUserId },
                { user1: toUserId, user2: req.user._id }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ error: 'Friendship already exists' });
        }

        // Check if there's already a pending request
        const existingRequest = await FriendRequest.findOne({
            fromUser: req.user._id,
            toUser: toUserId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        // Create new friend request
        const friendRequest = new FriendRequest({
            fromUser: req.user._id,
            toUser: toUserId
        });

        await friendRequest.save();

        res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Accept a friend request
router.post('/accept', auth, async (req, res) => {
    try {
        const { requestId } = req.body;

        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
            toUser: req.user._id,
            status: 'pending'
        });

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        // Create friendship
        const friendship = new Friendship({
            user1: req.user._id,
            user2: friendRequest.fromUser
        });

        // Update request status
        friendRequest.status = 'accepted';

        await Promise.all([friendship.save(), friendRequest.save()]);

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

// Reject a friend request
router.post('/reject', auth, async (req, res) => {
    try {
        const { requestId } = req.body;

        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
            toUser: req.user._id,
            status: 'pending'
        });

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        friendRequest.status = 'rejected';
        await friendRequest.save();

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject friend request' });
    }
});

// Search users
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { surname: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude current user
        }).select('name surname email');

        // Get existing friendships and requests
        const [friendships, friendRequests] = await Promise.all([
            Friendship.find({
                $or: [{ user1: req.user._id }, { user2: req.user._id }]
            }),
            FriendRequest.find({
                $or: [
                    { fromUser: req.user._id },
                    { toUser: req.user._id }
                ],
                status: 'pending'
            })
        ]);

        // Add friendship status to each user
        const usersWithStatus = users.map(user => {
            const isFriend = friendships.some(f => 
                f.user1.equals(user._id) || f.user2.equals(user._id)
            );
            const hasPendingRequest = friendRequests.some(r => 
                (r.fromUser.equals(user._id) && r.toUser.equals(req.user._id)) ||
                (r.fromUser.equals(req.user._id) && r.toUser.equals(user._id))
            );

            return {
                id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                status: isFriend ? 'friend' : hasPendingRequest ? 'pending' : 'none'
            };
        });

        res.json({ users: usersWithStatus });
    } catch (error) {
        res.status(500).json({ error: 'Failed to search users' });
    }
});

module.exports = router; 