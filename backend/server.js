const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup with more specific configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://habitharmony.onrender.com', 'https://habitharmony.vercel.app']
        : true,
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

// Chatbot endpoint with improved error handling and request validation
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, stream } = req.body;
        
        // Validate request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Messages array is required and must not be empty'
            });
        }

        // In production, use the external Ollama service URL
        const OLLAMA_URL = process.env.NODE_ENV === 'production' 
            ? process.env.OLLAMA_SERVICE_URL || 'https://ollama.habitharmony.onrender.com'
            : process.env.OLLAMA_URL || 'http://localhost:11434';
        
        // Only check Ollama in development
        if (process.env.NODE_ENV !== 'production') {
            const ollamaReady = await waitForOllama();
            if (!ollamaReady) {
                throw new Error('Ollama service is not available');
            }
        }

        // Forward the request to Ollama API
        const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
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
            
            // Add error handling for the stream
            ollamaResponse.body.on('error', (error) => {
                console.error('Stream error:', error);
                res.end();
            });
            
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
