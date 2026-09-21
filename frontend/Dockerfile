# ==============================================================================
# Multi-stage Dockerfile for Digital Library Management System Frontend
# Thakur Shree DPS College of Engineering and Management
# ==============================================================================

# Stage 1: Build the React + Vite application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy source files and configs
COPY . .

# Build production assets into dist/
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built production assets
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

