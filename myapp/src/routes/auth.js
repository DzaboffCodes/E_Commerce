const express = require('express');
const router = express.Router();
const passport = require('passport');

const { authLimiter } = require('../middleware/security');
const { validateLogin, validateRegistration } = require('../middleware/validation');
const authController = require('../controllers/authController');

// POST /auth/register - User registration
router.post('/register', validateRegistration, authController.register);

// POST /auth/login - User login
router.post('/login', authLimiter, validateLogin, authController.login);

// POST /auth/logout - User logout
router.post('/logout', authController.logout);

// GET /auth/me - Get current user info
router.get('/me', authController.getCurrentUser);

module.exports = router;