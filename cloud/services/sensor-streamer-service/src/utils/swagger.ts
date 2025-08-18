// src/utils/swagger.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from './zod';
import {
  BuildDatasetRequestSchema,
  BuildDatasetResponseSchema,
  DatasetExportSchema,
  ModelRegisterRequestSchema,
  ModelRegisterResponseSchema,
  BackfillRequestSchema,
} from '../schemas/streamer.schemas';

export function buildOpenApiSpec() {
  const registry = new OpenAPIRegistry();

  // Security scheme: x-api-key
  registry.registerComponent('securitySchemes', 'ApiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
  });

  // (optional) give names in components.schemas
  registry.register('BuildDatasetRequest', BuildDatasetRequestSchema);
  registry.register('BuildDatasetResponse', BuildDatasetResponseSchema);
  registry.register('DatasetExport', DatasetExportSchema);
  registry.register('ModelRegisterRequest', ModelRegisterRequestSchema);
  registry.register('ModelRegisterResponse', ModelRegisterResponseSchema);
  registry.register('BackfillRequest', BackfillRequestSchema);

  // ---- paths ----

  // datasets.build
  registry.registerPath({
    method: 'post',
    path: '/api/datasets/build',
    tags: ['datasets'],
    description: 'Build dataset export (manifest CSV) to MinIO',
    security: [{ ApiKeyAuth: [] }],
    request: { body: { content: { 'application/json': { schema: BuildDatasetRequestSchema } } } },
    responses: {
      200: { description: 'Dataset built', content: { 'application/json': { schema: BuildDatasetResponseSchema } } },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  });

  // datasets.recent
  registry.registerPath({
    method: 'get',
    path: '/api/datasets/recent',
    tags: ['datasets'],
    description: 'List recent dataset exports',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({ limit: z.number().int().min(1).max(100).default(10).optional() }),
    },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: z.array(DatasetExportSchema) } } },
      401: { description: 'Unauthorized' },
    },
  });

  // models.register
  registry.registerPath({
    method: 'post',
    path: '/api/models/register',
    tags: ['models'],
    description: 'Register a trained model (and deploy if auto_deploy=true)',
    security: [{ ApiKeyAuth: [] }],
    request: { body: { content: { 'application/json': { schema: ModelRegisterRequestSchema } } } },
    responses: {
      200: { description: 'Registered (and possibly deployed)', content: { 'application/json': { schema: ModelRegisterResponseSchema } } },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  });

  // infer.backfill
  registry.registerPath({
    method: 'post',
    path: '/api/infer/backfill',
    tags: ['inference'],
    description: 'Submit object_keys for backfill inference',
    security: [{ ApiKeyAuth: [] }],
    request: { body: { content: { 'application/json': { schema: BackfillRequestSchema } } } },
    responses: {
      200: { description: 'Accepted / Completed response from inference-service', content: { 'application/json': { schema: z.object({}).passthrough() } } },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Edge Orchestrator Service',
      version: '0.1.0',
      description: 'Orchestrates dataset exports, model registration/deploy, and backfill inference at the edge.',
    },
    servers: [{ url: '/' }],
    tags: [
      { name: 'health', description: 'Service health' },
      { name: 'datasets', description: 'Build/list dataset exports' },
      { name: 'models', description: 'Register & deploy models' },
      { name: 'inference', description: 'Backfill or on-demand inference' },
    ],
  });
}
