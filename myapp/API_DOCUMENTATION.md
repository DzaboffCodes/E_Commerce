# 📚 E-Commerce API Documentation Guide

## 🎯 Overview

Your E-Commerce API now includes comprehensive **Swagger/OpenAPI 3.0 documentation** that provides a complete, interactive interface for testing and understanding all endpoints.

## 🚀 Quick Start

### 1. Start the Server
```bash
cd /path/to/myapp
node server.js
```

### 2. Access Documentation
- **Swagger UI**: `http://localhost:3000/docs`
- **API Health Check**: `http://localhost:3000/health`
- **API Base URL**: `http://localhost:3000`

## 📋 API Endpoints Summary

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (session-based)
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### 📦 Products (`/products`)
- `GET /products` - List all products (with pagination & filtering)
- `POST /products` - Create product (Admin access planned)
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product (Admin access planned)
- `DELETE /products/{id}` - Delete product (Admin access planned)

### 🛒 Shopping Cart (`/cart`)
- `POST /cart` - Create new cart
- `GET /cart/{cartId}` - Get cart contents
- `POST /cart/{cartId}/items` - Add item to cart
- `DELETE /cart/{cartId}/items/{itemId}` - Remove item from cart
- `POST /cart/{cartId}/checkout` - Checkout cart (creates order)

### 📋 Orders (`/orders`)
- `GET /orders` - Get user's orders (with pagination & filtering)
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}/status` - Update order status (Admin access planned)
- `POST /orders/{id}/cancel` - Cancel order (own orders only)

### 👤 Users (`/users`)
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile (own profile only)
- `DELETE /users/{id}` - Delete user account (permanent!)

## 🔒 Authentication System

### Session-Based Security
- **Type**: Cookie-based sessions using `express-session`
- **Cookie Name**: `connect.sid`
- **Security**: HttpOnly, Secure (in production), SameSite protection

### How to Authenticate in Swagger UI:
1. First, call `POST /auth/login` with valid credentials
2. The session cookie is automatically stored
3. All subsequent requests use the session automatically
4. Use `POST /auth/logout` to end the session

### Rate Limiting
- **Auth endpoints**: 5 attempts per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

## 📊 Data Models

### User Schema
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Product Schema
```json
{
  "id": 1,
  "name": "iPhone 14 Pro",
  "description": "Latest iPhone with advanced camera",
  "price": 999.99,
  "category": "Electronics",
  "stock_quantity": 50,
  "image_url": "https://example.com/image.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Order Schema
```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 1299.99,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## 🛠️ Testing the API

### Using Swagger UI (Recommended)
1. Navigate to `http://localhost:3000/docs`
2. Expand any endpoint section
3. Click "Try it out"
4. Fill in parameters/request body
5. Click "Execute"
6. View response data and status codes

### Using curl/Postman
```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login (save the session cookie)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'

# Get products (no auth required)
curl http://localhost:3000/products

# Create a cart (requires auth)
curl -X POST http://localhost:3000/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## 🏗️ API Architecture

### Modular Structure
```
src/
├── config/
│   ├── database.js      # PostgreSQL connection
│   ├── passport.js      # Authentication strategy
│   └── swagger.js       # API documentation config
├── controllers/         # Business logic
├── middleware/         # Auth, validation, security
├── routes/             # API endpoints
└── utils/              # Logging utilities
```

### Security Features
- ✅ **Helmet**: Security headers
- ✅ **CORS**: Cross-origin resource sharing
- ✅ **Rate Limiting**: DDoS protection
- ✅ **Input Validation**: express-validator
- ✅ **Password Hashing**: bcrypt
- ✅ **Session Management**: express-session
- ✅ **SQL Injection Protection**: Parameterized queries

### Error Handling
All API responses follow consistent format:
```json
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error Response  
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 📝 Documentation Features

### Interactive Testing
- Live API testing directly in browser
- Real-time response preview
- Request/response examples
- Schema validation

### Comprehensive Schema Documentation
- All request/response models documented
- Field types, constraints, and examples
- Validation rules and error codes
- Authentication requirements

### Tags & Organization
- Endpoints grouped by functionality
- Searchable interface
- Collapsible sections
- Clean, professional UI

## 🔧 Customization

### Adding New Endpoints
1. Create route in appropriate `/src/routes/` file
2. Add Swagger JSDoc comments above route:
```javascript
/**
 * @swagger
 * /your-endpoint:
 *   post:
 *     summary: Endpoint description
 *     tags: [YourTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success response
 */
router.post('/your-endpoint', controller.method);
```

### Modifying Documentation
- Edit `/src/config/swagger.js` for global settings
- Update individual route files for endpoint docs
- Restart server to see changes

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
```

### Performance Considerations
- Enable API caching for product endpoints
- Use database connection pooling
- Configure proper rate limiting
- Enable compression middleware
- Set up HTTPS with SSL certificates

## 📞 Support

### Documentation Links
- **OpenAPI Spec**: [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3/)
- **Swagger UI**: [Swagger Documentation](https://swagger.io/docs/)
- **Express.js**: [Express Guide](https://expressjs.com/)

### API Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request/Validation Error
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## 🎉 Congratulations!

Your E-Commerce API now has **professional-grade documentation** that:
- ✅ Documents all 20+ endpoints comprehensively
- ✅ Provides interactive testing capabilities
- ✅ Includes complete schema definitions
- ✅ Features security and authentication details
- ✅ Maintains professional API standards
- ✅ Supports both development and production use

**Ready for interviews, client demos, and production deployment!** 🚀