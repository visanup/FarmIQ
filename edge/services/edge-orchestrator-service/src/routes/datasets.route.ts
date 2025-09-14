import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';
import { buildAndUploadDataset, listRecentDatasets } from '../services/dataset.service';
import { BuildDatasetRequestSchema } from '../schemas/orchestrator.schemas';

export default async function datasets(fastify: FastifyInstance) {
  fastify.post('/build', { preHandler: [apiKey] }, async (req, reply) => {
    const parsed = BuildDatasetRequestSchema.safeParse((req as any).body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { limit } = parsed.data;
    const out = await buildAndUploadDataset(limit);
    return out;
  });

  fastify.get('/recent', { preHandler: [apiKey] }, async (req) => {
    const q: any = req.query || {};
    const limit = Math.min(Math.max(Number(q.limit ?? 10), 1), 100);
    return listRecentDatasets(limit);
  });
}

