const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic API information
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce API built with Node.js, Express, and PostgreSQL. Features user authentication, product management, shopping cart, and order processing.',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.yourapp.com',
        description: 'Production server'
      }
    ],
    security: [
      {
        cookieAuth: []
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health check endpoints'
      },
      {
        name: 'Authentication',  
        description: 'User authentication and session management'
      },
      {
        name: 'Products',
        description: 'Product catalog management'
      },
      {
        name: 'Cart',
        description: 'Shopping cart operations'
      },
      {
        name: 'Orders',
        description: 'Order processing and management'
      },
      {
        name: 'Users',
        description: 'User profile management'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password (min 8 characters)',
              example: 'SecurePass123'
            },
            first_name: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            last_name: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Wireless Headphones'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'High-quality wireless headphones with noise cancellation'
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Product price',
              example: 99.99
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp'
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Cart ID',
              example: 1
            },
            userid: {
              type: 'integer',
              description: 'User ID who owns the cart',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Cart creation timestamp'
            }
          }
        },
        CartItem: {
          type: 'object',
          required: ['productId', 'qty'],
          properties: {
            id: {
              type: 'integer',
              description: 'Cart item ID',
              example: 1
            },
            cartid: {
              type: 'integer',
              description: 'Cart ID',
              example: 1
            },
            productId: {
              type: 'integer',
              description: 'Product ID',
              example: 1
            },
            qty: {
              type: 'integer',
              minimum: 1,
              maximum: 99,
              description: 'Quantity of the product',
              example: 2
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID',
              example: 1
            },
            userid: {
              type: 'integer',
              description: 'User ID who placed the order',
              example: 1
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total order amount',
              example: 199.98
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Order status',
              example: 'pending'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            },
            errorCode: {
              type: 'string',
              example: 'ERROR_CODE'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './server.js'] // Path to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};