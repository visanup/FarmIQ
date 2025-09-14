# Authentication Service

Overview
- Purpose: Authentication and token management for FarmIQ Cloud using JWT access tokens and refresh-token rotation, with RBAC and user management.
- Stack: Node.js 18 + TypeScript + Fastify 4 + Prisma + PostgreSQL (schema: auth) + Zod.
- Docs: Swagger UI at http://localhost:7300/api-docs
- Health/Ready: GET /health, GET /ready; metrics at /metrics

Configuration
- PORT: 7300
- HOST: 0.0.0.0
- DATABASE_URL: postgresql://postgres:password@localhost:25432/farmiq_cloud?schema=auth
- JWT_SECRET: your-secret
- JWT_ALGORITHM: HS256 | HS384 | HS512 (default HS256)
- JWT_ISSUER: farmiq-auth
- JWT_AUDIENCE: farmiq-clients
- ACCESS_TOKEN_EXPIRE_MINUTES: 60 (default 1440)
- REFRESH_TOKEN_EXPIRE_DAYS: 7
- CORS_ALLOWED_ORIGINS: * or comma list
- CORS_ALLOW_CREDENTIALS: true|false
- CORS_ALLOW_METHODS: * or comma list (e.g. GET,POST,PUT,DELETE)
- CORS_ALLOW_HEADERS: * or comma list
- KAFKA_BROKERS: kafka:9092
- KAFKA_SSL: false
- MASTER_SERVICE_URL: http://master-service:7307 (proxy /api/customers/*)
- EMAIL_FROM: no-reply@farmiq.local
- APP_BASE_URL: http://localhost:7300

API Endpoints
- POST /api/auth/register: Register new user { email, password, name }
- POST /api/auth/login: Login { email, password }
- POST /api/auth/refresh: Rotate refresh token { refreshToken }
- POST /api/auth/logout: Revoke refresh token { refreshToken } (Bearer)
- POST /api/auth/change-password: { currentPassword, newPassword } (Bearer)
- GET  /api/auth/me: Current user (Bearer)
- POST /api/auth/request-email-verification: Send verification email (Bearer)
- POST /api/auth/verify-email: { token }
- POST /api/auth/forgot-password: { email }
- POST /api/auth/reset-password: { token, newPassword }
- Users: /api/users (admin list/create; user can update self)

Response (login/register)
{
  user: { id, email, name, role, isActive, createdAt, updatedAt },
  accessToken: string,
  refreshToken: string,
  expiresIn: number
}

Security
- Passwords hashed with bcrypt (salt rounds 12)
- JWT issuer/audience enforced; access token contains role + scopes
- Refresh token rotation with reuse protection (revokes all on misuse)
- Rate limits: global + stricter on login/refresh
- Zod validation on request bodies

Run locally
1) Install: yarn install
2) Prisma: yarn db:generate && yarn db:push && yarn db:seed
3) Dev/Prod: yarn dev or yarn build && yarn start

Seeding
- Uses ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME to create an admin user.

Notes
- This service forwards /api/customers/* to MASTER_SERVICE_URL via reverse proxy.
- Prometheus metrics available at /metrics.

