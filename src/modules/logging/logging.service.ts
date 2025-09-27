import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Specific logging methods for different operations
  logRequest(method: string, url: string, userAgent: string, ip: string, userId?: string) {
    this.log(`HTTP ${method} ${url}`, 'HTTP', {
      method,
      url,
      userAgent,
      ip,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  logResponse(method: string, url: string, statusCode: number, responseTime: number, userId?: string) {
    this.log(`HTTP ${method} ${url} - ${statusCode} (${responseTime}ms)`, 'HTTP', {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  logAuthEvent(event: string, userId?: string, email?: string, ip?: string) {
    this.log(`Auth event: ${event}`, 'AUTH', {
      event,
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: string) {
    this.debug(`Database query executed in ${duration}ms`, context, {
      query,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  logBusinessEvent(event: string, entity: string, entityId?: string, userId?: string, meta?: any) {
    this.log(`Business event: ${event}`, 'BUSINESS', {
      event,
      entity,
      entityId,
      userId,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) {
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this[logMethod](`Security event: ${event}`, 'SECURITY', {
      event,
      severity,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }
}
