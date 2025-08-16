// src/utils/swagger.ts
export function buildOpenApiSpec() {
  return {
    openapi: '3.0.1',
    info: {
      title: 'Edge Orchestrator Service',
      version: '0.1.0'
    },
    paths: {
      '/health': { get: { responses: { 200: { description: 'ok' } } } },
      '/api/datasets/build': { post: { summary: 'Build dataset export' } },
      '/api/datasets/recent': { get: { summary: 'List recent datasets' } },
      '/api/models/register': { post: { summary: 'Register & deploy model' } },
      '/api/infer/backfill': { post: { summary: 'Backfill inference for time range' } }
    }
  };
}