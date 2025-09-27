import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('User with this username already exists');
      }
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for conflicts if updating email or username
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: [
          ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
          ...(updateUserDto.username ? [{ username: updateUserDto.username }] : []),
        ],
      });

      if (existingUser && existingUser.id !== id) {
        if (updateUserDto.email && existingUser.email === updateUserDto.email) {
          throw new ConflictException('User with this email already exists');
        }
        if (updateUserDto.username && existingUser.username === updateUserDto.username) {
          throw new ConflictException('User with this username already exists');
        }
      }
    }

    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if user exists
    await this.userRepository.delete(id);
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
    user.deletedAt = new Date();
    return user;
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.restore(id);
    user.deletedAt = null;
    return user;
  }
}
