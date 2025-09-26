# 🚂 Railway Deployment Guide for ShipSmart

## 🔧 Railway Configuration Files Created

- ✅ `railway.json` - Railway deployment configuration
- ✅ `nixpacks.toml` - Build configuration for Railway
- ✅ `Procfile` - Process definition
- ✅ `.nvmrc` - Node.js version specification

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy

### Method 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway link
   railway up
   ```

## 🌍 Environment Variables

Set these in Railway Dashboard:

### Backend Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

### Frontend Variables (if serving frontend)
```
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=ShipSmart
```

## 🔧 Build Process

Railway will:
1. **Install dependencies** for both frontend and backend
2. **Build frontend** → Creates `frontend/dist`
3. **Build backend** → Creates `backend/dist`
4. **Start backend** → Serves API and static frontend files

## 🐛 Common Issues & Solutions

### Issue 1: "Permission denied" for nest command
**Solution**: The `nixpacks.toml` ensures proper Node.js and npm versions

### Issue 2: Build fails with exit code 127
**Solution**: Updated build commands to use proper paths:
```toml
[phases.build]
cmds = [
  "cd frontend && npm run build",
  "cd backend && npm run build"
]
```

### Issue 3: Frontend not served
**Solution**: Configure backend to serve static files from `frontend/dist`

Add to your NestJS main.ts:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from frontend build
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist'));
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
```

### Issue 4: Database Connection Issues
**Solution**: Add database service in Railway:
1. Add PostgreSQL service
2. Copy DATABASE_URL to environment variables
3. Update your database configuration

## 📊 Railway Services Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Static)      │────│   (NestJS)      │────│  (PostgreSQL)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Deployment Checklist

- [ ] All files committed to Git
- [ ] Environment variables set in Railway
- [ ] Database service added (if needed)
- [ ] CORS configured for frontend domain
- [ ] Build scripts working locally
- [ ] Static file serving configured

## 🔄 Auto-Deployment

Once connected to GitHub:
- Any push to `main` branch triggers auto-deployment
- Railway provides build logs and deployment status
- Automatic rollback on failed deployments

## 🌐 Custom Domain

To use custom domain:
1. Go to Railway project settings
2. Add custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provided

## 🚀 Quick Test Commands

Test locally before deploying:
```bash
# Test frontend build
cd frontend && npm run build

# Test backend build
cd backend && npm run build

# Test production start
cd backend && npm run start:prod
```

---

**🎉 Your ShipSmart application should now deploy successfully on Railway!**

The configuration handles both frontend and backend deployment in a single Railway service.
