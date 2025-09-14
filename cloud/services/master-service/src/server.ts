import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { 
  PORT, 
  HOST, 
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_BASE_URL
} from './config/config';

// Import routes
import customerRoutes from './routes/customer.routes';
import farmRoutes from './routes/farm.routes';
import houseRoutes from './routes/house.routes';
import deviceRoutes from './routes/device.routes';
import animalTypeRoutes from './routes/animalType.routes';
import breedRoutes from './routes/breed.routes';
import flockRoutes from './routes/flock.routes';
import referenceDataRoutes from './routes/referenceData.routes';
import deviceTypeRoutes from './routes/deviceType.routes';
import sensorTypeRoutes from './routes/sensorType.routes';
import deviceHealthRoutes from './routes/deviceHealth.routes';
import stationRoutes from './routes/station.routes';
import zoneRoutes from './routes/zone.routes';
import feedTypeRoutes from './routes/feedType.routes';
import formulaRoutes from './routes/formula.routes';
import economicDataRoutes from './routes/economicData.routes';
import externalDataSourceRoutes from './routes/externalDataSource.routes';
import masterEventRoutes from './routes/masterEvent.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { apiKeyAuth } from './middleware/apiKeyAuth';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

// Register plugins
async function build() {
  // CORS
  await fastify.register(cors, {
    credentials: CORS_ALLOW_CREDENTIALS,
    origin: CORS_ALLOWED_ORIGINS === '*' ? true : CORS_ALLOWED_ORIGINS.split(','),
    methods: CORS_ALLOW_METHODS === '*' ? ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] : CORS_ALLOW_METHODS.split(','),
    allowedHeaders: CORS_ALLOW_HEADERS === '*' ? ['Content-Type', 'Authorization', 'X-API-Key'] : CORS_ALLOW_HEADERS.split(',')
  });

  // Helmet for security
  await fastify.register(helmet, {
    contentSecurityPolicy: false
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: SWAGGER_TITLE,
        description: SWAGGER_DESCRIPTION,
        version: SWAGGER_VERSION,
        contact: {
          name: 'FarmIQ Team',
          email: 'support@farmiq.com'
        }
      },
      servers: [
        {
          url: SWAGGER_BASE_URL,
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header'
          }
        },
        schemas: {
          Breed: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              animalTypeId: { type: 'string' },
              name: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' },
              characteristics: { type: 'object' },
              meta: { type: 'object' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      tags: [
        { name: 'customers', description: 'Customer management' },
        { name: 'farms', description: 'Farm management' },
        { name: 'houses', description: 'House management' },
        { name: 'devices', description: 'Device management' },
        { name: 'animal-types', description: 'Animal type management' },
        { name: 'breeds', description: 'Breed management' },
        { name: 'flocks', description: 'Flock management' },
        { name: 'reference-data', description: 'Reference data management' },
        { name: 'device-types', description: 'Device type management' },
        { name: 'sensor-types', description: 'Sensor type management' },
        { name: 'device-health', description: 'Device health management' },
        { name: 'stations', description: 'Station management' },
        { name: 'zones', description: 'Zone management' },
        { name: 'feed-types', description: 'Feed type management' },
        { name: 'formulas', description: 'Formula management' },
        { name: 'economic-data', description: 'Economic data management' },
        { name: 'external-data-sources', description: 'External data source management' },
        { name: 'master-events', description: 'Master event management' }
      ]
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Health check
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Register routes with API key authentication
  await fastify.register(customerRoutes, { prefix: '/api/v1/customers' });
  await fastify.register(farmRoutes, { prefix: '/api/v1/farms' });
  await fastify.register(houseRoutes, { prefix: '/api/v1/houses' });
  await fastify.register(deviceRoutes, { prefix: '/api/v1/devices' });
  await fastify.register(animalTypeRoutes, { prefix: '/api/v1/animal-types' });
  await fastify.register(breedRoutes, { prefix: '/api/v1/breeds' });
  await fastify.register(flockRoutes, { prefix: '/api/v1/flocks' });
  await fastify.register(referenceDataRoutes, { prefix: '/api/v1/reference-data' });
  await fastify.register(deviceTypeRoutes, { prefix: '/api/v1/device-types' });
  await fastify.register(sensorTypeRoutes, { prefix: '/api/v1/sensor-types' });
  await fastify.register(deviceHealthRoutes, { prefix: '/api/v1/device-health' });
  await fastify.register(stationRoutes, { prefix: '/api/v1/stations' });
  await fastify.register(zoneRoutes, { prefix: '/api/v1/zones' });
  await fastify.register(feedTypeRoutes, { prefix: '/api/v1/feed-types' });
  await fastify.register(formulaRoutes, { prefix: '/api/v1/formulas' });
  await fastify.register(economicDataRoutes, { prefix: '/api/v1/economic-data' });
  await fastify.register(externalDataSourceRoutes, { prefix: '/api/v1/external-data-sources' });
  await fastify.register(masterEventRoutes, { prefix: '/api/v1/master-events' });

  return fastify;
}

// Start server
async function start() {
  try {
    const server = await build();
    
    // Initialize Kafka connection
    console.log('🔌 Initializing Kafka connection...');
    const { kafkaPublisher } = await import('./utils/kafka');
    try {
      await kafkaPublisher.connect();
      console.log('✅ Kafka connection established');
    } catch (kafkaError) {
      console.warn('⚠️ Kafka connection failed, will retry on first publish:', kafkaError instanceof Error ? kafkaError.message : String(kafkaError));
    }
    
    await server.listen({ 
      port: PORT, 
      host: HOST 
    });

    console.log(`🚀 Master Service is running on http://${HOST}:${PORT}`);
    console.log(`📚 API Documentation available at http://${HOST}:${PORT}/docs`);
    console.log(`🏥 Health check available at http://${HOST}:${PORT}/health`);
    
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  try {
    const { kafkaPublisher } = await import('./utils/kafka');
    await kafkaPublisher.disconnect();
  } catch (error) {
    console.warn('Error disconnecting Kafka:', error instanceof Error ? error.message : String(error));
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  try {
    const { kafkaPublisher } = await import('./utils/kafka');
    await kafkaPublisher.disconnect();
  } catch (error) {
    console.warn('Error disconnecting Kafka:', error instanceof Error ? error.message : String(error));
  }
  process.exit(0);
});

// Start the server
if (require.main === module) {
  start();
}

export { build };
