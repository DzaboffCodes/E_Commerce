const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/logger');

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1', 
            [id]
        );
        
        if (result.rows.length === 0) {
            return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
        }
        
        successResponse(res, {
            user: result.rows[0]
        }, 'User retrieved successfully');
        
    } catch (error) {
        console.error('Error fetching user:', error);
        errorResponse(res, 'Server error while fetching user', 500, 'FETCH_USER_ERROR');
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, first_name, last_name } = req.body;
        
        // Check if user exists
        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
        }
        
        // Update the user
        const result = await db.query(
            'UPDATE users SET email = $1, first_name = $2, last_name = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, first_name, last_name, updated_at',
            [email, first_name, last_name, id]
        );
        
        successResponse(res, {
            user: result.rows[0]
        }, 'User updated successfully');
        
    } catch (error) {
        console.error('Error updating user:', error);
        errorResponse(res, 'Server error during user update', 500, 'UPDATE_USER_ERROR');
    }
};

// Delete user (optional - be careful with this in production)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
        }
        
        // In production, you might want to soft delete or anonymize instead
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        
        successResponse(res, null, 'User deleted successfully');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        errorResponse(res, 'Server error during user deletion', 500, 'DELETE_USER_ERROR');
    }
};

module.exports = {
    getUserById,
    updateUser,
    deleteUser
};