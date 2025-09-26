# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install global dependencies and update npm
RUN npm install -g npm@latest @nestjs/cli

# Set npm configuration for legacy peer deps
RUN npm config set legacy-peer-deps true
RUN npm config set fund false
RUN npm config set audit false

# Copy package files first for better caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY .npmrc ./
COPY backend/.npmrc ./backend/
COPY frontend/.npmrc ./frontend/

# Install backend dependencies with legacy peer deps
WORKDIR /app/backend
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Install frontend dependencies with legacy peer deps
WORKDIR /app/frontend
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose port
EXPOSE 3000

# Set working directory to backend for startup
WORKDIR /app/backend

# Start the application
CMD ["node", "dist/main.js"]
