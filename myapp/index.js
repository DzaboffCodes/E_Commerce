// Import Express Library 
const express = require('express');

// Import database
const db = require('./db');

// Return an instance of an Express application
const app = express();

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
})

// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});