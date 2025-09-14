import { FastifyRequest, FastifyReply } from 'fastify';
import { ADMIN_API_KEY } from '../config/config';

export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'API key is required'
    });
  }

  if (apiKey !== ADMIN_API_KEY) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }
}

export async function optionalApiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'] as string;

  if (apiKey && apiKey !== ADMIN_API_KEY) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }
}
