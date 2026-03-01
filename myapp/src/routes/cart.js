const express = require('express');
const router = express.Router();

// TODO: Implement cart routes
// POST /cart - Create cart
// GET /cart/:cartId - Get cart contents
// POST /cart/:cartId/items - Add item to cart
// DELETE /cart/:cartId/items/:itemId - Remove item from cart
// POST /cart/:cartId/checkout - Checkout cart

router.post('/', (req, res) => {
    res.json({ message: 'Cart routes - Coming soon!' });
});

module.exports = router;