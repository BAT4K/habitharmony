const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://habitharmony.onrender.com', 'https://habitharmony.vercel.app']
            : true,
        credentials: true
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room for private messages
    socket.on('join', (userId) => {
        socket.join(userId);
    });

    // Handle friend request notifications
    socket.on('friendRequest', (data) => {
        io.to(data.toUserId).emit('newFriendRequest', data);
    });

    // Handle friend request response
    socket.on('friendRequestResponse', (data) => {
        io.to(data.fromUserId).emit('friendRequestUpdate', data);
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
        io.to(data.toUserId).emit('newMessage', data);
    });

    // Handle activity updates
    socket.on('activityUpdate', (data) => {
        io.to(data.userId).emit('newActivity', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// CORS setup with more specific configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://habitharmony.onrender.com',
        'https://habitharmony.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Add size limit for JSON payloads

// MongoDB connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to the database
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/activity', require('./routes/activity'));
// Temporarily comment out payment routes
// const paymentRoutes = require('./routes/payment');
// app.use('/api/payment', paymentRoutes);

// Helper function to wait for Ollama service with improved error handling
const waitForOllama = async (retries = 5, delay = 5000) => {
    // In production, we don't need to check Ollama as it's a separate service
    if (process.env.NODE_ENV === 'production') {
        return true;
    }

    for (let i = 0; i < retries; i++) {
        try {
            const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
            console.log(`Attempting to connect to Ollama at ${OLLAMA_URL}`);
            const response = await fetch(`${OLLAMA_URL}/api/tags`);
            if (response.ok) {
                console.log('Ollama service is ready');
                return true;
            }
            console.log(`Ollama service responded with status: ${response.status}`);
        } catch (error) {
            console.log(`Attempt ${i + 1}/${retries} failed: ${error.message}`);
            if (i < retries - 1) {
                console.log(`Waiting ${delay/1000} seconds before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('Failed to connect to Ollama service after all retries');
    return false;
};

// Health check endpoint with more detailed status
app.get('/api/health', async (req, res) => {
    try {
        // In production, we don't need to check Ollama
        if (process.env.NODE_ENV === 'production') {
            const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
            return res.json({ 
                status: 'healthy',
                ollama: 'external',
                mongodb: mongoStatus,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        }

        const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
        const ollamaReady = await waitForOllama();
        
        if (!ollamaReady) {
            throw new Error('Ollama service is not available');
        }

        // Check MongoDB connection
        const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        res.json({ 
            status: 'healthy',
            ollama: 'connected',
            mongodb: mongoStatus,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ 
            status: 'unhealthy',
            ollama: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
});

// Gemini API integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Messages array is required and must not be empty'
            });
        }

        // Convert messages to Gemini format
        const geminiMessages = [
            {
                parts: messages.map(m => ({ text: m.content }))
            }
        ];

        const geminiResponse = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: geminiMessages })
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.text();
            console.error('Gemini API error:', errorData);
            throw new Error(`Failed to get response from Gemini: ${geminiResponse.status} ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        console.dir(data, { depth: 10 });
        // Improved extraction: handle various Gemini response shapes
        let responseText = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts;
            if (Array.isArray(parts) && parts.length > 0 && typeof parts[0].text === 'string') {
                responseText = parts[0].text;
            } else if (typeof parts === 'object' && parts.text) {
                responseText = parts.text;
            }
        }
        if (!responseText) responseText = '[No response from Gemini]';
        res.json({ message: { content: responseText } });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            error: 'Failed to get AI response',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Update the server.listen to use the HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
