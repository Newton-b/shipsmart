# Railway Dockerfile for ShipSmart
FROM node:18.17.0-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy .npmrc files for legacy peer deps
COPY .npmrc ./
COPY backend/.npmrc ./backend/
COPY frontend/.npmrc ./frontend/

# Copy and install frontend dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# Copy and install backend dependencies  
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Copy all source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build:prod

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application from backend directory
WORKDIR /app/backend
CMD ["node", "dist/main.js"]
