// Fastify middleware style
import { FastifyReply, FastifyRequest } from 'fastify';
import { API_KEY } from '../configs/config';

export async function apiKey(req: FastifyRequest, reply: FastifyReply) {
  const headerKey = req.headers['x-api-key'];
  const queryKey = (req.query as any)?.api_key;
  const key = (Array.isArray(headerKey) ? headerKey[0] : headerKey) || queryKey;
  if (!API_KEY) { reply.code(500).send({ error: 'Service misconfigured: API_KEY missing' }); return; }
  if (!key || key !== API_KEY) { reply.code(401).send({ error: 'Unauthorized' }); return; }
}