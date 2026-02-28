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

// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});