const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
// Temporarily comment out payment routes
// const paymentRoutes = require('./routes/payment');
// app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Use a public Ollama API endpoint
        const OLLAMA_URL = process.env.OLLAMA_URL || 'https://ollama.ai/api';
        const ollamaResponse = await fetch(`${OLLAMA_URL}/tags`);
        
        if (!ollamaResponse.ok) {
            throw new Error('Ollama service is not responding');
        }
        
        res.json({ 
            status: 'healthy',
            ollama: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ 
            status: 'unhealthy',
            ollama: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, stream } = req.body;
        
        // Use a public Ollama API endpoint
        const OLLAMA_URL = process.env.OLLAMA_URL || 'https://ollama.ai/api';
        
        // Forward the request to Ollama API
        const ollamaResponse = await fetch(`${OLLAMA_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "phi3:mini",
                messages: messages,
                stream: stream || false
            }),
        });

        if (!ollamaResponse.ok) {
            const errorData = await ollamaResponse.text();
            console.error('Ollama API error:', errorData);
            throw new Error(`Failed to get response from Ollama: ${ollamaResponse.status} ${ollamaResponse.statusText}`);
        }

        // If streaming is requested, pipe the response
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            ollamaResponse.body.pipe(res);
            
            // Handle client disconnect
            req.on('close', () => {
                ollamaResponse.body.destroy();
            });
        } else {
            const data = await ollamaResponse.json();
            res.json(data);
        }
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
