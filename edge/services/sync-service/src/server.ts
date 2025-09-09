// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import * as cron from "node-cron";
import { PORT, SYNC_INTERVAL_MINUTES, NODE_ENV } from "./configs/config";
import { apiKey } from "./middlewares/apiKey";
import { errorHandler } from "./middlewares/errorHandler";
import { runSync } from "./utils/syncJob";

const fastify = Fastify({
  logger: {
    level: NODE_ENV === "development" ? "info" : "warn",
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || true,
    credentials: (process.env.CORS_ALLOW_CREDENTIALS ?? "false") === "true",
    methods: process.env.CORS_ALLOW_METHODS?.split(",") || ["GET", "POST", "OPTIONS"],
    allowedHeaders: process.env.CORS_ALLOW_HEADERS?.split(",") || ["Content-Type", "Authorization", "x-api-key"],
  });

  // Helmet for security
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "FarmIQ Sync Service API",
        description: "Edge to Cloud data synchronization service for FarmIQ",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: "Development server",
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/api-docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        tags: ["Health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
              uptime: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    }
  );

  // Manual sync trigger
  fastify.post(
    "/sync/trigger",
    {
      preHandler: [apiKey],
      schema: {
        description: "Manually trigger data synchronization",
        tags: ["Sync"],
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
              message: { type: "string" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      void runSync(); // fire-and-forget
      return { ok: true, message: "sync started" };
    }
  );

  // Root redirect to docs
  fastify.get("/", async (request, reply) => {
    return reply.redirect("/api-docs");
  });
}

// Error handler
fastify.setErrorHandler(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    fastify.log.info("Server closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Start server
async function start() {
  try {
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start server
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    
    console.log(`🚀 Sync service running on http://localhost:${PORT}`);
    console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);

    // Schedule cron job
    const everyMin = SYNC_INTERVAL_MINUTES;
    const expr = `*/${everyMin} * * * *`;

    console.log(`🕒 scheduling sync job: ${expr} (every ${everyMin} minute)`);
    cron.schedule(expr, () => {
      void runSync();
    });

    // Run once on boot
    void runSync();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

// Start the server
start();