// Import Express Library 
const express = require('express');

// Return an instance of an Express application
const app = express();

// Define Port 
const PORT = 3000;

// Get Route for Home Page
app.get('/',(req, res) => {
    res.send('Welcome to the E-Commerce API!');
});

// App listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});