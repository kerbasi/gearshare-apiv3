import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashed-password',
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    role: null,
    parts: [],
    orders: [],
    sessions: [],
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashed-password',
    roleId: 'role-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['role'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['role'],
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...updateDto,
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('user-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['role'],
      });
      expect(repository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.softDelete('user-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['role'],
      });
      expect(repository.softDelete).toHaveBeenCalledWith('user-123');
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      repository.findOne.mockResolvedValue(deletedUser);
      repository.restore.mockResolvedValue({ affected: 1 } as any);

      const result = await service.restore('user-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        withDeleted: true,
      });
      expect(repository.restore).toHaveBeenCalledWith('user-123');
      expect(result.deletedAt).toBeNull();
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.restore('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
