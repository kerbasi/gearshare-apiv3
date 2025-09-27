import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, headers } = request;
    const ip = request.ip || 'unknown';
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Extract user ID from request if available
    const userId = (request as any).user?.id;

    // Log the incoming request
    this.loggingService.logRequest(
      method,
      url,
      userAgent,
      ip,
      userId,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.loggingService.logResponse(
            method,
            url,
            response.statusCode,
            responseTime,
            userId,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.loggingService.error(
            `HTTP ${method} ${url} - Error: ${error.message}`,
            error.stack,
            'HTTP',
            {
              method,
              url,
              statusCode: error.status || 500,
              responseTime,
              userId,
              error: error.message,
            },
          );
        },
      }),
    );
  }
}
