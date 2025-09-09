// src/middleware/errorHandler.ts
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const status = error?.statusCode ?? 500;
  const message = error?.message ?? 'Internal Server Error';
  
  if (status >= 500) {
    console.error('❌ Server Error:', error);
  }
  
  reply.status(status).send({ 
    error: message,
    statusCode: status 
  });
};

