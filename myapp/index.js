// Import Express Library 
const express = require('express');

// Import bcrypt
const bcrypt = require('bcrypt');

// Import database
const db = require('./db');

// Return an instance of an Express application
const app = express();

// Import Passport.js for Password Auth
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

// Define Port 
const PORT = 3000;

app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

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
app.post('/register', async (req, res) => {
    const {email, password, first_name, last_name} = req.body;
    
    // Validation Logic 
    if (!email || !password) {
        return res.status(400).json({message:"Email and password are required"});
    }

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
app.post('/auth/login', passport.authenticate('local'), (req, res) => {
    // If this function is reached, login was successful!
    res.json({
        message: "Login successful",
        user: req.user // Passport populates req.user after successful login
    });
});

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
app.post('/products', async (req, res) => {
    const {name, description, price, category} = req.body;
    
    // Validation Logic 
    if (!name || !price) {
        return res.status(400).json({message:"Name and price are required"});
    }
    
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



// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});