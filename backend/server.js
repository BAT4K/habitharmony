const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
    'http://localhost:5173', // Local development
    'https://habitharmony.vercel.app/' // Replace with your Vercel frontend URL
  ];
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Update this with your frontend URL
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});