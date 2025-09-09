import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from './lib/prisma';
import { PORT, HOST, NODE_ENV, CORS_ALLOWED_ORIGINS } from './configs/config';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { customerRoutes } from './routes/customer.routes';

const fastify = Fastify({
  logger: {
    level: NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: CORS_ALLOWED_ORIGINS === '*' ? true : CORS_ALLOWED_ORIGINS.split(','),
    credentials: true,
  });

  // Helmet for security
  await fastify.register(helmet);

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'FarmIQ Auth Service API',
        description: 'Authentication and user management service for FarmIQ',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${HOST}:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return {
      ok: true,
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(customerRoutes, { prefix: '/api/customers' });

  // Root redirect to docs
  fastify.get('/', async (request, reply) => {
    return reply.redirect('/api-docs');
  });
}

// Add Prisma to Fastify instance
fastify.decorate('prisma', prisma);

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation error',
      details: error.validation,
    });
  }

  return reply.status(500).send({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    await prisma.$disconnect();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Start server
async function start() {
  try {
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    
    console.log(`🛡️  Auth service running on http://${HOST}:${PORT}`);
    console.log(`📖  Swagger UI: http://${HOST}:${PORT}/api-docs`);
  } catch (error) {
    fastify.log.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  fastify.log.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  fastify.log.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
start();
