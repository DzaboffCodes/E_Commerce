// Import Express Library 
const express = require('express');

// Import bcrypt
const bcrypt = require('bcrypt');

// Import database
const db = require('./db');

// Return an instance of an Express application
const app = express();

app.use(express.json());

// Define Port 
const PORT = 3000;

// Get Route for Home Page
app.get('/',(req, res) => {
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
app.get('/products', async(req, res) => {
    try {
        const products = await db.query("SELECT * FROM products");
        res.json(products.rows)
    } catch(err) {
        console.error(err);
        res.status(500).send("Server Error")
    }
});

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


// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});