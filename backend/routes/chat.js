const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all chats for a user
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
        .populate('participants', 'name surname')
        .sort({ lastMessage: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get chat with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            participants: { $all: [req.user.id, req.params.userId] }
        })
        .populate('participants', 'name surname')
        .populate('messages.sender', 'name surname');

        if (!chat) {
            // Create new chat if it doesn't exist
            const newChat = new Chat({
                participants: [req.user.id, req.params.userId],
                messages: []
            });
            await newChat.save();
            return res.json(newChat);
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send a message
router.post('/:userId/message', auth, async (req, res) => {
    try {
        const { content, attachments } = req.body;
        
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, req.params.userId] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [req.user.id, req.params.userId],
                messages: []
            });
        }

        const message = {
            sender: req.user.id,
            content,
            attachments: attachments || []
        };

        chat.messages.push(message);
        chat.lastMessage = new Date();
        
        // Update unread count for recipient
        const unreadCount = chat.unreadCount.get(req.params.userId) || 0;
        chat.unreadCount.set(req.params.userId, unreadCount + 1);

        await chat.save();

        // Emit socket event for real-time updates
        req.app.get('io').to(req.params.userId).emit('newMessage', {
            chatId: chat._id,
            message
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark messages as read
router.post('/:userId/read', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            participants: { $all: [req.user.id, req.params.userId] }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark all messages as read
        chat.messages.forEach(message => {
            if (message.sender.toString() !== req.user.id) {
                message.read = true;
            }
        });

        // Reset unread count
        chat.unreadCount.set(req.user.id, 0);

        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        });

        const totalUnread = chats.reduce((count, chat) => {
            return count + (chat.unreadCount.get(req.user.id) || 0);
        }, 0);

        res.json({ unreadCount: totalUnread });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 