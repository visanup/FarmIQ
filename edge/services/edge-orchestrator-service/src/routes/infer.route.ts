import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';
import { backfillInfer } from '../services/infer.service';
import { BackfillRequestSchema } from '../schemas/orchestrator.schemas';

export default async function infer(fastify: FastifyInstance) {
  fastify.post('/backfill', { preHandler: [apiKey] }, async (req, reply) => {
    const parsed = BackfillRequestSchema.safeParse((req as any).body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const out = await backfillInfer(parsed.data.object_keys);
    return out;
  });
}

