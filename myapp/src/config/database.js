// Database configuration module
const { Pool } = require('pg');

// Initialize the Pool using the process.env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Additional pool settings for production
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Export a helper function that allows us to run pool.query throughout the app
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool // Export pool for advanced usage if needed
};

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});