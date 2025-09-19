FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for better cache
COPY package.json ./
RUN npm install --no-audit --no-fund

# Build stage
FROM base AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime stage (smaller image)
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need at runtime
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]

