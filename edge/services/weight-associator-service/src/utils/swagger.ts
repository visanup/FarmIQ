// src/utils/swagger.ts
import { PORT } from '../configs/config';
export function buildOpenApiSpec() {
  return {
    openapi: '3.0.0',
    info: { title: 'Weight Associator Service', version: '1.0.0',
            description: 'Associate images with nearest weight readings and persist mapping.' },
    servers: [{ url: `http://localhost:${PORT}` }],
    paths: {
      '/api/associate/weight': {
        post: {
          summary: 'Associate a media with weight reading',
          security: [{ ApiKeyAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssociateRequest' }}}},
          responses: { '201': { description: 'Created',
                      content: { 'application/json': { schema: { $ref: '#/components/schemas/AssociateResponse' }}}}}
        }
      }
    },
    components: {
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' } },
      schemas: {
        AssociateRequest: {
          type: 'object',
          properties: {
            media_id: { type: 'integer' },
            bucket: { type: 'string' },
            object_key: { type: 'string' },
            window_ms: { type: 'integer', default: 5000 }
          },
          anyOf: [{ required: ['media_id'] }, { required: ['bucket','object_key'] }]
        },
        AssociateResponse: {
          type: 'object',
          required: ['ok','media_id','reading_id','delta_ms'],
          properties: {
            ok: { type: 'boolean' }, media_id: { type: 'integer' }, reading_id: { type: 'integer' },
            delta_ms: { type: 'integer' }, weight: { type: 'number', nullable: true }
          }
        }
      }
    }
  };
}