# Simple Railway Dockerfile - avoid permission issues
FROM node:18.17.0-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy .npmrc files
COPY .npmrc ./
COPY backend/.npmrc ./backend/
COPY frontend/.npmrc ./frontend/

# Copy package files and install dependencies
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# Install backend dependencies
WORKDIR /app/backend  
RUN npm install --legacy-peer-deps

# Copy source code
WORKDIR /app
COPY . .

# Build frontend (stay as root to avoid permission issues)
WORKDIR /app/frontend
RUN npx vite build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "/app/backend/dist/main.js"]
