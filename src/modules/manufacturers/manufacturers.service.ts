import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../../database/entities/manufacturer.entity';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = this.manufacturerRepository.create(createManufacturerDto);
    return await this.manufacturerRepository.save(manufacturer);
  }

  async findAll(): Promise<Manufacturer[]> {
    return await this.manufacturerRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<Manufacturer[]> {
    return await this.manufacturerRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id },
      relations: ['parts'],
    });

    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    return manufacturer;
  }

  async update(id: string, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    Object.assign(manufacturer, updateManufacturerDto);
    return await this.manufacturerRepository.save(manufacturer);
  }

  async remove(id: string): Promise<void> {
    const manufacturer = await this.findOne(id);
    await this.manufacturerRepository.remove(manufacturer);
  }

  async softDelete(id: string): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    manufacturer.isActive = false;
    return await this.manufacturerRepository.save(manufacturer);
  }
}
