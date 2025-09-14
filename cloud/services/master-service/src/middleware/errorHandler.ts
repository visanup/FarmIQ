import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { log } = request;

  // Log the error
  log.error(error);

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(409).send({
          success: false,
          error: 'Conflict',
          message: 'A record with this data already exists',
          code: error.code
        });
      
      case 'P2025':
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Record not found',
          code: error.code
        });
      
      case 'P2003':
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Foreign key constraint failed',
          code: error.code
        });
      
      default:
        return reply.status(500).send({
          success: false,
          error: 'Database Error',
          message: 'An unexpected database error occurred',
          code: error.code
        });
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: error.message
    });
  }

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation
    });
  }

  // Handle HTTP errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }

  // Handle unexpected errors
  return reply.status(500).send({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
  });
}
