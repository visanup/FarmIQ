// src/middlewares/apiKey.ts (Fastify)
import { FastifyReply, FastifyRequest } from 'fastify';
import { SERVICE_API_KEY, REQUIRE_API_KEY } from '../configs/config';

export async function apiKey(request: FastifyRequest, reply: FastifyReply) {
  if (!REQUIRE_API_KEY || !SERVICE_API_KEY) return; // allow
  const headerKey = request.headers['x-api-key'];
  const queryKey = (request.query as any)?.api_key;
  const key = (Array.isArray(headerKey) ? headerKey[0] : headerKey) || queryKey;
  if (!key || key !== SERVICE_API_KEY) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

