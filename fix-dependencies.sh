#!/bin/bash

echo "🔧 Fixing npm dependency issues..."

echo "🗑️ Cleaning npm cache..."
npm cache clean --force

echo "🗑️ Removing node_modules and package-lock.json files..."
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json

echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

echo "✅ Dependencies fixed! You can now try building the project."
echo "🚀 Run: npm run build"
