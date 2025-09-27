import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from '../../config/logging.config';
import { LoggingService } from './logging.service';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => createWinstonConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
