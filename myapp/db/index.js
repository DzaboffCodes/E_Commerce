// Load the environment variables from .env files
require('dotenv').config();

// Import the Pool object from the pg library 
const { Pool } = require('pg');

// Initialize the Pool using the process.env
const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT
});

// Export a helper function that allows us to run pool.query throughout the app
module.exports = {
    query: (text, params) => pool.query(text,params)
};