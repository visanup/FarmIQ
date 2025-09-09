// src/middleware/apiKey.ts

import { FastifyRequest, FastifyReply } from "fastify";
import { SERVICE_API_KEY, REQUIRE_API_KEY } from "../configs/config";

export const apiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  // dev: ถ้าไม่ enforce หรือไม่มี key → ปล่อยผ่าน
  if (!REQUIRE_API_KEY || !SERVICE_API_KEY) {
    return;
  }

  const key = (request.headers["x-api-key"] || (request.query as any)?.api_key)?.toString();

  if (!key || key !== SERVICE_API_KEY) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
};


