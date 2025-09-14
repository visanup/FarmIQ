# Auth Service

Authentication and Token Management for FarmIQ (Fastify + Prisma + PostgreSQL)

- AuthN: email/password + JWT access token
- Refresh: stored refresh tokens in DB with rotation and reuse protection
- Validation: Zod (route preValidation)
- Docs: Swagger UI at `/api-docs`
- Health/Ready: `/health`, `/ready`; Prometheus metrics at `/metrics`

---

## Stack

- Runtime: Node.js 18+
- Web: Fastify 4
- ORM: Prisma
- DB: PostgreSQL/TimescaleDB (schema: auth)
- Auth: JWT (HS256 by default; issuer/audience enforced)
- Validation: Zod
- Docs: Swagger UI

---

## Environment Variables

Important variables:

| Name | Example | Notes |
|------|---------|-------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:25432/farmiq_cloud?schema=auth` | Connection string |
| `PORT` | `7300` | Service port |
| `HOST` | `0.0.0.0` | Bind address |
| `JWT_SECRET` | long-random-string | HMAC secret |
| `JWT_ALGORITHM` | `HS256` | HS256/HS384/HS512 |
| `JWT_ISSUER` | `farmiq-auth` | Issuer claim |
| `JWT_AUDIENCE` | `farmiq-clients` | Audience claim |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `CORS_ALLOWED_ORIGINS` | `*` | Comma-separated list or `*` |
| `CORS_ALLOW_CREDENTIALS` | `true` | true/false |
| `CORS_ALLOW_METHODS` | `GET,POST,PUT,DELETE,OPTIONS` | `*` or list |
| `CORS_ALLOW_HEADERS` | `*` | `*` or list |
| `LOG_LEVEL` | `info` | error/warn/info/debug |
| `ADMIN_EMAIL` | `admin@farmiq.local` | For seeding admin |
| `ADMIN_PASSWORD` | `Admin12345!` | For seeding admin |
| `ADMIN_NAME` | `System Administrator` | For seeding admin |
| `KAFKA_BROKERS` | `kafka:9092` | Kafka brokers |
| `KAFKA_SSL` | `false` | Enable SSL |
| `MASTER_SERVICE_URL` | `http://master-service:7307` | Proxy for `/api/customers/*` |
| `EMAIL_FROM` | `no-reply@farmiq.local` | From email |
| `APP_BASE_URL` | `http://localhost:7300` | Base URL for emails |

Local `.env` example (see also `.env.example`):

```
PORT=7300
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres1611@localhost:25432/farmiq_cloud?schema=auth
JWT_SECRET=super-long-secret-here
JWT_ALGORITHM=HS256
JWT_ISSUER=farmiq-auth
JWT_AUDIENCE=farmiq-clients
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ALLOWED_ORIGINS=*
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=*
LOG_LEVEL=info
ADMIN_EMAIL=admin@farmiq.local
ADMIN_PASSWORD=Admin12345!
ADMIN_NAME=System Administrator
KAFKA_BROKERS=localhost:9094
KAFKA_SSL=false
MASTER_SERVICE_URL=http://localhost:7307
EMAIL_FROM=no-reply@farmiq.local
APP_BASE_URL=http://localhost:7300
```

---

## Run (Dev/Prod)

```
yarn install
yarn db:generate
yarn db:push
yarn db:seed
yarn build
yarn start   # or: yarn dev
```

Swagger UI: `http://localhost:7300/api-docs`

---

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/request-email-verification`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET  /api/auth/me`
- Users: `GET/POST/PUT/DELETE /api/users` (admin restrictions apply)
- Customers: forwarded via proxy `/api/customers/*` → `MASTER_SERVICE_URL`

---

## Security Notes

- Enforces JWT issuer/audience in both `sign` and `verify`.
- Access tokens include role and scopes, derived from user role.
- Refresh token rotation with reuse protection: if a revoked/expired token is presented, all active tokens for that user are revoked.
- Rate limits: global and tighter per-route for `/api/auth/login` and `/api/auth/refresh`.

---

## Troubleshooting

- Validation errors: ensure request bodies match Zod schemas.
- 401 on `/me`: pass `Authorization: Bearer <accessToken>`.
- 429 rate limit: wait for `timeWindow` or adjust settings.
- Readiness: check `/ready` to ensure DB connectivity.

