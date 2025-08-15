// src/utils/swagger.ts
import { PORT } from '../configs/config';

export function buildOpenApiSpec() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Image Ingestion Service',
      version: '1.0.0',
      description: 'Receive images, store to MinIO, persist metadata, publish MQTT event',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local dev' }],
    tags: [{ name: 'ingestion' }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
      parameters: {
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 200, default: 20 },
          description: 'Max rows (1–200)',
        },
      },
      schemas: {
        IngestResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            media_id: { type: 'integer', example: 123 },
            object_key: { type: 'string', example: 'farm-001/camera-01/1739592000000-a1b2c3d.jpg' },
            bucket: { type: 'string', example: 'images' },
          },
          required: ['ok', 'media_id', 'object_key', 'bucket'],
        },
        MediaObject: {
          type: 'object',
          properties: {
            media_id: { type: 'integer', example: 123 },
            time: { type: 'string', format: 'date-time' },
            tenant_id: { type: 'string', example: 'farm-001' },
            kind: { type: 'string', example: 'image' },
            bucket: { type: 'string', example: 'images' },
            object_key: { type: 'string', example: 'farm-001/camera-01/1739592000000-a1b2c3d.jpg' },
            sha256: { type: 'string', nullable: true },
            width: { type: 'integer', nullable: true, example: 1920 },
            height: { type: 'integer', nullable: true, example: 1080 },
            meta: { type: 'object', additionalProperties: true },
          },
          required: ['media_id', 'time', 'tenant_id', 'kind', 'bucket', 'object_key'],
        },
      },
      requestBodies: {
        IngestImageBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'tenant_id'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  tenant_id: { type: 'string', example: 'farm-001' },
                  metric: { type: 'string', example: 'image' },
                  time: { type: 'string', format: 'date-time', example: '2025-08-15T13:45:00Z' },
                  robot_id: { type: 'string', example: 'robot-01' },
                  run_id: { oneOf: [{ type: 'string' }, { type: 'number' }], example: '42' },
                  station_id: { type: 'string', example: 'station-a' },
                  sensor_id: { type: 'string', example: 'camera-01' },
                  kind: { type: 'string', example: 'image' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      '/api/ingest/image': {
        post: {
          tags: ['ingestion'],
          security: [{ ApiKeyAuth: [] }],
          description: 'รับภาพ (multipart/form-data) → MinIO → DB → publish MQTT event',
          requestBody: { $ref: '#/components/requestBodies/IngestImageBody' },
          responses: {
            '201': {
              description: 'Created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/IngestResponse' } } },
            },
            '400': { description: 'Bad request' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Server error' },
          },
        },
      },
      '/api/ingest/recent': {
        get: {
          tags: ['ingestion'],
          security: [{ ApiKeyAuth: [] }],
          description: 'รายการ media_objects ล่าสุด',
          parameters: [{ $ref: '#/components/parameters/LimitParam' }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MediaObject' },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Server error' },
          },
        },
      },
    },
  };
}



