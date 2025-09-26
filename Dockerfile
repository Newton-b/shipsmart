# Railway Dockerfile - fix permission issues
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
RUN chmod -R 755 node_modules/.bin

# Install backend dependencies
WORKDIR /app/backend  
RUN npm install --legacy-peer-deps

# Copy source code and fix all permissions
WORKDIR /app
COPY . .
RUN chmod -R 755 /app

# Build frontend using Node.js directly
WORKDIR /app/frontend
RUN node node_modules/vite/bin/vite.js build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "/app/backend/dist/main.js"]
