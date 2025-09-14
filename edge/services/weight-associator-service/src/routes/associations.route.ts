// Fastify associations route (brief only; full joins removed with Prisma shift)
import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';
import { listRecentAssociations, getAssociationByMediaId } from '../services/readingMediaMap.service';

export default async function associations(fastify: FastifyInstance) {
  fastify.get('/associations/recent', { preHandler: [apiKey] }, async (req) => {
    const q: any = req.query || {};
    const limitRaw = Number.parseInt(String(q.limit ?? '20'), 10);
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 1), 200);
    const rows = await listRecentAssociations(limit);
    return rows;
  });

  fastify.get('/associations/by-media/:mediaId', { preHandler: [apiKey] }, async (req, reply) => {
    const params: any = (req as any).params || {};
    const row = await getAssociationByMediaId(params.mediaId);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return row;
  });
}
