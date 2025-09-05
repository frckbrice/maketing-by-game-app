# API Reference Documentation

## Overview

This document provides comprehensive API reference for the Lottery Marketing Application. All endpoints require authentication unless otherwise specified.

## Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require Firebase JWT token in the Authorization header:

```
Authorization: Bearer <firebase-jwt-token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "token": "jwt-token-here"
  }
}
```

### POST /api/auth/login

Authenticate user login.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "USER"
    },
    "token": "jwt-token-here"
  }
}
```

### POST /api/auth/forgot-password

Send password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

## User Management

### GET /api/users/profile

Get current user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER",
    "preferences": {
      "notifications": {
        "push": true,
        "email": true,
        "gameUpdates": true,
        "winnerAnnouncements": true
      }
    },
    "gamificationStats": {
      "loyaltyPoints": 1250,
      "level": 3,
      "badges": ["first_win", "social_butterfly"],
      "totalGamesPlayed": 45
    }
  }
}
```

### PUT /api/users/profile

Update user profile.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "preferences": {
    "notifications": {
      "push": false,
      "email": true
    }
  }
}
```

### GET /api/users/orders

Get user order history.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order123",
        "status": "delivered",
        "total": 29.99,
        "items": [
          {
            "productId": "prod123",
            "name": "Product Name",
            "quantity": 1,
            "price": 29.99
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "City",
          "country": "Country"
        },
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET /api/users/tickets

Get user ticket history.

**Response:**

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket123",
        "gameId": "game123",
        "status": "valid",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "issuedAt": "2025-01-01T00:00:00Z",
        "expiresAt": "2025-01-31T23:59:59Z",
        "game": {
          "title": "Win iPhone 15",
          "vendor": "TechStore"
        }
      }
    ]
  }
}
```

## Marketplace Endpoints

### GET /api/shops

Get list of shops.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `search` (optional): Search query
- `featured` (optional): Show only featured shops

**Response:**

```json
{
  "success": true,
  "data": {
    "shops": [
      {
        "id": "shop123",
        "name": "TechStore",
        "description": "Latest technology products",
        "logo": "https://example.com/logo.jpg",
        "banner": "https://example.com/banner.jpg",
        "rating": 4.5,
        "followers": 1250,
        "isFollowing": false,
        "categories": ["electronics", "phones"],
        "isVerified": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /api/shops/{shopId}

Get shop details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "shop123",
    "name": "TechStore",
    "description": "Latest technology products",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "rating": 4.5,
    "followers": 1250,
    "isFollowing": false,
    "products": [
      {
        "id": "prod123",
        "name": "iPhone 15",
        "price": 999.99,
        "image": "https://example.com/product.jpg",
        "likes": 45,
        "isLiked": false
      }
    ],
    "reviews": [
      {
        "id": "review123",
        "rating": 5,
        "comment": "Great shop!",
        "user": "John D.",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /api/shops/follow

Follow/unfollow a shop.

**Request Body:**

```json
{
  "shopId": "shop123",
  "action": "follow" | "unfollow"
}
```

### GET /api/products

Get list of products.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `shopId` (optional): Filter by shop
- `search` (optional): Search query
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort by (newest, price_asc, price_desc, popular)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod123",
        "name": "iPhone 15",
        "description": "Latest iPhone model",
        "price": 999.99,
        "images": ["https://example.com/image1.jpg"],
        "category": "electronics",
        "shop": {
          "id": "shop123",
          "name": "TechStore",
          "logo": "https://example.com/logo.jpg"
        },
        "likes": 45,
        "isLiked": false,
        "rating": 4.8,
        "reviewCount": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### POST /api/products/like

Like/unlike a product.

**Request Body:**

```json
{
  "productId": "prod123",
  "action": "like" | "unlike"
}
```

### POST /api/orders

Create a new order.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod123",
      "quantity": 1,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "City",
    "postalCode": "12345",
    "country": "Country",
    "phone": "+1234567890"
  },
  "deliveryMethod": "shipping" | "pickup",
  "paymentMethod": "card" | "mobile_money"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order123",
    "status": "pending",
    "total": 32.99,
    "paymentUrl": "https://payment-provider.com/pay/order123"
  }
}
```

## Game Management

### GET /api/games

Get list of games.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `status` (optional): Filter by status (active, closed, ended)
- `featured` (optional): Show only featured games

**Response:**

```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "game123",
        "title": "Win iPhone 15",
        "description": "Play to win the latest iPhone",
        "image": "https://example.com/game-image.jpg",
        "ticketPrice": 5.99,
        "maxParticipants": 1000,
        "currentParticipants": 756,
        "endDate": "2025-01-31T23:59:59Z",
        "status": "active",
        "prizes": [
          {
            "position": 1,
            "description": "iPhone 15 Pro Max",
            "value": 1299.99
          }
        ],
        "vendor": {
          "id": "vendor123",
          "name": "TechStore",
          "logo": "https://example.com/logo.jpg"
        }
      }
    ]
  }
}
```

### POST /api/games/participate

Purchase a ticket for a game.

**Request Body:**

```json
{
  "gameId": "game123",
  "quantity": 1,
  "paymentMethod": "card" | "mobile_money"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket123",
        "gameId": "game123",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "ticketNumber": "TKT-001-2025"
      }
    ],
    "paymentUrl": "https://payment-provider.com/pay/transaction123"
  }
}
```

## QR Code Validation

### POST /api/tickets/scan

Scan and validate a QR code ticket.

**Request Body:**

```json
{
  "ticketId": "ticket123",
  "signature": "base64url-HMAC",
  "issuedAt": 1704067200,
  "scannedBy": "player" | "vendor",
  "vendorId": "vendor123",
  "device": "web" | "mobile"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "result": "VALIDATED" | "VALID" | "ALREADY_USED" | "INVALID" | "EXPIRED",
    "ticket": {
      "id": "ticket123",
      "gameId": "game123",
      "status": "valid",
      "coupon": {
        "code": "SAVE20",
        "amountOff": 20,
        "minPurchase": 100,
        "expiresAt": "2025-02-28T23:59:59Z"
      }
    },
    "message": "Ticket validated successfully"
  }
}
```

### GET /api/tickets/{ticketId}/validate

Validate ticket without marking as used.

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticket": {
      "id": "ticket123",
      "gameId": "game123",
      "status": "valid",
      "expiresAt": "2025-01-31T23:59:59Z"
    }
  }
}
```

## Real-time Features

### POST /api/chat/send

Send a chat message.

**Request Body:**

```json
{
  "receiverId": "shop123",
  "message": "Hello, I have a question about this product",
  "type": "text",
  "shopId": "shop123"
}
```

### GET /api/chat/history

Get chat message history.

**Query Parameters:**

- `partnerId`: Chat partner ID (shop or user)
- `limit` (optional): Number of messages to retrieve

**Response:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg123",
        "senderId": "user123",
        "receiverId": "shop123",
        "message": "Hello!",
        "timestamp": 1704067200000,
        "read": true,
        "type": "text"
      }
    ]
  }
}
```

## Notifications

### POST /api/notifications/send

Send a notification (Admin only).

**Request Body:**

```json
{
  "userId": "user123",
  "type": "game_update",
  "title": "New Game Available",
  "message": "Check out the latest game!",
  "priority": "medium",
  "data": {
    "gameId": "game123"
  }
}
```

### GET /api/notifications

Get user notifications.

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "type": "winner_announcement",
        "title": "Congratulations!",
        "message": "You won a prize!",
        "read": false,
        "timestamp": 1704067200000,
        "priority": "high"
      }
    ],
    "unreadCount": 3
  }
}
```

### PUT /api/notifications/{notificationId}/read

Mark notification as read.

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Admin Endpoints

### GET /api/admin/analytics

Get admin dashboard analytics.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalRevenue": 125000.5,
      "totalGames": 45,
      "activeGames": 12
    },
    "charts": {
      "revenueByMonth": [
        { "month": "Jan", "revenue": 15000 },
        { "month": "Feb", "revenue": 18000 }
      ],
      "usersByMonth": [
        { "month": "Jan", "users": 100 },
        { "month": "Feb", "users": 150 }
      ]
    }
  }
}
```

### POST /api/admin/vendors/approve

Approve vendor application.

**Request Body:**

```json
{
  "userId": "user123",
  "approved": true,
  "reason": "Application meets all requirements"
}
```

### GET /api/admin/scan-events

Get QR scan event logs.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `result` (optional): Filter by scan result

**Response:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event123",
        "ticketId": "ticket123",
        "scannedBy": "vendor",
        "vendorId": "vendor123",
        "result": "VALIDATED",
        "timestamp": 1704067200000,
        "device": "web"
      }
    ]
  }
}
```

## Error Codes

| Code                       | Description                              |
| -------------------------- | ---------------------------------------- |
| `AUTH_REQUIRED`            | Authentication required                  |
| `INVALID_TOKEN`            | Invalid or expired JWT token             |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions          |
| `VALIDATION_ERROR`         | Request validation failed                |
| `NOT_FOUND`                | Resource not found                       |
| `ALREADY_EXISTS`           | Resource already exists                  |
| `RATE_LIMIT_EXCEEDED`      | Too many requests                        |
| `PAYMENT_FAILED`           | Payment processing failed                |
| `TICKET_INVALID`           | Invalid ticket or QR code                |
| `GAME_CLOSED`              | Game is no longer accepting participants |
| `INSUFFICIENT_FUNDS`       | User has insufficient funds              |
| `SERVER_ERROR`             | Internal server error                    |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- General endpoints: 100 requests per minute per IP
- Authentication endpoints: 10 requests per minute per IP
- Payment endpoints: 20 requests per minute per user
- Scan endpoints: 50 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704067260
```

## Webhooks

### Payment Webhooks

Configure webhook URLs to receive payment status updates:

**POST /api/webhooks/payment**

```json
{
  "event": "payment.completed",
  "orderId": "order123",
  "transactionId": "txn123",
  "status": "completed",
  "amount": 29.99,
  "timestamp": 1704067200
}
```

### Game Webhooks

Receive game status updates:

**POST /api/webhooks/game**

```json
{
  "event": "game.ended",
  "gameId": "game123",
  "winners": ["user123", "user456"],
  "timestamp": 1704067200
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
// Initialize API client
const apiClient = new LotteryAPI({
  baseUrl: 'https://your-app.vercel.app/api',
  token: 'your-jwt-token',
});

// Get user profile
const profile = await apiClient.users.getProfile();

// Purchase game ticket
const ticket = await apiClient.games.participate({
  gameId: 'game123',
  quantity: 1,
});

// Scan QR code
const scanResult = await apiClient.tickets.scan({
  ticketId: 'ticket123',
  signature: 'hmac-signature',
});
```

### cURL Examples

```bash
# Get user profile
curl -X GET "https://your-app.vercel.app/api/users/profile" \
  -H "Authorization: Bearer your-jwt-token"

# Create order
curl -X POST "https://your-app.vercel.app/api/orders" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "prod123", "quantity": 1, "price": 29.99}],
    "deliveryMethod": "shipping"
  }'
```

---

_This API reference is automatically updated with each release. For the latest version, refer to the API documentation at `/api/docs`._
