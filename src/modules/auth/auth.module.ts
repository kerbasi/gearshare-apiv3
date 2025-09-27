import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { RoleService } from './role.service';
import { LoggingService } from '../logging/logging.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { UserRole } from '../../database/entities/user-role.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRole]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    RoleService,
    LoggingService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
