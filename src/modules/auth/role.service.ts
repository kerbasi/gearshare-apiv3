import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../database/entities/user-role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(UserRole)
    private readonly roleRepository: Repository<UserRole>,
  ) {}

  async getDefaultClientRole(): Promise<UserRole> {
    const clientRole = await this.roleRepository.findOne({
      where: { name: 'client' },
    });

    if (!clientRole) {
      throw new Error('Default client role not found. Please run database migrations.');
    }

    return clientRole;
  }

  async getRoleByName(name: string): Promise<UserRole | null> {
    return await this.roleRepository.findOne({
      where: { name },
    });
  }
}
