const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/logger');

// Get all orders for user
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0, status } = req.query;
        
        let query = 'SELECT * FROM orders WHERE userid = $1';
        let params = [userId];
        
        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }
        
        query += ' ORDER BY created DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await db.query(query, params);
        
        successResponse(res, {
            orders: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: result.rows.length
            }
        }, 'Orders retrieved successfully');
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        errorResponse(res, 'Server error while fetching orders', 500, 'FETCH_ORDERS_ERROR');
    }
};

// Get specific order by ID with items
const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        console.log(`Debug: Fetching Order ID ${id} for User ${userId}`);
        
        // Get the order
        const orderResult = await db.query(
            'SELECT * FROM orders WHERE id = $1 AND userid = $2',
            [id, userId]
        );
        
        if (orderResult.rows.length === 0) {
            console.log(`Debug: Order ${id} not found or unauthorized`);
            return errorResponse(res, 'Order not found or does not belong to you', 404, 'ORDER_NOT_FOUND');
        }
        
        console.log(`Debug: Order found. Fetching items for orderid: ${id}`);
        
        // Get order items
        const itemsResult = await db.query(
            'SELECT * FROM order_items WHERE orderid = $1',
            [id]
        );
        
        console.log(`Debug: Found ${itemsResult.rows.length} items`);
        
        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        
        successResponse(res, {
            order: order
        }, 'Order retrieved successfully');
        
    } catch (error) {
        console.error('Error fetching order:', error);
        errorResponse(res, 'Server error while fetching order', 500, 'FETCH_ORDER_ERROR');
    }
};

// Update order status (admin functionality)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid status value', 400, 'INVALID_STATUS');
        }
        
        // Check if order exists
        const orderCheck = await db.query('SELECT id FROM orders WHERE id = $1', [id]);
        if (orderCheck.rows.length === 0) {
            return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
        }
        
        // Update order status
        const result = await db.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        successResponse(res, {
            order: result.rows[0]
        }, 'Order status updated successfully');
        
    } catch (error) {
        console.error('Error updating order status:', error);
        errorResponse(res, 'Server error during order status update', 500, 'UPDATE_ORDER_ERROR');
    }
};

// Cancel order (user functionality)
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        // Check if order exists and belongs to user
        const orderResult = await db.query(
            'SELECT * FROM orders WHERE id = $1 AND userid = $2',
            [id, userId]
        );
        
        if (orderResult.rows.length === 0) {
            return errorResponse(res, 'Order not found or does not belong to you', 404, 'ORDER_NOT_FOUND');
        }
        
        const order = orderResult.rows[0];
        
        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return errorResponse(res, 'Order cannot be cancelled', 400, 'ORDER_CANNOT_CANCEL');
        }
        
        // Update order status to cancelled
        const result = await db.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['cancelled', id]
        );
        
        successResponse(res, {
            order: result.rows[0]
        }, 'Order cancelled successfully');
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        errorResponse(res, 'Server error during order cancellation', 500, 'CANCEL_ORDER_ERROR');
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};