// src/utils/logger.ts
import winston from 'winston';

const { combine, timestamp, printf, colorize, simple } = winston.format;

// Create logger
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }: any) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
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

export { logger };