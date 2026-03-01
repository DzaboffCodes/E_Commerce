const express = require('express');
const router = express.Router();

const { validateId } = require('../middleware/validation');
const { isAuthenticated, requireAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// GET /orders - Get all orders for authenticated user
router.get('/', isAuthenticated, orderController.getAllOrders);

// GET /orders/:id - Get specific order by ID
router.get('/:id', isAuthenticated, validateId, orderController.getOrderById);

// PUT /orders/:id/status - Update order status (admin only)
router.put('/:id/status', isAuthenticated, validateId, orderController.updateOrderStatus);

// POST /orders/:id/cancel - Cancel order (user can cancel their own)
router.post('/:id/cancel', isAuthenticated, validateId, orderController.cancelOrder);

module.exports = router;