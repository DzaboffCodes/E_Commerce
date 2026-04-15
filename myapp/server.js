// Load environment variables first
require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");

// Import configurations
require("./src/config/passport");

// Import Swagger documentation
const { swaggerUi, specs } = require("./src/config/swagger");

// Import middleware
const { setupSecurity } = require("./src/middleware/security");
const { requestLogger } = require("./src/utils/logger");

// Import routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const productRoutes = require("./src/routes/products");
const cartRoutes = require("./src/routes/cart");
const orderRoutes = require("./src/routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

// Apply security middleware
setupSecurity(app);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    // No store specified = defaults to MemoryStore
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use(requestLogger);

// Add debug middleware to see all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
console.log("Registering base route at /");
app.get("/", (req, res) => {
  console.log("Base route hit");
  res.json({
    message: "Welcome to the E-Commerce API!",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Database connection test
console.log("Registering health route at /health");
app.get("/health", async (req, res) => {
  console.log("Health route hit");
  try {
    const db = require("./src/config/database");
    await db.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome Message
 *     description: Returns a welcome message and API status
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the E-Commerce API!"
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check the health status of the API and database connection
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 */

// Swagger Documentation
console.log("Setting up Swagger at /docs...");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
console.log("Swagger setup complete");

// Mount routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler for all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    message: "Resource not found",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
});

module.exports = app;
