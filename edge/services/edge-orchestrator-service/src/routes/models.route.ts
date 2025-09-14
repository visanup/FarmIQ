import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';
import { registerAndDeployModel } from '../services/model-intake.service';
import { ModelRegisterRequestSchema } from '../schemas/orchestrator.schemas';

export default async function models(fastify: FastifyInstance) {
  fastify.post('/register', { preHandler: [apiKey] }, async (req, reply) => {
    const parsed = ModelRegisterRequestSchema.safeParse((req as any).body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const out = await registerAndDeployModel(parsed.data);
    return out;
  });
}

