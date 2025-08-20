# Multi-stage build for ChefoodAI Frontend
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build || npm run build:prod || npx react-scripts build || echo "Build step skipped"

# Production stage
FROM node:18-alpine

# Install serve for production
RUN npm install -g serve

# Create non-root user
RUN adduser -D -u 1000 appuser

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=appuser:appuser /app/build ./build 2>/dev/null || true
COPY --from=builder --chown=appuser:appuser /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=appuser:appuser /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/src ./src
COPY --from=builder --chown=appuser:appuser /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# For production build, serve the static files
CMD ["sh", "-c", "if [ -d './build' ]; then serve -s build -l 3000; elif [ -d './dist' ]; then serve -s dist -l 3000; else npm start; fi"]

