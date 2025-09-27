import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { RoleService } from './role.service';
import { LoggingService } from '../logging/logging.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '../../database/entities/user.entity';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
    private readonly loggingService: LoggingService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Validate password confirmation
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = await this.passwordService.validatePasswordStrength(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // Get default client role
    const clientRole = await this.roleService.getDefaultClientRole();

    // Create user with default client role
    const user = await this.usersService.create({
      email: registerDto.email,
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
      roleId: clientRole.id,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Log successful registration
    this.loggingService.logAuthEvent('user_registered', user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.comparePassword(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Log successful login
    this.loggingService.logAuthEvent('user_logged_in', user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Validate password confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Get user
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = await this.passwordService.validatePasswordStrength(changePasswordDto.newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedNewPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);

    // Update user password
    await this.usersService.update(userId, { passwordHash: hashedNewPassword });
  }

  async refreshToken(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return await this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you would:
    // 1. Add the token to a blacklist
    // 2. Remove the refresh token from the database
    // 3. Log the logout event
    // For now, we'll just return success
    // The client should remove the tokens from storage
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role?.name || 'user',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.passwordService.comparePassword(password, user.passwordHash)) {
      return this.sanitizeUser(user);
    }
    return null;
  }
}
