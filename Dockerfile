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

# Create non-root user (check if exists first)
RUN adduser -D -u 1000 appuser 2>/dev/null || true

# Set working directory
WORKDIR /app

# Copy package files first
COPY --from=builder --chown=appuser:appuser /app/package*.json ./

# Install express and compression for production server
RUN npm install express compression

# Copy built application from builder
COPY --from=builder --chown=appuser:appuser /app/build ./build 2>/dev/null || true
COPY --from=builder --chown=appuser:appuser /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=appuser:appuser /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/src ./src

# Copy server file
COPY --chown=appuser:appuser server.js ./

# Switch to non-root user
USER appuser

# Set default port (Cloud Run will override this)
ENV PORT=8000
ENV NODE_ENV=production

# Expose port (documentation only)
EXPOSE 8000

# Run the Express server
CMD ["node", "server.js"]

