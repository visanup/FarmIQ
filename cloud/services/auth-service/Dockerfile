FROM node:18-alpine

# Install dependencies for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn db:generate

# Build the application
RUN yarn build

# Remove dev dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

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