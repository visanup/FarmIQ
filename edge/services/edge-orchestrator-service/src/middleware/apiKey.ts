import { FastifyReply, FastifyRequest } from 'fastify';
import { ADMIN_API_KEY } from '../configs/config';

export async function apiKey(req: FastifyRequest, reply: FastifyReply) {
  if (!ADMIN_API_KEY) { reply.code(500).send({ error: 'Server missing ADMIN_API_KEY' }); return; }
  const headerKey = req.headers['x-api-key'];
  const queryKey = (req.query as any)?.api_key;
  const key = (Array.isArray(headerKey) ? headerKey[0] : headerKey) || queryKey;
  if (key !== ADMIN_API_KEY) { reply.code(401).send({ error: 'invalid api key' }); return; }
}
