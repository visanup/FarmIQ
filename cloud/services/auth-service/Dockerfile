FROM node:20-alpine

# Install system dependencies (Prisma + native modules like bcrypt)
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (prefer frozen lockfile; fallback to normal install)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --non-interactive || yarn install --non-interactive; else yarn install --non-interactive; fi

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn db:generate

# Build the application
RUN yarn build

# Remove dev dependencies (use fallback if lockfile changed)
RUN if [ -f yarn.lock ]; then yarn install --production --frozen-lockfile --non-interactive || yarn install --production --non-interactive; else yarn install --production --non-interactive; fi && yarn cache clean

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 7300

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http=require('http');http.get('http://localhost:7300/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the application
CMD ["node", "dist/server.js"]
