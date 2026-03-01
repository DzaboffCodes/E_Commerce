const express = require('express');
const router = express.Router();

const { validateId } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET /users/:id - Get user by ID
router.get('/:id', validateId, userController.getUserById);

// PUT /users/:id - Update user
router.put('/:id', validateId, isAuthenticated, userController.updateUser);

// DELETE /users/:id - Delete user (admin only - be careful!)
router.delete('/:id', validateId, isAuthenticated, userController.deleteUser);

module.exports = router;