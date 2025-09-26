# 🚀 Netlify Deployment Guide for ShipSmart

## 📋 Pre-Deployment Checklist

### ✅ Files Created
- [x] `netlify.toml` - Netlify configuration
- [x] `frontend/.env.production` - Production environment variables
- [x] All required dependencies in `package.json`

## 🔧 Deployment Steps

### Method 1: Git-based Deployment (Recommended)

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Select your repository

3. **Configure Build Settings**
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `18`

### Method 2: Manual Deployment

1. **Build the project locally**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/dist` folder

## 🌍 Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-api.herokuapp.com/api
VITE_APP_NAME=ShipSmart
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_LOG_LEVEL=error
NODE_ENV=production
```

## 🔧 Common Issues & Solutions

### Issue 1: Build Fails with TypeScript Errors
**Solution**: Temporarily disable strict TypeScript checking
```bash
# In frontend/package.json, change build script to:
"build": "tsc --noEmit false && vite build"
```

### Issue 2: 404 Errors on Page Refresh
**Solution**: The `netlify.toml` includes redirect rules for SPA routing
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue 3: Environment Variables Not Working
**Solution**: 
1. Ensure variables start with `VITE_`
2. Set them in Netlify Dashboard
3. Redeploy the site

### Issue 4: Build Command Not Found
**Solution**: Update build settings in Netlify:
- Build command: `cd frontend && npm ci && npm run build`
- Publish directory: `frontend/dist`

### Issue 5: Node Version Issues
**Solution**: Set Node version in `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

## 📱 Testing Deployment

After deployment, test these features:
- [ ] Homepage loads correctly
- [ ] Login/Register forms work
- [ ] Navigation between pages
- [ ] API calls (if backend is deployed)
- [ ] Responsive design on mobile

## 🔄 Continuous Deployment

Once connected to Git:
1. Any push to `main` branch triggers auto-deployment
2. Preview deployments for pull requests
3. Rollback capability in Netlify dashboard

## 🎯 Performance Optimization

The `netlify.toml` includes:
- Asset minification
- Gzip compression
- Cache headers for static files
- Security headers

## 📞 Support

If deployment fails:
1. Check build logs in Netlify dashboard
2. Verify all files are committed to Git
3. Test build locally: `cd frontend && npm run build`
4. Check Node.js version compatibility

## 🚀 Quick Deploy Command

For experienced users:
```bash
# One-command deployment preparation
cd frontend && npm install && npm run build && echo "Ready for Netlify deployment!"
```

---

**🎉 Your ShipSmart application should now be successfully deployed on Netlify!**
