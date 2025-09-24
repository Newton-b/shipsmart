# ShipSmart Backend

A production-ready NestJS backend for the ShipSmart freight forwarding platform with real-time capabilities, comprehensive API integrations, and robust authentication.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Updates**: WebSocket integration for live notifications and updates
- **Database Integration**: PostgreSQL with TypeORM + MongoDB with Mongoose
- **Payment Processing**: Stripe and PayPal integration with secure handling
- **Carrier Integration**: UPS, FedEx, DHL APIs for tracking and rate quotes
- **Email Service**: Comprehensive email templates and notifications
- **Analytics**: Real-time dashboard with business intelligence
- **Notifications**: Multi-channel notification system with real-time delivery

### Technical Features
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Rate Limiting**: Built-in throttling and security measures
- **Caching**: Redis integration for performance optimization
- **Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Global exception filters and logging
- **Health Checks**: System monitoring and health endpoints
- **Docker Support**: Containerized deployment ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- MongoDB 5+
- Redis 6+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=shipsmart

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/shipsmart

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Choose one provider)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Carrier API Keys
UPS_ACCESS_KEY=your_ups_access_key
UPS_USERNAME=your_ups_username
UPS_PASSWORD=your_ups_password
FEDEX_API_KEY=your_fedex_api_key
FEDEX_SECRET_KEY=your_fedex_secret_key
DHL_API_KEY=your_dhl_api_key

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### 3. Database Setup

#### PostgreSQL Setup
```bash
# Create database
createdb shipsmart

# Run migrations
npm run migration:run
```

#### MongoDB Setup
MongoDB will automatically create collections as needed.

### 4. Start the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Using Docker
```bash
docker-compose up -d
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api/docs
- **API Routes**: See [API_ROUTES.md](./API_ROUTES.md) for detailed route documentation

## 🧪 Testing

### Route Verification
Test all API routes automatically:
```bash
node scripts/verify-routes.js
```

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   ├── modules/                # Feature modules
│   │   ├── auth/              # Authentication & authorization
│   │   ├── users/             # User management
│   │   ├── shipments/         # Shipment tracking
│   │   ├── payments/          # Payment processing
│   │   ├── carriers/          # Carrier integrations
│   │   ├── analytics/         # Business analytics
│   │   ├── notifications/     # Notification system
│   │   ├── email/             # Email service
│   │   └── websocket/         # Real-time communication
│   ├── app.module.ts          # Root application module
│   └── main.ts                # Application entry point
├── scripts/                   # Utility scripts
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Container configuration
└── README.md                  # This file
```

## 🔐 Authentication & Authorization

### User Roles
- **ADMIN**: Full system access
- **CUSTOMER**: Access to own shipments and payments
- **DISPATCHER**: Manage shipments and tracking
- **FINANCE**: Access to payments and financial data

### JWT Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use the returned JWT token in subsequent requests
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🌐 WebSocket Integration

The WebSocket server provides real-time updates for:
- Live notifications
- Shipment status updates
- Analytics data streams
- User presence indicators

### Client Connection Example
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Subscribe to notifications
socket.emit('subscribe_notifications');

// Listen for real-time updates
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('shipment_update', (data) => {
  console.log('Shipment update:', data);
});
```

## 💳 Payment Integration

### Stripe Integration
```javascript
// Create a payment
const payment = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 99.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    userId: 'user-id'
  })
});

// Process the payment
const result = await fetch(`/api/payments/${paymentId}/process`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentMethodId: 'pm_stripe_payment_method_id'
  })
});
```

## 🚚 Carrier Integration

### Track a Shipment
```javascript
const tracking = await fetch('/api/carriers/track/1Z12345E0205271688', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Get Shipping Rates
```javascript
const rates = await fetch('/api/carriers/rates', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    origin: {
      name: 'John Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    destination: {
      name: 'Jane Smith',
      address1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'US'
    },
    packages: [{
      weight: 5,
      length: 12,
      width: 8,
      height: 6
    }]
  })
});
```

## 📊 Analytics & Monitoring

### Dashboard Statistics
```javascript
const stats = await fetch('/api/analytics/dashboard', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🔔 Notifications

### Create a Notification
```javascript
const notification = await fetch('/api/notifications', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-id',
    type: 'shipment_update',
    priority: 'high',
    title: 'Shipment Delivered',
    message: 'Your shipment has been delivered successfully',
    sendEmail: true,
    sendPush: true
  })
});
```

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Docker Build
```bash
# Build the image
docker build -t shipsmart-backend .

# Run the container
docker run -p 3000:3000 --env-file .env shipsmart-backend
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_SSL=true
REDIS_TLS=true
JWT_SECRET=your-super-secure-production-secret
```

### PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

## 🔧 Development

### Database Migrations
```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL/MongoDB is running
   - Verify connection credentials in `.env`
   - Ensure database exists

2. **Redis Connection Failed**
   - Check Redis is running: `redis-cli ping`
   - Verify Redis configuration

3. **JWT Token Invalid**
   - Check JWT_SECRET is set
   - Verify token hasn't expired

4. **Payment API Errors**
   - Verify API keys are correct
   - Check if using test/sandbox mode

5. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - Review email service logs

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run start:dev

# Or specific modules
DEBUG=nestjs:* npm run start:dev
```

## 📞 Support

For issues and questions:
- Check the [API Documentation](http://localhost:3000/api/docs)
- Review [API_ROUTES.md](./API_ROUTES.md)
- Run route verification: `node scripts/verify-routes.js`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to ship! 🚀** Your ShipSmart backend is now configured with production-ready features, real-time capabilities, and comprehensive API integrations.
