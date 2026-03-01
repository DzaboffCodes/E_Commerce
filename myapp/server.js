// Load environment variables first
require('dotenv').config();

const express = require('express');
const passport = require('passport');
const session = require('express-session');

// Import configurations
require('./src/config/passport');

// Import middleware
const { setupSecurity } = require('./src/middleware/security');
const { requestLogger } = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply security middleware
setupSecurity(app);

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the E-Commerce API!',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Database connection test
app.get('/health', async (req, res) => {
    try {
        const db = require('./src/config/database');
        await db.query('SELECT 1');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Resource not found',
        path: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}`);
});

module.exports = app;