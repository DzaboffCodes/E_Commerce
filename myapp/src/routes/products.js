const express = require('express');
const router = express.Router();

const { validateProduct, validateId } = require('../middleware/validation');
const { isAuthenticated, requireAdmin } = require('../middleware/auth');
const productController = require('../controllers/productController');

// GET /products - Get all products or filter by category
router.get('/', productController.getAllProducts);

// GET /products/:id - Get specific product
router.get('/:id', validateId, productController.getProductById);

// POST /products - Create new product (admin only in future)
router.post('/', validateProduct, productController.createProduct);

// PUT /products/:id - Update product (admin only in future)
router.put('/:id', validateId, validateProduct, productController.updateProduct);

// DELETE /products/:id - Delete product (admin only in future)
router.delete('/:id', validateId, productController.deleteProduct);

module.exports = router;