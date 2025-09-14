# Use Node.js 18 as the base image
FROM node:20-alpine

# Install system dependencies (Prisma requires OpenSSL)
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies (use frozen lockfile if valid; fall back to normal install)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --non-interactive || yarn install --non-interactive; else yarn install --non-interactive; fi

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN yarn prisma generate

# Copy source code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port the app runs on
EXPOSE 4112

# Run the application
CMD ["yarn", "start"]
