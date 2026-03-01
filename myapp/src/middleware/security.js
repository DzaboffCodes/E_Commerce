const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: 'Too many authentication attempts, try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs for general endpoints
    message: 'Too many requests, try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Security middleware setup function
const setupSecurity = (app) => {
    // Security headers
    app.use(helmet());
    
    // CORS configuration
    app.use(cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // General rate limiting
    app.use(generalLimiter);
};

module.exports = {
    setupSecurity,
    authLimiter,
    generalLimiter
};