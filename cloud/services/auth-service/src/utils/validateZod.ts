import { FastifyReply, FastifyRequest } from 'fastify';
import { AnyZodObject, ZodError } from 'zod';

type Source = 'body' | 'query' | 'params';

export const validateZod = (source: Source, schema: AnyZodObject) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = (request as any)[source];
      const result = await schema.parseAsync(data);
      (request as any)[source] = result;
    } catch (err) {
      const issues = (err as ZodError).issues?.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return reply.status(400).send({ error: 'Validation error', issues });
    }
  };

