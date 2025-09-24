# 🚀 ShipSmart Production Deployment Guide

This guide provides comprehensive instructions for deploying the ShipSmart freight forwarding platform to production environments.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18+ LTS
- **PostgreSQL**: 13+
- **MongoDB**: 5+
- **Redis**: 6+
- **Docker**: 20+ (optional but recommended)
- **Nginx**: 1.18+ (for reverse proxy)

### Domain & SSL
- Domain name configured (e.g., `shipsmart.com`)
- SSL certificates (Let's Encrypt recommended)
- DNS records properly configured

## 🏗️ Architecture Overview

```
Internet → Nginx → Backend (NestJS) → Databases
                 ↓
              Frontend (React/Vite)
```

### Services
- **Frontend**: React app served by Nginx
- **Backend**: NestJS API server
- **PostgreSQL**: Primary database for shipments, users, payments
- **MongoDB**: Notifications and logs
- **Redis**: Caching and sessions
- **Nginx**: Reverse proxy and static file serving

## 🔧 Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx
```

### 2. Database Configuration

#### PostgreSQL Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE shipsmart;
CREATE USER shipsmart_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shipsmart TO shipsmart_user;
\q
```

#### MongoDB Setup
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh
use shipsmart
db.createUser({
  user: "shipsmart_user",
  pwd: "your_secure_password",
  roles: [{ role: "readWrite", db: "shipsmart" }]
})
exit
```

#### Redis Configuration
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password (uncomment and modify)
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 3. Backend Application Deployment

```bash
# Clone repository
git clone https://github.com/your-username/shipsmart-backend.git
cd shipsmart-backend

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.production

# Edit production environment
nano .env.production
```

#### Production Environment Variables
```env
# Application
NODE_ENV=production
PORT=3000
BACKEND_URL=https://api.shipsmart.com
FRONTEND_URL=https://shipsmart.com

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=shipsmart_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=shipsmart
DATABASE_SSL=true

# MongoDB
MONGODB_URI=mongodb://shipsmart_user:your_secure_password@localhost:27017/shipsmart

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Email (Choose one provider)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@shipsmart.com
EMAIL_FROM_NAME=ShipSmart

# Payment APIs
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_live_client_id
PAYPAL_CLIENT_SECRET=your_paypal_live_client_secret
PAYPAL_BASE_URL=https://api-m.paypal.com

# Carrier APIs
UPS_ACCESS_KEY=your_ups_access_key
UPS_USERNAME=your_ups_username
UPS_PASSWORD=your_ups_password
FEDEX_API_KEY=your_fedex_api_key
FEDEX_SECRET_KEY=your_fedex_secret_key
DHL_API_KEY=your_dhl_api_key

# Security
CORS_ORIGIN=https://shipsmart.com
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

#### Build and Start Application
```bash
# Build the application
npm run build

# Run database migrations
npm run migration:run

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🌐 Frontend Deployment

### 1. Build Frontend

```bash
# Clone frontend repository
git clone https://github.com/your-username/shipsmart-frontend.git
cd shipsmart-frontend

# Install dependencies
npm install

# Create production environment
echo "VITE_API_URL=https://api.shipsmart.com/api" > .env.production

# Build for production
npm run build
```

### 2. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/shipsmart
```

#### Nginx Configuration File
```nginx
# Frontend (React App)
server {
    listen 80;
    server_name shipsmart.com www.shipsmart.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shipsmart.com www.shipsmart.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/shipsmart.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shipsmart.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory
    root /var/www/shipsmart/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security
    location ~ /\. {
        deny all;
    }
}

# Backend API
server {
    listen 80;
    server_name api.shipsmart.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.shipsmart.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.shipsmart.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shipsmart.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CORS Headers
    add_header Access-Control-Allow-Origin "https://shipsmart.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
    add_header Access-Control-Allow-Credentials true always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

### 3. Deploy Frontend Files

```bash
# Create web directory
sudo mkdir -p /var/www/shipsmart

# Copy built files
sudo cp -r dist/* /var/www/shipsmart/

# Set permissions
sudo chown -R www-data:www-data /var/www/shipsmart
sudo chmod -R 755 /var/www/shipsmart

# Enable site
sudo ln -s /etc/nginx/sites-available/shipsmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d shipsmart.com -d www.shipsmart.com
sudo certbot --nginx -d api.shipsmart.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker Deployment (Alternative)

### 1. Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: shipsmart
      POSTGRES_USER: shipsmart_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  mongodb:
    image: mongo:5
    environment:
      MONGO_INITDB_ROOT_USERNAME: shipsmart_user
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: shipsmart
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      MONGODB_URI: mongodb://shipsmart_user:${MONGO_PASSWORD}@mongodb:27017/shipsmart
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    depends_on:
      - postgres
      - mongodb
      - redis
    restart: unless-stopped
    ports:
      - "3000:3000"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

### 2. Deploy with Docker

```bash
# Create environment file
echo "POSTGRES_PASSWORD=your_secure_password" > .env
echo "MONGO_PASSWORD=your_secure_password" >> .env
echo "REDIS_PASSWORD=your_secure_password" >> .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. System Monitoring

```bash
# Install monitoring stack
sudo apt install prometheus grafana

# Configure Prometheus
sudo nano /etc/prometheus/prometheus.yml

# Start services
sudo systemctl start prometheus grafana-server
sudo systemctl enable prometheus grafana-server
```

### 3. Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/shipsmart

# Add configuration
/var/log/shipsmart/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## 🔐 Security Checklist

### Application Security
- [ ] Environment variables secured
- [ ] JWT secrets are strong and unique
- [ ] Database passwords are complex
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection protection active

### Server Security
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication
- [ ] Regular security updates
- [ ] Non-root user for applications
- [ ] SSL/TLS certificates installed
- [ ] Security headers configured
- [ ] Fail2ban installed

### Database Security
- [ ] Database users have minimal privileges
- [ ] Databases not accessible from internet
- [ ] Regular backups configured
- [ ] Connection encryption enabled

## 📋 Maintenance Tasks

### Daily
- Monitor application logs
- Check system resources
- Verify backup completion

### Weekly
- Update dependencies
- Review security logs
- Performance monitoring

### Monthly
- Security updates
- Database maintenance
- SSL certificate renewal check
- Backup restoration testing

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs
pm2 logs shipsmart-backend

# Check database connection
npm run migration:run

# Restart application
pm2 restart shipsmart-backend
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check MongoDB status
sudo systemctl status mongod

# Test connections
psql -h localhost -U shipsmart_user -d shipsmart
mongosh --host localhost --username shipsmart_user --password
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### Performance Optimization

#### Database Optimization
```sql
-- PostgreSQL performance tuning
ANALYZE;
REINDEX DATABASE shipsmart;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Application Optimization
```bash
# Enable Node.js clustering
pm2 start ecosystem.config.js --instances max

# Monitor memory usage
pm2 monit

# Optimize garbage collection
pm2 start app.js --node-args="--max-old-space-size=4096"
```

## 📞 Support & Maintenance

### Backup Strategy
- **Database**: Daily automated backups
- **Application**: Git-based deployments
- **Files**: Regular file system backups
- **Configuration**: Version-controlled configs

### Disaster Recovery
1. Database restoration procedures
2. Application rollback process
3. DNS failover configuration
4. Monitoring alert setup

### Contact Information
- **Technical Support**: tech@shipsmart.com
- **Emergency Contact**: +1-XXX-XXX-XXXX
- **Documentation**: https://docs.shipsmart.com

---

**🎉 Congratulations!** Your ShipSmart platform is now deployed and ready for production use. Monitor the system closely during the first few days and ensure all monitoring and backup systems are functioning correctly.
