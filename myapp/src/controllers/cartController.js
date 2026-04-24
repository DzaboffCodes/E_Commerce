const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/logger');

// Create new cart for user
const createCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await db.query(
            'INSERT INTO cart ("userid") VALUES ($1) RETURNING *',
            [userId]
        );
        
        successResponse(res, {
            cart: result.rows[0]
        }, 'Cart created successfully', 201);
        
    } catch (error) {
        console.error('Error creating cart:', error);
        errorResponse(res, 'Server error during cart creation', 500, 'CREATE_CART_ERROR');
    }
};

// Get cart contents
const getCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId = req.user.id;

        // 1) Verify cart exists and belongs to this user
        const cartCheck = await db.query(
            'SELECT id FROM cart WHERE id = $1 AND userid = $2',
            [cartId, userId]
        );

        if (cartCheck.rows.length === 0) {
            return errorResponse(res, 'Cart not found or does not belong to you', 404, 'CART_NOT_FOUND');
        }

        // 2) Fetch cart items
        const result = await db.query(
            `SELECT
                ci.id AS cart_item_id,
                p.id AS product_id,
                p.name AS product_name,
                p.price,
                ci.qty,
                (p.price * ci.qty) AS subtotal
             FROM cart_items ci
             JOIN products p ON ci."productid" = p.id
             WHERE ci."cartid" = $1`,
            [cartId]
        );

        // 3) Empty cart should still be a successful response
        if (result.rows.length === 0) {
            return successResponse(res, {
                cartId: cartId,
                items: [],
                total: "0.00"
            }, 'Cart retrieved successfully');
        }

        // 4) Compute total for non-empty cart
        const total = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        successResponse(res, {
            cartId: cartId,
            items: result.rows,
            total: total.toFixed(2)
        }, 'Cart retrieved successfully');
    } catch (error) {
        console.error('Error fetching cart:', error);
        errorResponse(res, 'Server error while fetching cart', 500, 'FETCH_CART_ERROR');
    }
};

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, qty } = req.body;
        
        // Check if cart exists and belongs to user
        const cartCheck = await db.query(
            'SELECT * FROM cart WHERE id = $1 AND userid = $2', 
            [cartId, req.user.id]
        );
        
        if (cartCheck.rows.length === 0) {
            return errorResponse(res, 'Cart not found or does not belong to you', 404, 'CART_NOT_FOUND');
        }
        
        // Check if product exists
        const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productCheck.rows.length === 0) {
            return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        
        // Check if item already exists in cart
        const existingItem = await db.query(
            'SELECT * FROM cart_items WHERE cartid = $1 AND productid = $2',
            [cartId, productId]
        );
        
        let result;
        if (existingItem.rows.length > 0) {
            // Update quantity if item exists
            result = await db.query(
                'UPDATE cart_items SET qty = qty + $1 WHERE cartid = $2 AND productid = $3 RETURNING *',
                [qty, cartId, productId]
            );
        } else {
            // Insert new item
            result = await db.query(
                'INSERT INTO cart_items ("cartid", "productid", qty) VALUES ($1, $2, $3) RETURNING *',
                [cartId, productId, qty]
            );
        }
        
        successResponse(res, {
            cartItem: result.rows[0]
        }, 'Product added to cart successfully', 201);
        
    } catch (error) {
        console.error('Error adding product to cart:', error);
        errorResponse(res, 'Server error during adding product to cart', 500, 'ADD_TO_CART_ERROR');
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const userId = req.user.id;

    const itemCheck = await db.query(
      `SELECT ci.id, ci.qty
       FROM cart_items ci
       JOIN cart c ON ci.cartid = c.id
       WHERE ci.id = $1 AND ci.cartid = $2 AND c.userid = $3`,
      [itemId, cartId, userId]
    );

    if (itemCheck.rows.length === 0) {
      return errorResponse(res, 'Cart item not found or does not belong to you', 404, 'CART_ITEM_NOT_FOUND');
    }

    const currentQty = itemCheck.rows[0].qty;

    if (currentQty > 1) {
      await db.query('UPDATE cart_items SET qty = qty - 1 WHERE id = $1', [itemId]);
      return successResponse(res, null, 'Cart item quantity decreased');
    }

    await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    successResponse(res, null, 'Cart item deleted successfully');
  } catch (error) {
    console.error('Error deleting cart item:', error);
    errorResponse(res, 'Server error during cart item deletion', 500, 'DELETE_CART_ITEM_ERROR');
  }
};

// Checkout cart
const checkoutCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartId } = req.params;
        
        // Fetch cart items and verify ownership
        const cartItems = await db.query(
            `SELECT ci.qty, p.price, ci.productid, p.name, p.description
                FROM cart_items ci
                JOIN cart c ON ci.cartid = c.id
                JOIN products p ON ci.productid = p.id
                WHERE c.id = $1 AND c.userid = $2`,
            [cartId, userId]
        );
        
        if (cartItems.rows.length === 0) {
            return errorResponse(res, 'Cart not found, empty, or does not belong to you', 404, 'CART_CHECKOUT_ERROR');
        }
        
        // Calculate total price
        const totalPrice = cartItems.rows.reduce((total, item) => total + item.qty * item.price, 0);
        
        // Create new order
        const newOrder = await db.query(
            'INSERT INTO orders (userid, total, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, totalPrice, 'pending']
        );
        const orderId = newOrder.rows[0].id;
        
        // Insert order items
        for (const item of cartItems.rows) {
            await db.query(
                'INSERT INTO order_items (orderid, productid, qty, price, name, description) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, item.productid, item.qty, item.price, item.name, item.description]
            );
        }
        
        // Clear the cart
        await db.query('DELETE FROM cart_items WHERE cartid = $1', [cartId]);
        
        successResponse(res, {
            order: newOrder.rows[0]
        }, 'Order created successfully', 201);
        
    } catch (error) {
        console.error('Error during checkout:', error);
        errorResponse(res, 'Server error during checkout', 500, 'CHECKOUT_ERROR');
    }
};

module.exports = {
    createCart,
    getCart,
    addToCart,
    removeFromCart,
    checkoutCart
};