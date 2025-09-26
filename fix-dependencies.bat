@echo off
echo 🔧 Fixing npm dependency issues...

echo 🗑️ Cleaning npm cache...
npm cache clean --force

echo 🗑️ Removing node_modules and package-lock.json files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist frontend\package-lock.json del frontend\package-lock.json

if exist backend\node_modules rmdir /s /q backend\node_modules
if exist backend\package-lock.json del backend\package-lock.json

echo 📦 Installing backend dependencies...
cd backend
npm install --legacy-peer-deps
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
npm install --legacy-peer-deps
cd ..

echo ✅ Dependencies fixed! You can now try building the project.
echo 🚀 Run: npm run build
pause
