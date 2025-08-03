# 📚 Kahit Saan API Documentation

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication Endpoints

### Admin Authentication

#### POST `/auth/login`
Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "role": "admin",
  "userId": "60d0fe4f5311236168a109ca"
}
```

### Customer Authentication

#### POST `/customers/register`
Register a new customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}
```

#### POST `/customers/login`
Authenticate customer and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

## 🍽️ Menu Management

### GET `/menu`
Get all available menu items (public endpoint).

**Query Parameters:**
- `category` (optional): Filter by category
- `available` (optional): Filter by availability (true/false)

**Response:**
```json
[
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Chicken Fried Rice",
    "description": "Delicious fried rice with chicken and vegetables",
    "price": 150.00,
    "category": "Rice Meals",
    "photo": {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "public_id": "kahit_saan_menu/abc123"
    },
    "isAvailable": true,
    "createdAt": "2021-06-21T09:00:00.000Z",
    "updatedAt": "2021-06-21T09:00:00.000Z"
  }
]
```

### GET `/menu/categories`
Get all menu categories.

**Response:**
```json
["Rice Meals", "Noodles", "Beverages", "Sides", "Chaofan"]
```

### GET `/menu/:id`
Get a specific menu item by ID.

### Admin-only Menu Endpoints (Require Authentication)

#### POST `/menu`
Create a new menu item.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Form Data:**
```
name: "New Dish"
description: "Delicious new dish"
price: 200.00
category: "Rice Meals"
photo: [file upload]
```

#### PUT `/menu/:id`
Update an existing menu item.

#### DELETE `/menu/:id`
Delete a menu item.

#### GET `/menu/admin/stats`
Get menu statistics for admin dashboard.

**Response:**
```json
{
  "totalItems": 25,
  "availableItems": 23,
  "unavailableItems": 2,
  "categoryStats": [
    {
      "category": "Rice Meals",
      "count": 8
    }
  ]
}
```

## 📦 Order Management

### GET `/orders`
Get orders (Admin: all orders, Customer: own orders only).

**Query Parameters:**
- `status`: Filter by order status
- `page`: Pagination page number
- `limit`: Number of items per page

**Response:**
```json
{
  "orders": [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "orderNumber": "ORD-001",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "items": [
        {
          "menuItem": {
            "_id": "60d0fe4f5311236168a109ca",
            "name": "Chicken Fried Rice",
            "price": 150.00
          },
          "quantity": 2,
          "subtotal": 300.00
        }
      ],
      "totalAmount": 300.00,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2021-06-21T09:00:00.000Z"
    }
  ],
  "totalOrders": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

### POST `/orders`
Create a new order.

**Request Body:**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "menuItem": "60d0fe4f5311236168a109ca",
      "quantity": 2
    }
  ],
  "specialInstructions": "Extra spicy please"
}
```

### PUT `/orders/:id/status`
Update order status (Admin only).

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Available Statuses:**
- `pending`: Order received, awaiting preparation
- `preparing`: Order is being prepared
- `completed`: Order is ready/delivered
- `cancelled`: Order has been cancelled

### GET `/orders/:id/track`
Track order status (public endpoint with order ID).

## 📊 Analytics & Reports

### GET `/analytics/dashboard`
Get dashboard analytics (Admin only).

**Response:**
```json
{
  "todayStats": {
    "orders": 25,
    "revenue": 3750.00,
    "customers": 18
  },
  "recentOrders": [...],
  "popularItems": [...],
  "inventoryAlerts": [...]
}
```

### GET `/analytics/sales`
Get sales analytics.

**Query Parameters:**
- `period`: day, week, month, year
- `startDate`: Start date for custom range
- `endDate`: End date for custom range

### GET `/analytics/orders`
Get order analytics by status, time period, etc.

## 📦 Inventory Management

### GET `/inventory/ingredients`
Get all ingredients with stock information.

**Response:**
```json
{
  "ingredients": [
    {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Rice",
      "category": "Grains",
      "currentStock": 50,
      "unit": "kg",
      "minStockLevel": 10,
      "maxStockLevel": 100,
      "stockStatus": "in_stock",
      "costPerUnit": 25.00,
      "expiryDate": "2024-12-31T00:00:00.000Z"
    }
  ]
}
```

### POST `/inventory/ingredients`
Add a new ingredient.

### PUT `/inventory/ingredients/:id/stock`
Update ingredient stock level.

**Request Body:**
```json
{
  "action": "add",
  "quantity": 20,
  "reason": "New delivery received"
}
```

### GET `/inventory/dashboard`
Get inventory dashboard summary.

**Response:**
```json
{
  "summary": {
    "totalIngredients": 45,
    "inStockCount": 40,
    "lowStockCount": 3,
    "outOfStockCount": 2,
    "expiringCount": 1,
    "totalValue": "15750.00"
  },
  "criticalIngredients": [...],
  "expiringIngredients": [...]
}
```

## 👥 User Management

### GET `/users`
Get all admin users (Super Admin only).

### POST `/users`
Create a new admin user.

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "securepassword",
  "role": "admin"
}
```

**Available Roles:**
- `super_admin`: Full system access
- `admin`: Restaurant management access
- `staff`: Limited access for daily operations

## 🔐 Password Reset

### POST `/password-reset/request`
Request a password reset.

**Request Body:**
```json
{
  "username": "admin"
}
```

### POST `/password-reset/reset`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newsecurepassword"
}
```

## 💬 Review Management

### GET `/reviews`
Get all reviews.

### POST `/reviews`
Create a new review.

**Request Body:**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "rating": 5,
  "comment": "Great food and service!",
  "orderReference": "ORD-001"
}
```

### PUT `/reviews/:id/status`
Update review status (Admin only).

## 🔄 Real-time Events (Socket.IO)

### Client Events
- `join-order-room`: Join room for order updates
- `leave-order-room`: Leave order room
- `join-inventory-room`: Join inventory management room

### Server Events
- `order-update`: Order status changes
- `inventory-alert`: Stock level alerts
- `new-order`: New order notifications
- `newPasswordResetRequest`: Admin notification for password resets

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information (development only)",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request / Validation error
- `401`: Unauthorized / Invalid token
- `403`: Forbidden / Insufficient permissions
- `404`: Resource not found
- `500`: Internal server error

## 🔍 Data Validation

### Menu Item Validation
- `name`: Required, 1-100 characters
- `description`: Required, 1-500 characters
- `price`: Required, positive number
- `category`: Required, valid category
- `photo`: Optional, valid image file (JPEG, PNG, WebP)

### Order Validation
- `customer.name`: Required, 1-100 characters
- `customer.email`: Required, valid email format
- `customer.phone`: Required, valid phone format
- `items`: Required, array with at least one item
- `items[].quantity`: Required, positive integer

### Ingredient Validation
- `name`: Required, unique, 1-100 characters
- `category`: Required
- `currentStock`: Required, non-negative number
- `unit`: Required
- `minStockLevel`: Required, positive number
- `costPerUnit`: Required, positive number

## 📊 Rate Limiting

API endpoints are rate limited to prevent abuse:
- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- File upload endpoints: 10 requests per 15 minutes

## 🔒 Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## 📱 API Versioning

Current API version: `v1`
Version is included in the base URL: `/api/v1/`

Future versions will maintain backward compatibility where possible.

---

**For additional API support or custom endpoint development, please contact our development team.**
