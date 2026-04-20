const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/logger');

// Get all products or filter by category
const getAllProducts = async (req, res) => {
    try {
        const { category, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM products';
        let params = [];

        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }

        query += ' ORDER BY id ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, params);

        successResponse(res, {
            products: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: result.rows.length
            }
        }, 'Products retrieved successfully');

    } catch (error) {
        console.error('Error fetching products:', error);
        errorResponse(res, 'Server error while fetching products', 500, 'FETCH_PRODUCTS_ERROR');
    }
};

// Get specific product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        successResponse(res, {
            product: result.rows[0]
        }, 'Product retrieved successfully');

    } catch (error) {
        console.error('Error fetching product:', error);
        errorResponse(res, 'Server error while fetching product', 500, 'FETCH_PRODUCT_ERROR');
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity, image_url } = req.body;

        const result = await db.query(
            'INSERT INTO products (name, description, price, category, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, category, stock_quantity, image_url]
        );

        successResponse(res, {
            product: result.rows[0]
        }, 'Product created successfully', 201);

    } catch (error) {
        console.error('Error creating product:', error);
        errorResponse(res, 'Server error during product creation', 500, 'CREATE_PRODUCT_ERROR');
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock_quantity, image_url } = req.body;

        // Check if product exists
        const existingProduct = await db.query('SELECT id FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length === 0) {
            return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        const result = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock_quantity = $5, image_url = $6 WHERE id = $5 RETURNING *',
            [name, description, price, category, stock_quantity, image_url]
        );

        successResponse(res, {
            product: result.rows[0]
        }, 'Product updated successfully');

    } catch (error) {
        console.error('Error updating product:', error);
        errorResponse(res, 'Server error during product update', 500, 'UPDATE_PRODUCT_ERROR');
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const existingProduct = await db.query('SELECT id FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length === 0) {
            return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        await db.query('DELETE FROM products WHERE id = $1', [id]);

        successResponse(res, null, 'Product deleted successfully');

    } catch (error) {
        console.error('Error deleting product:', error);
        errorResponse(res, 'Server error during product deletion', 500, 'DELETE_PRODUCT_ERROR');
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};