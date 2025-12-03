require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const postRoutes = require('./routes/postRoutes');
const photoRoutes = require('./routes/photoRoutes');
const path = require('path');
const cors = require('cors');
const { shouldUseCloudinary } = require('./config/storageUtils');

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://protienlab-frontend.onrender.com',
        'https://proteinlab.tn',
        'https://www.proteinlab.tn'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
// Serve static uploads (for backward compatibility with unmigrated local paths)
// In production with Cloudinary, new uploads go to Cloudinary, but old local paths may still exist
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/photos', photoRoutes);

// Global error handler middleware (must be last)
app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:', err);
    console.error('❌ Error Stack:', err.stack);
    
    // If response was already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }
    
    // Send JSON error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Check for required environment variables
if (!process.env.JWT_SECRET) {
    console.error('⚠️  WARNING: JWT_SECRET is not set! Authentication will fail.');
    console.error('Please set JWT_SECRET in your environment variables.');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is missing - authentication endpoints will fail!');
    }
});