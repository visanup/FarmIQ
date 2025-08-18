# -------- build stage --------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# ติดตั้ง yarn classic ผ่าน corepack (มากับ Node 20)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# -------- runtime stage --------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# ไม่จำเป็นต้องลง yarn ใน runtime ก็ได้ แต่ลงไว้ก็ไม่เสียหาย
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]