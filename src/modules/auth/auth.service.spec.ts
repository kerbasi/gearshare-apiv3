import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { RoleService } from './role.service';
import { LoggingService } from '../logging/logging.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/entities/user-role.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let passwordService: jest.Mocked<PasswordService>;
  let jwtService: jest.Mocked<JwtService>;
  let roleService: jest.Mocked<RoleService>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    emailVerified: false,
    passwordHash: 'hashed-password',
    role: {
      id: 'role-123',
      name: 'client',
      description: 'Default client role',
      permissions: {},
      isActive: true,
      createdAt: new Date(),
    } as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole: UserRole = {
    id: 'role-123',
    name: 'client',
    description: 'Default client role',
    permissions: {},
    isActive: true,
    createdAt: new Date(),
    users: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            getDefaultClientRole: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            logAuthEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    passwordService = module.get(PasswordService);
    jwtService = module.get(JwtService);
    roleService = module.get(RoleService);
    loggingService = module.get(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should successfully register a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashed-password');
      roleService.getDefaultClientRole.mockResolvedValue(mockRole);
      usersService.create.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.findByUsername).toHaveBeenCalledWith(registerDto.username);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(roleService.getDefaultClientRole).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: 'hashed-password',
        roleId: mockRole.id,
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(loggingService.logAuthEvent).toHaveBeenCalledWith('user_registered', mockUser.id, mockUser.email);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const invalidDto = { ...registerDto, confirmPassword: 'different-password' };

      await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully login with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);
      passwordService.comparePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(loggingService.logAuthEvent).toHaveBeenCalledWith('user_logged_in', mockUser.id, mockUser.email);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser as User);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);
      passwordService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmNewPassword: 'NewPass123!',
    };

    it('should successfully change password', async () => {
      usersService.findOne.mockResolvedValue(mockUser as User);
      passwordService.comparePassword.mockResolvedValue(true);
      passwordService.hashPassword.mockResolvedValue('new-hashed-password');
      usersService.update.mockResolvedValue(mockUser as User);

      await service.changePassword('user-123', changePasswordDto);

      expect(usersService.findOne).toHaveBeenCalledWith('user-123');
      expect(passwordService.comparePassword).toHaveBeenCalledWith(changePasswordDto.currentPassword, mockUser.passwordHash);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(usersService.update).toHaveBeenCalledWith('user-123', { passwordHash: 'new-hashed-password' });
    });

    it('should throw UnauthorizedException when current password is invalid', async () => {
      usersService.findOne.mockResolvedValue(mockUser as User);
      passwordService.comparePassword.mockResolvedValue(false);

      await expect(service.changePassword('user-123', changePasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      usersService.findOne.mockResolvedValue(mockUser as User);
      jwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshToken('user-123');

      expect(usersService.findOne).toHaveBeenCalledWith('user-123');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('user-123')).rejects.toThrow(UnauthorizedException);
    });
  });
});
