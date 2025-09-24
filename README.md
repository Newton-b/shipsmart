# ShipSmart Tracking Microservice

A comprehensive, production-ready shipment tracking microservice built with NestJS and TypeScript. This service provides real-time tracking capabilities for multiple carriers including UPS, FedEx, and Maersk, with advanced features like circuit breakers, Server-Sent Events, and intelligent caching.

## 🚀 Features

### Core Functionality
- **Multi-Carrier Support**: UPS, FedEx, Maersk with extensible architecture for additional carriers
- **Real-Time Updates**: Server-Sent Events (SSE) for live tracking notifications
- **Auto-Detection**: Intelligent carrier detection based on tracking number patterns
- **Batch Processing**: Efficient bulk tracking operations
- **Comprehensive API**: RESTful endpoints with OpenAPI/Swagger documentation

### Advanced Capabilities
- **Circuit Breaker Pattern**: Resilient API calls with automatic failover using Opossum
- **Intelligent Caching**: Redis-based caching with configurable TTL
- **Database Optimization**: Strategically indexed PostgreSQL schema for high performance
- **Error Handling**: Comprehensive error management with graceful degradation
- **Health Monitoring**: Built-in health checks and carrier status monitoring

### Architecture Patterns
- **Strategy Pattern**: Pluggable carrier adapters
- **Factory Pattern**: Dynamic adapter creation and management
- **Observer Pattern**: Event-driven real-time updates
- **Repository Pattern**: Clean data access layer

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│  NestJS API      │────│   PostgreSQL    │
│   (Frontend)    │    │  (Backend)       │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ SSE                   │ Circuit Breaker       │ TypeORM
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐    ┌──────────▼──────────┐
            │  Carrier APIs  │    │      Redis          │
            │ (UPS/FedEx/    │    │    (Caching)        │
            │  Maersk)       │    │                     │
            └────────────────┘    └─────────────────────┘
```

## 📋 API Endpoints

### Tracking Operations
- `GET /api/v1/shipments/{trackingNumber}` - Track single shipment
- `POST /api/v1/shipments/track` - Initiate tracking
- `GET /api/v1/shipments/batch` - Batch tracking (query params)
- `POST /api/v1/shipments/batch/track` - Batch tracking (body)
- `GET /api/v1/shipments/{trackingNumber}/history` - Get tracking history
- `GET /api/v1/shipments/{trackingNumber}/events` - SSE endpoint for real-time updates

### System Operations
- `GET /api/v1/shipments/carriers/available` - List available carriers
- `GET /api/v1/shipments/health` - Service health check
- `GET /health` - Basic health endpoint
- `GET /api/docs` - Swagger documentation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+ (optional, falls back to memory cache)
- Carrier API credentials (UPS, FedEx, Maersk)

### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd lets-ship
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Create database
createdb shipment_tracking

# Run migrations
npm run migration:run

# Apply optimized indexes
psql -d shipment_tracking -f src/migrations/001-create-indexes.sql
```

4. **Carrier Configuration**
Insert carrier API keys into the database:
```sql
INSERT INTO carrier_keys (carrier_code, carrier_type, carrier_name, api_key, api_secret, base_url, is_active)
VALUES 
  ('UPS', 'UPS', 'United Parcel Service', 'your_ups_key', 'username:password', 'https://onlinetools.ups.com/api', true),
  ('FEDEX', 'FEDEX', 'FedEx Corporation', 'your_fedex_client_id', 'your_fedex_client_secret', 'https://apis.fedex.com', true),
  ('MAERSK', 'MAERSK', 'A.P. Moller-Maersk', 'your_maersk_key', 'your_maersk_token', 'https://api.maersk.com', true);
```

5. **Start the Service**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `shipment_tracking` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `CACHE_TTL` | Cache TTL (seconds) | `300` |

### Carrier API Configuration
Each carrier requires specific API credentials:

- **UPS**: Access License Number + Username/Password
- **FedEx**: Client ID + Client Secret (OAuth2)
- **Maersk**: Consumer Key + Bearer Token

## 🎯 Usage Examples

### Basic Tracking
```typescript
// Track with auto-detection
const response = await fetch('/api/v1/shipments/1Z999AA1234567890');

// Track with specific carrier
const response = await fetch('/api/v1/shipments/1Z999AA1234567890?carrierCode=UPS');
```

### Batch Tracking
```typescript
const response = await fetch('/api/v1/shipments/batch/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trackingNumbers: ['1Z999AA1234567890', '123456789012', 'MAEU1234567']
  })
});
```

### Real-Time Updates (SSE)
```typescript
const eventSource = new EventSource('/api/v1/shipments/1Z999AA1234567890/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Tracking update:', data);
};
```

### React Integration
```tsx
import { useTrackingSSE } from './hooks/useTrackingSSE';
import { TrackingDashboard } from './components/TrackingDashboard';

function App() {
  return <TrackingDashboard />;
}
```

## 🔄 Real-Time Updates

The service provides real-time tracking updates through Server-Sent Events:

### Connection Management
- Automatic reconnection with exponential backoff
- Connection state monitoring
- Graceful error handling
- Page visibility and network status awareness

### Event Types
- `connected` - Initial connection confirmation
- `tracking_update` - New tracking information available

### Frontend Integration
The included React components provide:
- Automatic SSE connection management
- Real-time UI updates
- Connection status indicators
- Error handling and retry logic

## 📊 Performance Optimizations

### Database Indexing Strategy
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- GIN indexes for full-text search
- Geospatial indexes for location queries

### Caching Strategy
- Redis-based response caching
- Configurable TTL per endpoint
- Cache invalidation on updates
- Memory fallback for development

### Circuit Breaker Configuration
- 50% error threshold
- 30-second timeout
- Exponential backoff for retries
- Per-carrier isolation

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Load testing
npm run test:load
```

## 📈 Monitoring & Observability

### Health Checks
- Service health endpoint
- Carrier API status monitoring
- Database connectivity checks
- Redis connection validation

### Logging
- Structured JSON logging
- Configurable log levels
- Request/response tracking
- Error correlation IDs

### Metrics (Optional)
- Prometheus metrics endpoint
- Request duration histograms
- Error rate counters
- Circuit breaker state metrics

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tracking-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tracking-service
  template:
    metadata:
      labels:
        app: tracking-service
    spec:
      containers:
      - name: tracking-service
        image: shipsmart/tracking-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

## 🔒 Security Considerations

- Input validation with class-validator
- SQL injection prevention via TypeORM
- Rate limiting per carrier API
- CORS configuration for frontend integration
- Environment-based configuration
- API key rotation support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health check endpoint at `/health`

---

Built with ❤️ for the ShipSmart logistics platform
