import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import { PORT, HOST, SERVICE_NAME, JWT_SECRET, CORS_ALLOWED_ORIGINS, CORS_ALLOW_CREDENTIALS, CORS_ALLOW_METHODS, CORS_ALLOW_HEADERS } from './config/config';
import prisma from './utils/prisma';
import routes from './routes';

const app = fastify({ logger: true });

// Register plugins
app.register(fastifyCors, {
  origin: CORS_ALLOWED_ORIGINS === '*' ? true : CORS_ALLOWED_ORIGINS.split(','),
  methods: CORS_ALLOW_METHODS.split(',').map(s => s.trim()),
  allowedHeaders: CORS_ALLOW_HEADERS.split(',').map(s => s.trim()),
  credentials: CORS_ALLOW_CREDENTIALS,
});

// Keep CSP disabled to avoid conflicts with Swagger UI unless explicitly needed
app.register(fastifyHelmet, { contentSecurityPolicy: false });

app.register(fastifyJwt, {
  secret: JWT_SECRET
});

// Register Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Monitoring Service API',
      description: 'API for the FarmIQ Monitoring Service',
      version: '1.0.0',
    },
    servers: [{
      url: `http://${HOST}:${PORT}`,
      description: 'Development server'
    }],
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    deepLinking: false,
    docExpansion: 'full',
  },
});

// Root health/readiness endpoints (not behind /api)
app.get('/health', async () => ({ status: 'OK', service: SERVICE_NAME, timestamp: new Date().toISOString() }));
app.get('/ready', async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (e) {
    reply.status(503);
    return { ok: false };
  }
});

// Register routes
app.register(routes, { prefix: '/api' });

// Error handler
app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`${SERVICE_NAME} is running on http://${HOST}:${PORT}`);
    console.log(`Swagger UI available at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
