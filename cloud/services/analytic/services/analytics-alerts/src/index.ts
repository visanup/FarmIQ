// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import winston from 'winston';
import { join } from 'path';
// Auth middleware removed
import { validateRequest } from './middlewares/validation';
import { alertRouter } from './routes/alert.routes';
import { initializeDatabase } from './utils/database';
import { connectKafka, consumer, disconnectKafka } from './utils/kafka';
import { AlertService } from './services/alert.service';
import { Alert } from './models/alert.model';
import { PORT, ENV } from './configs/config';
import { initRegistry } from './pipelines/registry';
import { handleAnalyticsFeature } from './pipelines/map/analyticsFeature';
import { handleAnomaly } from './pipelines/map/anomaly';
import { handleKPI } from './pipelines/map/kpi';

// Initialize logger
const { colorize, simple, combine, timestamp, printf } = winston.format;
const logFormat = printf((info: any) => {
  return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
});

const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        simple()
      )
    })
  ]
});

// Initialize alert service
const alertService = new AlertService();

// Initialize Kafka topics
const KAFKA_TOPICS = ["analytics.features", "analytics.anomalies"];

// Initialize Kafka consumer
const run = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Initialize Kafka
    await connectKafka(KAFKA_TOPICS);
    
    // Initialize alert rules registry
    initRegistry();
    
    // Create Express app
    const app: Application = express();
    
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(morgan('combined'));
    
    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.sendStatus(200);
    });
    
    // API routes
    app.use('/api', alertRouter);
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Analytics alerts service running on port ${PORT}`);
      logger.info(`📘 API docs available at http://localhost:${PORT}/api-docs`);
    });
    
    // Graceful shutdown
    const shutdown = () => {
      logger.info('⚡️ Shutting down analytics-alerts service...');
      
      // Close server
      server.close(async () => {
        // Disconnect Kafka
        await disconnectKafka();
        
        // Exit process
        process.exit(0);
      });
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Kafka message processing loop
    const processMessages = async () => {
      try {
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            logger.info(`📨 Received message from ${topic} (partition ${partition})`);
            
            try {
              const payload = JSON.parse(message.value?.toString() || '{}');
              
              // Route message to appropriate handler
              let alert = null;
              
              switch(topic) {
                case 'analytics.features':
                  alert = await handleAnalyticsFeature(payload);
                  break;
                case 'analytics.anomalies':
                  alert = await handleAnomaly(payload);
                  break;
                default:
                  logger.warn(`⚠️ Unknown topic: ${topic}`);
                  return;
              }
              
              if (alert) {
                await alertService.createAlert(alert);
                logger.info(`✅ Created alert: ${alert.type}`);
              }
            } catch (error) {
              logger.error(`❌ Error processing message: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        });
      } catch (error) {
        logger.error(`❌ Failed to run Kafka consumer: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    // Start processing messages
    processMessages();
    
    // Periodically check for new data (for non-Kafka sources)
    setInterval(async () => {
      try {
        // Add any periodic checks here if needed
      } catch (error) {
        logger.error(`❌ Error in periodic check: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, parseInt(process.env.POLL_INTERVAL_SECONDS || '60') * 1000);
    
  } catch (error) {
    logger.error(`❌ Failed to start analytics-alerts service: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

run();