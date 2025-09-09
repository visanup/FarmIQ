import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from './lib/prisma';
import { PORT, HOST, NODE_ENV, CORS_ALLOWED_ORIGINS } from './configs/config';

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
        title: 'FarmIQ Data Service API',
        description: 'Data management service for FarmIQ - handles farms, animals, devices, and all farm-related data',
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
        service: 'data-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error) {
      return reply.status(503).send({
        ok: false,
        service: 'data-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Basic CRUD routes for core entities
  // Farm routes
  fastify.get('/api/farms', async (request, reply) => {
    try {
      const farms = await prisma.farm.findMany({
        include: {
          houses: true,
          animals: true,
          devices: true,
        },
      });
      return reply.send({ farms });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  fastify.get('/api/farms/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const farm = await prisma.farm.findUnique({
        where: { id },
        include: {
          houses: true,
          animals: true,
          devices: true,
        },
      });
      
      if (!farm) {
        return reply.status(404).send({ error: 'Farm not found' });
      }

      return reply.send({ farm });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Animal routes
  fastify.get('/api/animals', async (request, reply) => {
    try {
      const animals = await prisma.animal.findMany({
        include: {
          farm: true,
          house: true,
        },
      });
      return reply.send({ animals });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  fastify.get('/api/animals/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const animal = await prisma.animal.findUnique({
        where: { id },
        include: {
          farm: true,
          house: true,
          healthRecords: true,
          performanceMetrics: true,
        },
      });
      
      if (!animal) {
        return reply.status(404).send({ error: 'Animal not found' });
      }

      return reply.send({ animal });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Device routes
  fastify.get('/api/devices', async (request, reply) => {
    try {
      const devices = await prisma.device.findMany({
        include: {
          farm: true,
          house: true,
          deviceType: true,
          deviceGroup: true,
        },
      });
      return reply.send({ devices });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  fastify.get('/api/devices/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const device = await prisma.device.findUnique({
        where: { id },
        include: {
          farm: true,
          house: true,
          deviceType: true,
          deviceGroup: true,
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          statusHistory: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
        },
      });
      
      if (!device) {
        return reply.status(404).send({ error: 'Device not found' });
      }

      return reply.send({ device });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Performance metrics
  fastify.get('/api/performance-metrics', async (request, reply) => {
    try {
      const { farmId, animalId, metric, startDate, endDate } = request.query as any;
      
      const where: any = {};
      if (farmId) where.farmId = farmId;
      if (animalId) where.animalId = animalId;
      if (metric) where.metric = metric;
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const metrics = await prisma.performanceMetric.findMany({
        where,
        include: {
          animal: true,
          farm: true,
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      return reply.send({ metrics });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Health records
  fastify.get('/api/health-records', async (request, reply) => {
    try {
      const { animalId, farmId, type, startDate, endDate } = request.query as any;
      
      const where: any = {};
      if (animalId) where.animalId = animalId;
      if (farmId) where.farmId = farmId;
      if (type) where.type = type;
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const records = await prisma.healthRecord.findMany({
        where,
        include: {
          animal: true,
          farm: true,
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      return reply.send({ records });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

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
    
    console.log(`🚀 Data service running on http://${HOST}:${PORT}`);
    console.log(`📖 Swagger UI: http://${HOST}:${PORT}/api-docs`);
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