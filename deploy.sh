#!/bin/bash

echo "🚂 Preparing ShipSmart for Railway deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Build frontend locally to test
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend locally to test
echo "🏗️ Building backend..."
cd backend
npm install
npm run build
cd ..

# Add all files to git
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Configure Railway deployment with static file serving"

# Push to repository
echo "🚀 Pushing to repository..."
git push origin main

echo "✅ Ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub repo"
echo "3. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=your-database-url"
echo "   - JWT_SECRET=your-jwt-secret"
echo "4. Deploy!"
echo ""
echo "Your app will be available at: https://your-app.railway.app"
