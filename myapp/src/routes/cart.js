const express = require('express');
const router = express.Router();

const { validateCartItem, validateCartId, validateItemId } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// POST /cart - Create new cart for user
router.post('/', isAuthenticated, cartController.createCart);

// GET /cart/:cartId - Get cart contents
router.get('/:cartId', isAuthenticated, validateCartId, cartController.getCart);

// POST /cart/:cartId/items - Add item to cart
router.post('/:cartId/items', 
    isAuthenticated, 
    validateCartId, 
    validateCartItem, 
    cartController.addToCart
);

// DELETE /cart/:cartId/items/:itemId - Remove item from cart
router.delete('/:cartId/items/:itemId', 
    isAuthenticated,
    validateCartId,
    validateItemId,
    cartController.removeFromCart
);

// POST /cart/:cartId/checkout - Checkout cart
router.post('/:cartId/checkout', 
    isAuthenticated, 
    validateCartId, 
    cartController.checkoutCart
);

module.exports = router;