import type { FastifyRequest, FastifyReply } from 'fastify';

// Generate JWT token
export const generateToken = (_payload: object): string => {
  // This will be implemented when we have access to the Fastify instance
  // For now, we'll leave this as a placeholder
  throw new Error('generateToken should be called on the Fastify instance');
};

// Authentication middleware
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ error: 'Authentication failed' });
  }
};
