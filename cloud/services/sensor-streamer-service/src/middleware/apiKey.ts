// src/middleware/apiKey.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ADMIN_API_KEY } from '../configs/config';

export const apiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const key = request.headers['x-api-key'] as string;
  
  if (!key || key !== ADMIN_API_KEY) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};
