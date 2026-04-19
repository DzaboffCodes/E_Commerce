const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/logger');

// Register new user
const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;

        // Check if user already exists
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return errorResponse(res, 'User with this email already exists', 400, 'EMAIL_EXISTS');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const newUser = await db.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, first_name, last_name]
        );

        successResponse(res, {
            user: newUser.rows[0]
        }, 'User registered successfully', 201);

    } catch (error) {
        console.error('Registration error:', error);
        errorResponse(res, 'Server error during registration', 500, 'REGISTRATION_ERROR');
    }
};

// Login user
const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return errorResponse(res, 'Server error during authentication', 500, 'AUTH_ERROR');
        }

        if (!user) {
            return errorResponse(res, info.message || 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return errorResponse(res, 'Server error during login', 500, 'LOGIN_ERROR');
            }

            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            
            successResponse(res, {
                user: userWithoutPassword
            }, 'Login successful');
        });
    })(req, res, next);
};

// Logout user
const logout = (req, res) => {
    if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return errorResponse(res, 'Server error during logout', 500, 'LOGOUT_ERROR');
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return errorResponse(res, 'Server error during session cleanup', 500, 'SESSION_ERROR');
            }

            res.clearCookie('connect.sid'); // Clear session cookie
            successResponse(res, null, 'Logout successful');
        });
    });
};

// Get current user
const getCurrentUser = (req, res) => {
    if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    successResponse(res, {
        user: req.user
    }, 'User data retrieved');
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};