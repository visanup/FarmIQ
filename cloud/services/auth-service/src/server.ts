import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import fastifyHttpProxy from '@fastify/http-proxy';
import client from 'prom-client';

import { prisma } from './lib/prisma';
import {
  MASTER_SERVICE_URL,
  PORT,
  HOST,
  NODE_ENV,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
} from './configs/config';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';

const fastify = Fastify({
  logger: {
    level: NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// ---------------- Register plugins ---------------- //
async function registerPlugins() {
  // CORS
  const allowedHeaders =
    CORS_ALLOW_HEADERS === '*'
      ? ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
      : (CORS_ALLOW_HEADERS.split(',').map((h) => h.trim()) as any);

  await fastify.register(cors, {
    origin: CORS_ALLOWED_ORIGINS === '*' ? true : CORS_ALLOWED_ORIGINS.split(','),
    credentials: CORS_ALLOW_CREDENTIALS,
    methods: CORS_ALLOW_METHODS === '*' ? undefined : (CORS_ALLOW_METHODS.split(',') as any),
    allowedHeaders,
  });

  // Security
  await fastify.register(helmet, { contentSecurityPolicy: false });

  // OpenAPI
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'FarmIQ Auth Service API',
        description: 'Authentication and user management service for FarmIQ',
        version: '1.0.0',
      },
      servers: [{ url: `http://${HOST}:${PORT}`, description: 'Server' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
    staticCSP: true,
    transformSpecification: (o) => o,
    transformSpecificationClone: true,
  });

  // Rate limit
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  });

  // Prometheus metrics
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['route', 'method', 'status'],
  });

  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['route', 'method', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

  fastify.addHook('onResponse', async (req, reply) => {
    const route = req.routeOptions?.url || req.url;
    const labels = { route, method: req.method, status: String(reply.statusCode) } as const;
    httpRequests.inc(labels);

    // ✅ Fix FSTDEP020: use property, not function
    const ms = (reply as any).elapsedTime as number;
    if (typeof ms === 'number' && !Number.isNaN(ms)) {
      httpDuration.observe(labels as any, ms / 1000);
    }
  });

  fastify.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });

  // Reverse proxy to master-service (customers)
  await fastify.register(fastifyHttpProxy, {
    upstream: MASTER_SERVICE_URL,
    prefix: '/api/customers',
    rewritePrefix: '/api/customers',
    replyOptions: {
      rewriteRequestHeaders: (_req, headers) => headers,
    },
  });
}

// ---------------- Register routes ---------------- //
async function registerRoutes() {
  // Health
  fastify.get('/health', async () => ({
    ok: true,
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Readiness
  fastify.get('/ready', async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      reply.status(503);
      return { ok: false };
    }
  });

  // API namespaces
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });

  // Root → docs
  fastify.get('/', async (_req, reply) => reply.redirect('/api-docs'));
}

// ---------------- Prisma on instance ---------------- //
fastify.decorate('prisma', prisma);

// ---------------- Error handler ---------------- //
fastify.setErrorHandler((error, _request, reply) => {
  fastify.log.error(error);

  // Fastify validation errors (AJV)
  if ((error as any).validation) {
    return reply.status(400).send({ error: 'Validation error', details: (error as any).validation });
  }

  return reply.status(500).send({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? (error as any).message : 'Something went wrong',
  });
});

// ---------------- Graceful shutdown ---------------- //
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    await prisma.$disconnect();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error('Error during shutdown:', err as any);
    process.exit(1);
  }
};

// ---------------- Start ---------------- //
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Auth service running on http://${HOST}:${PORT}`);
    console.log(`Swagger UI: http://${HOST}:${PORT}/api-docs`);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => fastify.log.error('Unhandled rejection:', reason as any));
process.on('uncaughtException', (error) => {
  fastify.log.error('Uncaught exception:', error as any);
  process.exit(1);
});

start();
