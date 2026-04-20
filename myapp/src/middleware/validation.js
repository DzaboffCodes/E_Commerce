const { body, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

// User validation rules
const validateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('first_name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    body('last_name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required'),
    handleValidationErrors
];

// Product validation rules
const validateProduct = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Product name must be 1-255 characters'),
    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Category cannot exceed 50 characters'),
    body('stock_quantity') 
        .optional()
        .trim()
        .isInt({min: 0})
        .withMessage('Stock quantity must be a non-negative integer'),
    body('image_url')
        .optional()
        .trim()
        .isURL({protocols: ['http', 'https'], require_protocol: true})
        .withMessage('Image URL must be a valid http/https URL'),
    handleValidationErrors
];

// Cart validation rules
const validateCartItem = [
    body('productId')
        .isInt({ min: 1 })
        .withMessage('Valid product ID required'),
    body('qty')
        .isInt({ min: 1, max: 99 })
        .withMessage('Quantity must be between 1 and 99'),
    handleValidationErrors
];

// Parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID required'),
    handleValidationErrors
];

const validateCartId = [
    param('cartId')
        .isInt({ min: 1 })
        .withMessage('Valid cart ID required'),
    handleValidationErrors
];

const validateItemId = [
    param('itemId')
        .isInt({ min: 1 })
        .withMessage('Valid item ID required'),
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateProduct,
    validateCartItem,
    validateId,
    validateCartId,
    validateItemId,
    handleValidationErrors
};