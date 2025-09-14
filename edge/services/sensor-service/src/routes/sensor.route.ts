// src/routes/sensor.route.ts (Fastify plugin)
import { FastifyInstance } from "fastify";
import { apiKey } from "../middlewares/apiKey";

const latestCache: any[] = [];
export function stashLatest(msg: any) {
  latestCache.unshift(msg);
  if (latestCache.length > 50) latestCache.pop();
}

export default async function sensorRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async (_req, _reply) => ({ ok: true }));

  fastify.get(
    "/latest",
    { preHandler: [apiKey] },
    async (_req, _reply) => ({ data: latestCache })
  );
}
