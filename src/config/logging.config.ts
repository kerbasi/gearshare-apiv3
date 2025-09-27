import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export const createWinstonConfig = (configService: ConfigService) => {
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  const logLevel = configService.get('LOG_LEVEL') || (isDevelopment ? 'debug' : 'info');

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint(),
    ),
    defaultMeta: {
      service: 'auto-parts-api',
      version: '1.0.0',
    },
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const contextStr = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${level}: ${contextStr} ${message}${metaStr}`;
          }),
        ),
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),

      // File transport for combined logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],

    // Exception handling
    exceptionHandlers: [
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],

    // Rejection handling
    rejectionHandlers: [
      new winston.transports.File({
        filename: 'logs/rejections.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  };
};