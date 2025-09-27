import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingService } from './modules/logging/logging.service';
import { HttpLoggingInterceptor } from './modules/logging/http-logging.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CustomValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable default logger to use Winston
  });

  // Get logging service
  const loggingService = app.get(LoggingService);

  // Global validation pipe with custom error handling
  app.useGlobalPipes(new CustomValidationPipe());

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(loggingService));

  // Global logging interceptor
  app.useGlobalInterceptors(new HttpLoggingInterceptor(loggingService));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Auto Parts API')
    .setDescription('A comprehensive REST API for managing auto parts inventory')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management operations')
    .addTag('Manufacturers', 'Auto parts manufacturer management')
    .addTag('Categories', 'Product category hierarchy management')
    .addTag('Parts', 'Auto parts catalog and inventory management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
