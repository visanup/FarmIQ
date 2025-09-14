// src/routes/ingestion.routes.ts (Fastify)
import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';
import { ingestImage, listRecentMedia } from '../services/media.service';
import { IngestMetaSchema } from '../schemas/ingestion.schemas';

export default async function ingestionRoutes(fastify: FastifyInstance) {
  // Register multipart
  await fastify.register(require('@fastify/multipart'));

  fastify.post('/image', { preHandler: [apiKey] }, async (req, reply) => {
    const mp: any = await (req as any).file();
    if (!mp) return reply.code(400).send({ error: 'file is required' });

    const fields = await mp.fields();
    const body: any = {};
    for (const [k, v] of Object.entries(fields)) body[k] = Array.isArray(v) ? v[0].value : (v as any).value;
    const parsed = IngestMetaSchema.safeParse(body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const buf = await mp.toBuffer();
    const out = await ingestImage({ buffer: buf, originalname: mp.filename, mimetype: mp.mimetype, size: mp.file?.bytesRead }, parsed.data);
    return reply.code(201).send(out);
  });

  fastify.get('/recent', { preHandler: [apiKey] }, async (req, reply) => {
    const q: any = req.query || {};
    const limit = Math.min(parseInt(String(q.limit ?? '20'), 10) || 20, 200);
    const data = await listRecentMedia(limit);
    return { data };
  });
}

