// src/utils/openapi.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { alertSchema } from '../schemas/analytics.schemas';
import { Alert } from '../models/alert.model';
import { PORT } from '../configs/config';

const registry = new OpenAPIRegistry();

// Register security scheme
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Register paths
registry.registerPath({
  method: 'get',
  path: '/api/alerts',
  tags: ['Alerts'],
  description: 'Get all alerts',
  responses: { 200: { description: 'List of alerts' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/alerts/{id}',
  tags: ['Alerts'],
  description: 'Get alert by ID',
  responses: { 
    200: { description: 'Alert details' }, 
    404: { description: 'Alert not found' }
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/alerts/tenant/{tenantId}',
  tags: ['Alerts'],
  description: 'Get alerts by tenant',
  responses: { 200: { description: 'List of alerts for the tenant' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/alerts/tenant/{tenantId}/factory/{factoryId}',
  tags: ['Alerts'],
  description: 'Get alerts by tenant and factory',
  responses: { 200: { description: 'List of alerts for the tenant and factory' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/alerts/unresolved',
  tags: ['Alerts'],
  description: 'Get unresolved alerts',
  responses: { 200: { description: 'List of unresolved alerts' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/alerts',
  tags: ['Alerts'],
  description: 'Create a new alert',
  request: { body: { content: { 'application/json': { schema: alertSchema } } } },
  responses: { 201: { description: 'Alert created' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/alerts/{id}/resolve',
  tags: ['Alerts'],
  description: 'Resolve an alert',
  responses: { 
    200: { description: 'Alert resolved' },
    404: { description: 'Alert not found' }
  },
});

// Create OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Analytics Alerts Service API',
    version: '1.0.0',
    description: 'Analytics Alerts Service endpoints for FarmIQ',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  security: [{ bearerAuth: [] }],
});