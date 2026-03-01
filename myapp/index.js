// Load environment variables
require('dotenv').config();

// Import Express Library 
const express = require('express');

// Import bcrypt
const bcrypt = require('bcrypt');

// Import database
const db = require('./db');

// Import security middleware
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Return an instance of an Express application
const app = express();

// Import Passport.js for Password Auth
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

// Define Port 
const PORT = 3000;

// Security middleware
app.use(helmet()); // Adds security headers
app.use(cors({
    origin: 'http://localhost:3000', // Update with your frontend URL
    credentials: true // Allow cookies
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback-secret-key', // Use env variable
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Complete the serialization of User
passport.serializeUser((user, done) => {
    done(null, user.id);
});
// Complete the deserialization of User
passport.deserializeUser((id, done) => {
    db.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [id]) 
        .then(result => {
            if (result.rows.length > 0) {
                done(null, result.rows[0]);
            } else {
                done(new Error('User not found'), null);
            }
        })
        .catch(err => {
            console.error('Error during deserialization:', err);
            done(err, null);
        });
});
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        }
        catch (err) {
            console.error('Error during authentication:', err);
            return done(err);
        }
    })
);

// Get Route for Home Page
app.get('/', (req, res) => {
    console.log('Home route accessed');
    res.send('Welcome to the E-Commerce API!');
});

// Test Get Route for db connection
app.get('/db-test', async(req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: "Database connected",
            time: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database connection failed.")
    }
});

// Test another API endpoint
// app.get('/products', async(req, res) => {
//     try {
//         const products = await db.query("SELECT * FROM products");
//         res.json(products.rows)
//     } catch(err) {
//         console.error(err);
//         res.status(500).send("Server Error")
//     }
// });

// New User Registration POST /register 
app.post('/register', 
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('first_name').trim().isLength({ min: 1 }).withMessage('First name required'),
        body('last_name').trim().isLength({ min: 1 }).withMessage('Last name required')
    ],
    async (req, res) => {
        console.log('Register route accessed with data:', req.body);
        
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {email, password, first_name, last_name} = req.body;

        try {
        // Check if user already exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({message: "User already exists"});
        }
        
        // Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user
        const newUser = await db.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, first_name, last_name]
        );
        
        // Send back the new user
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({message: 'Server error during registration'});
    }
});

// Retrieve Specific User
app.get('/users/:id', async(req, res) => {
    const {id} = req.params;
    try{
        const user = await db.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user.rows[0]);
    } catch(err) {
        console.error("Retrevial of User Information Not Found", err);
        res.status(500).json({message:'Server error'})
    }
});

// Update User 
app.put('/users/:id', async(req, res) => {
    const {id} = req.params;
    const {email, first_name, last_name} = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        
        // Update the user
        const updatedUser = await db.query(
            'UPDATE users SET email = $1, first_name = $2, last_name = $3 WHERE id = $4 RETURNING id, email, first_name, last_name',
            [email, first_name, last_name, id]
        );
        res.json({
            message: 'User updated successfully',
            user: updatedUser.rows[0]
        });
    }
        catch(err) {
        console.error("User Update Failed", err);
        res.status(500).json({message: 'Server error during user update'});
        }
})

// POST /auth/login - The endpoint to log in
app.post('/auth/login', 
    authLimiter, // Apply rate limiting
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        passport.authenticate('local')(req, res, next);
    },
    (req, res) => {
        // If this function is reached, login was successful!
        res.json({
            message: "Login successful",
            user: req.user // Passport populates req.user after successful login
        });
    }
);

// Get all products OR filter by category
app.get('/products', async (req, res) => {
    const { category } = req.query; 

    try {
        let result;
        if (category) {
            result = await db.query('SELECT * FROM products WHERE category = $1', [category]);
        } else {
            result = await db.query('SELECT * FROM products');
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// Get specific product route
app.get('/products/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (product.rows.length === 0) {
            return res.status(404).json({message: "Product not found"});
        }
        res.json(product.rows[0]);
    }
    catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({message: 'Server error while fetching product'});
    }
}
);

// Post new product
app.post('/products', 
    [
        body('name').trim().isLength({ min: 1 }).withMessage('Product name required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('description').optional().trim(),
        body('category').optional().trim()
    ],
    async (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {name, description, price, category} = req.body;
    
    try {
        const newProduct = await db.query(
            'INSERT INTO products (name, description, price, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, category]
        );
        res.status(201).json({
            message: 'Product created successfully',
            product: newProduct.rows[0]
        });
    }
    catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({message: 'Server error during product creation'});
    }
}
);

// Update product
app.put('/products/:id', async (req, res) => {
    const {id} = req.params;
    const {name, description, price, category} = req.body;
    
    try {
        // Check if product exists
        const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [id]);  
        if (productCheck.rows.length === 0) {
            return res.status(404).json({message: "Product not found"});
        }
        const updatedProduct = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category = $4 WHERE id = $5 RETURNING *',
            [name, description, price, category, id]
        );
        res.json({
            message: 'Product updated successfully',
            product: updatedProduct.rows[0]
        });
    }
    catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({message: 'Server error during product update'});
    }
}
);

// Delete Product
app.delete('/products/:id', async (req, res) => {
    const {id} = req.params;
    try {
        // Check if product exists
        const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({message: "Product not found"});
        }
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({message: "Product deleted successfully"});
    }
    catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({message: 'Server error during product deletion'});
    }
}
);

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({message: 'Authentication required'});
}

// Post Cart - Create new cart for user 
app.post('/cart', isAuthenticated, async(req, res) => {
    const userId = req.user.id;
    try {
        // --- UPDATED QUERY ---
        const newCart = await db.query(
            'INSERT INTO cart ("userid") VALUES ($1) RETURNING *',
            [userId]
        );
        // ---------------------
        res.status(201).json({
            message: 'Cart created successfully',
            cart: newCart.rows[0]
        });
    } catch (err) {
        console.error('Error creating cart:', err);
        res.status(500).json({message: 'Server error during cart creation'});
    }
});

// Post CardId - Add product to a specific cartId
app.post('/cart/:cartId/items', 
    isAuthenticated,
    [
        body('productId').isInt({ min: 1 }).withMessage('Valid product ID required'),
        body('qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    async(req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {cartId} = req.params;
        const {productId, qty} = req.body;
    try {
        const cartCheck = await db.query('SELECT * FROM cart WHERE id = $1', [cartId]);
        if (cartCheck.rows.length === 0) {
            return res.status(404).json({message: "Cart not found"});
        }
        
        // --- UPDATED QUERY ---
        const addedItem = await db.query(
            'INSERT INTO cart_items ("cartid", "productid", qty) VALUES ($1, $2, $3) RETURNING *',
            [cartId, productId, qty]
        );
        // ---------------------
        
        res.status(201).json({
            message: 'Product added to cart successfully',
            cartItem: addedItem.rows[0]
        });
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).json({message: 'Server error during adding product to cart'});
    }
});

// GET /cart/:cartId - Retrieve items in a specific cart
app.get('/cart/:cartId', isAuthenticated, async (req, res) => {
    const { cartId } = req.params;

    try {
        // 1. Join tables to get product details for the cart items
        const result = await db.query(
            `SELECT 
                ci.id AS cart_item_id,
                p.name AS product_name,
                p.price,
                ci.qty
             FROM cart_items ci
             JOIN products p ON ci."productid" = p.id
             WHERE ci."cartid" = $1`,
            [cartId]
        );

        // 2. Check if the cart exists or is empty
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cart not found or is empty" });
        }

        // 3. Send back the items
        res.json({
            cartId: cartId,
            items: result.rows
        });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
});

// Delete Product from Cart 
app.delete('/cart/:cartId/items/:itemId', isAuthenticated, async (req, res) => {
    const { cartId, itemId } = req.params;
    const userId = req.user.id; // Get logged in user's ID

    // --- ADD THIS LOG ---
    console.log(`Attempting to delete Item ${itemId} from Cart ${cartId} by User ${userId}`);
    // --------------------
    
    try {
        // 1. Check if the cart belongs to the user, and if the item is in it
        // Note: Using "cartid" as you verified.
        const itemCheck = await db.query(
            `SELECT ci.id 
             FROM cart_items ci
             JOIN cart c ON ci.cartid = c.id
             WHERE ci.id = $1 AND ci.cartid = $2 AND c.userid = $3`,
            [itemId, cartId, userId]
        );

        // --- ADD THIS LOG ---
        console.log('Query result:', itemCheck.rows);
        // --------------------

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found or does not belong to you" });
        }
        
        // 2. Delete the cart item
        await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
        res.json({ message: "Cart item deleted successfully" });
    }
    catch (err) {
        console.error('Error deleting cart item:', err);
        res.status(500).json({ message: 'Server error during cart item deletion' });
    }
});

// POST /cart/:cartId/checkout - Final Checkout Endpoint
app.post('/cart/:cartId/checkout', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const { cartId } = req.params; // CartId comes from URL params now

    try {
        // 1. Fetch cart items and verify ownership
        const cartItems = await db.query(
            `SELECT ci.qty, p.price, ci.productid, p.name, p.description
                FROM cart_items ci
                JOIN cart c ON ci.cartid = c.id
                JOIN products p ON ci.productid = p.id
                WHERE c.id = $1 AND c.userid = $2`,
            [cartId, userId]
        );

        if (cartItems.rows.length === 0) {
            return res.status(404).json({ message: "Cart not found, empty, or does not belong to you" });
        }

        // 2. Calculate total price
        const totalPrice = cartItems.rows.reduce((total, item) => total + item.qty * item.price, 0);

        // 3. Create new order
        const newOrder = await db.query(
            'INSERT INTO orders (userid, total, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, totalPrice, 'pending']
        );
        const orderId = newOrder.rows[0].id;

        // 4. Insert order items
        for (const item of cartItems.rows) {
            await db.query(
                'INSERT INTO order_items (orderid, productid, qty, price, name, description) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, item.productid, item.qty, item.price, item.name, item.description]
            );
        }

        // 5. Clear the cart
        await db.query('DELETE FROM cart_items WHERE cartid = $1', [cartId]);

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder.rows[0]
        });
    }
    catch (err) {
        console.error('Error during checkout:', err);
        res.status(500).json({ message: 'Server error during checkout' });
    }
});

// Get All Orders
app.get('/orders', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await db.query('SELECT * FROM orders WHERE userid = $1', [userId]);
        res.json(orders.rows);
    }
    catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({message: 'Server error while fetching orders'});
    }
}
);

// Get Specific Order by Id with Items - DEBUGGING VERSION
app.get('/orders/:id', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const {id} = req.params;
    
    console.log(`Debug: Fetching Order ID ${id} for User ${userId}`);
    
    try {
        const orderResult = await db.query(
            'SELECT * FROM orders WHERE id = $1 AND userid = $2',
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            console.log(`Debug: Order ${id} not found or unauthorized`);
            return res.status(404).json({message: "Order not found or does not belong to you"});
        }

        // --- DEBUGGING LOG ---
        console.log(`Debug: Order found. Fetching items for orderid: ${id}`);
        // ---------------------

        const itemsResult = await db.query(
            'SELECT * FROM order_items WHERE orderid = $1',
            [id]
        );
        
        // --- DEBUGGING LOG ---
        console.log(`Debug: Found ${itemsResult.rows.length} items`);
        // ---------------------

        const order = orderResult.rows[0];
        order.items = itemsResult.rows;

        res.json(order);
    }
    catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({message: 'Server error while fetching order'});
    }
});


// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});