# Multi-stage build for ChefoodAI Frontend
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps for building)
RUN npm install

# Copy source code
COPY . .

# Build the application with Vite
RUN npm run build

# Production stage
FROM node:18-alpine

# Create non-root user (check if exists first)
RUN adduser -D -u 1000 appuser 2>/dev/null || true

# Set working directory
WORKDIR /app

# Copy package files first
COPY --from=builder --chown=appuser:appuser /app/package*.json ./

# Install express and compression for production server
RUN npm install express compression

# Copy all application files from builder
COPY --from=builder --chown=appuser:appuser /app ./

# Copy server file
COPY --chown=appuser:appuser server.js ./

# Switch to non-root user
USER appuser

# Set default port (Cloud Run will override this)
ENV PORT=8080
ENV NODE_ENV=production

# Expose port (documentation only)
EXPOSE 8080

# Run the Express server
CMD ["node", "server.js"]

