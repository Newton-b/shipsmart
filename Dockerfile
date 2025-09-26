# Simple Dockerfile for Railway deployment
FROM node:18.17.0-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copy .npmrc files for legacy peer deps
COPY .npmrc ./
COPY backend/.npmrc ./backend/
COPY frontend/.npmrc ./frontend/

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Install dependencies using the root package.json scripts
RUN npm run install:all

# Copy source code
COPY . .

# Build the application using root scripts
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
