# ShipSmart Backend API Routes

This document outlines all available API routes in the ShipSmart backend system.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
Most routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| POST | `/auth/register` | Register new user | ❌ | - |
| POST | `/auth/login` | User login | ❌ | - |
| GET | `/auth/profile` | Get user profile | ✅ | - |
| POST | `/auth/refresh` | Refresh JWT token | ✅ | - |
| POST | `/auth/change-password` | Change password | ✅ | - |
| POST | `/auth/forgot-password` | Request password reset | ❌ | - |
| POST | `/auth/reset-password` | Reset password with token | ❌ | - |
| POST | `/auth/logout` | User logout | ✅ | - |

---

## 👥 Users Routes (`/api/users`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| GET | `/users` | Get all users | ✅ | Admin |
| GET | `/users/profile` | Get current user profile | ✅ | - |
| GET | `/users/:id` | Get user by ID | ✅ | Admin |
| PATCH | `/users/:id` | Update user | ✅ | Admin/Self |
| DELETE | `/users/:id` | Delete user | ✅ | Admin |
| GET | `/users/stats` | Get user statistics | ✅ | Admin |

---

## 📦 Shipments Routes (`/api/shipments`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| POST | `/shipments` | Create new shipment | ✅ | - |
| GET | `/shipments` | Get user shipments | ✅ | - |
| GET | `/shipments/:id` | Get shipment by ID | ✅ | - |
| PATCH | `/shipments/:id` | Update shipment | ✅ | Admin/Dispatcher |
| DELETE | `/shipments/:id` | Delete shipment | ✅ | Admin |
| GET | `/shipments/:id/track` | Track shipment | ✅ | - |
| POST | `/shipments/:id/events` | Add tracking event | ✅ | Admin/Dispatcher |
| GET | `/shipments/stats` | Get shipment statistics | ✅ | Admin/Dispatcher |

---

## 💳 Payments Routes (`/api/payments`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| POST | `/payments` | Create payment | ✅ | - |
| POST | `/payments/:id/process` | Process payment | ✅ | - |
| POST | `/payments/:id/refund` | Refund payment | ✅ | Admin/Finance |
| GET | `/payments` | Get payments | ✅ | - |
| GET | `/payments/:id` | Get payment by ID | ✅ | - |
| GET | `/payments/stats` | Get payment statistics | ✅ | Admin/Finance |

---

## 🚚 Carriers Routes (`/api/carriers`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| GET | `/carriers/supported` | Get supported carriers | ✅ | - |
| GET | `/carriers/track/:trackingNumber` | Track shipment | ✅ | - |
| POST | `/carriers/rates` | Get shipping rates | ✅ | - |
| POST | `/carriers/shipments` | Create carrier shipment | ✅ | - |
| POST | `/carriers/validate-address` | Validate address | ✅ | - |

---

## 📊 Analytics Routes (`/api/analytics`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| GET | `/analytics/dashboard` | Get dashboard stats | ✅ | Admin/Dispatcher/Finance |
| GET | `/analytics/revenue` | Get revenue analytics | ✅ | Admin/Finance |
| GET | `/analytics/carriers` | Get carrier performance | ✅ | Admin/Dispatcher |
| GET | `/analytics/geographic` | Get geographic analytics | ✅ | Admin/Finance |
| GET | `/analytics/trends` | Get shipment trends | ✅ | Admin/Dispatcher/Finance |
| GET | `/analytics/realtime` | Generate mock real-time data | ✅ | Admin/Dispatcher |

---

## 🔔 Notifications Routes (`/api/notifications`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| POST | `/notifications` | Create notification | ✅ | Admin |
| GET | `/notifications` | Get user notifications | ✅ | - |
| GET | `/notifications/unread-count` | Get unread count | ✅ | - |
| POST | `/notifications/mark-all-read` | Mark all as read | ✅ | - |
| DELETE | `/notifications/all` | Delete all notifications | ✅ | - |
| GET | `/notifications/mock/:count` | Generate mock notifications | ✅ | - |
| GET | `/notifications/:id` | Get notification by ID | ✅ | - |
| PATCH | `/notifications/:id/read` | Mark as read | ✅ | - |
| PATCH | `/notifications/:id/unread` | Mark as unread | ✅ | - |
| DELETE | `/notifications/:id` | Delete notification | ✅ | - |

---

## 📧 Email Routes (`/api/email`)

| Method | Route | Description | Auth Required | Role Required |
|--------|-------|-------------|---------------|---------------|
| POST | `/email/send` | Send custom email | ✅ | Admin |
| POST | `/email/welcome` | Send welcome email | ✅ | Admin |
| POST | `/email/shipment-notification` | Send shipment notification | ✅ | Admin/Dispatcher |
| POST | `/email/payment-confirmation` | Send payment confirmation | ✅ | Admin/Finance |

---

## 🌐 WebSocket Events

The WebSocket server runs on the same port as the HTTP server and supports the following events:

### Client Events (Client → Server)
- `join_room` - Join a specific room (shipment, analytics, notifications)
- `leave_room` - Leave a room
- `subscribe_notifications` - Subscribe to user notifications
- `unsubscribe_notifications` - Unsubscribe from notifications

### Server Events (Server → Client)
- `notification` - New notification for user
- `shipment_update` - Shipment status update
- `analytics_update` - Real-time analytics data
- `unread_count` - Updated unread notification count

---

## 📋 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `ADMIN` | System administrator | Full access to all resources |
| `CUSTOMER` | Regular customer | Access to own shipments and payments |
| `DISPATCHER` | Shipment dispatcher | Manage shipments and tracking |
| `FINANCE` | Finance team member | Access to payments and financial data |

---

## 🔍 Query Parameters

### Pagination
Most list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
Many endpoints support filtering:
- `status` - Filter by status
- `type` - Filter by type
- `userId` - Filter by user ID
- `startDate` - Filter from date
- `endDate` - Filter to date

### Example
```
GET /api/shipments?page=2&limit=20&status=in_transit
```

---

## 📝 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

---

## 🚀 Getting Started

1. **Start the server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Access Swagger Documentation**:
   - Open `http://localhost:3000/api/docs`

3. **Test Authentication**:
   ```bash
   # Register a new user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
   
   # Login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Use the JWT token** in subsequent requests:
   ```bash
   curl -X GET http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

---

## 🔧 Environment Variables

Make sure to configure these environment variables in your `.env` file:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=shipsmart

# MongoDB
MONGODB_URI=mongodb://localhost:27017/shipsmart

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment APIs
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Carrier APIs
UPS_ACCESS_KEY=your-ups-access-key
UPS_USERNAME=your-ups-username
UPS_PASSWORD=your-ups-password
FEDEX_API_KEY=your-fedex-api-key
FEDEX_SECRET_KEY=your-fedex-secret-key
DHL_API_KEY=your-dhl-api-key
```

---

## 📚 Additional Resources

- **Swagger Documentation**: `/api/docs`
- **Health Check**: `/health`
- **Metrics**: `/metrics` (if monitoring is enabled)
- **WebSocket**: Connect to the same host/port with Socket.IO client

For more detailed information about request/response schemas, please refer to the Swagger documentation at `/api/docs`.
