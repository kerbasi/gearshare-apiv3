import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../modules/logging/logging.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = (exceptionResponse as any).message || exceptionResponse;
        error = (exceptionResponse as any).error;
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';
      
      // Log unexpected errors with full details
      this.loggingService.error(
        'Unexpected error occurred',
        exception instanceof Error ? exception.stack : 'Unknown error',
        'GlobalExceptionFilter',
        {
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          userId: (request as any).user?.id,
          error: exception,
        },
      );
    }

    // Log the error
    this.loggingService.error(
      `HTTP ${request.method} ${request.url} - ${status}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      'HTTP',
      {
        method: request.method,
        url: request.url,
        statusCode: status,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        userId: (request as any).user?.id,
        error: typeof message === 'string' ? message : JSON.stringify(message),
      },
    );

    // Prepare error response
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      error: error || HttpStatus[status],
    };

    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      errorResponse.message = ['Internal server error'];
      delete errorResponse.error;
    }

    response.status(status).json(errorResponse);
  }
}
