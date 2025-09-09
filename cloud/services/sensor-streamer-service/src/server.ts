import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from './lib/prisma';
import { PORT, HOST, NODE_ENV, CORS_ALLOWED_ORIGINS, ENABLE_PROMETHEUS } from './configs/config';
import { sensorRoutes } from './routes/sensor.routes';
import { deviceHealthRoutes } from './routes/device-health.routes';
import { labReadingRoutes } from './routes/lab-reading.routes';
import { sweepReadingRoutes } from './routes/sweep-reading.routes';
import { dataIngestionLogRoutes } from './routes/data-ingestion-log.routes';
import { KafkaService } from './services/kafka.service';
import { errorHandler } from './middleware/errorHandler';

const fastify = Fastify({
  logger: {
    level: NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// Initialize Kafka service
const kafkaService = new KafkaService();

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: CORS_ALLOWED_ORIGINS === '*' ? true : CORS_ALLOWED_ORIGINS.split(','),
    credentials: true,
  });

  // Helmet for security
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'FarmIQ Sensor Streamer Service API',
        description: 'Sensor data streaming and management service for FarmIQ',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${HOST}:${PORT}`,
          description: 'Development server',
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
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
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      return {
        ok: true,
        service: 'sensor-streamer-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error) {
      return reply.status(503).send({
        ok: false,
        service: 'sensor-streamer-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Prometheus metrics (optional)
  if (ENABLE_PROMETHEUS) {
    const client = require('prom-client');
    client.collectDefaultMetrics();
    
    fastify.get('/metrics', async (request, reply) => {
      reply.type('text/plain');
      return client.register.metrics();
    });
  }

  // API routes
  await fastify.register(sensorRoutes, { prefix: '/api/sensor-readings' });
  await fastify.register(deviceHealthRoutes, { prefix: '/api/device-health' });
  await fastify.register(labReadingRoutes, { prefix: '/api/lab-readings' });
  await fastify.register(sweepReadingRoutes, { prefix: '/api/sweep-readings' });
  await fastify.register(dataIngestionLogRoutes, { prefix: '/api/data-ingestion-logs' });

  // Root redirect to docs
  fastify.get('/', async (request, reply) => {
    return reply.redirect('/api-docs');
  });
}

// Add Prisma to Fastify instance
fastify.decorate('prisma', prisma);
fastify.decorate('kafka', kafkaService);

// Error handler
fastify.setErrorHandler(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    await kafkaService.disconnect();
    await prisma.$disconnect();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
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
    
    console.log(`🚀 Sensor Streamer service running on http://${HOST}:${PORT}`);
    console.log(`📖 Swagger UI: http://${HOST}:${PORT}/api-docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
start();