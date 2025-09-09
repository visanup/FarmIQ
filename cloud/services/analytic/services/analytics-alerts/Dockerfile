# Build stage
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn build

# Runtime stage
FROM node:18-alpine AS runtime

WORKDIR /usr/src/app

# Install OpenSSL and other required libraries
RUN apk add --no-cache openssl libssl3

COPY package*.json ./
RUN yarn install --production

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 7306

CMD ["yarn", "start"]