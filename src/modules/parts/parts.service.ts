import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Part } from '../../database/entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createPartDto: CreatePartDto): Promise<Part> {
    // Check if part with same manufacturer and part number already exists
    const existingPart = await this.partRepository.findOne({
      where: {
        manufacturerId: createPartDto.manufacturerId,
        partNumber: createPartDto.partNumber,
        isActive: true,
      },
    });

    if (existingPart) {
      throw new ConflictException(
        `Part with number ${createPartDto.partNumber} already exists for this manufacturer`,
      );
    }

    const part = this.partRepository.create(createPartDto);
    return await this.partRepository.save(part);
  }

  async findAll(): Promise<Part[]> {
    return await this.partRepository.find({
      relations: ['manufacturer', 'category', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Part[]> {
    return await this.partRepository.find({
      where: { isActive: true },
      relations: ['manufacturer', 'category'],
      order: { name: 'ASC' },
    });
  }

  async findFeatured(): Promise<Part[]> {
    return await this.partRepository.find({
      where: { isActive: true, isFeatured: true },
      relations: ['manufacturer', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(categoryId: string): Promise<Part[]> {
    return await this.partRepository.find({
      where: { categoryId, isActive: true },
      relations: ['manufacturer', 'category'],
      order: { name: 'ASC' },
    });
  }

  async findByManufacturer(manufacturerId: string): Promise<Part[]> {
    return await this.partRepository.find({
      where: { manufacturerId, isActive: true },
      relations: ['manufacturer', 'category'],
      order: { partNumber: 'ASC' },
    });
  }

  async search(query: string): Promise<Part[]> {
    return await this.partRepository.find({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { partNumber: ILike(`%${query}%`), isActive: true },
        { description: ILike(`%${query}%`), isActive: true },
      ],
      relations: ['manufacturer', 'category'],
      order: { name: 'ASC' },
    });
  }

  async findByTags(tags: string[]): Promise<Part[]> {
    return await this.partRepository
      .createQueryBuilder('part')
      .leftJoinAndSelect('part.manufacturer', 'manufacturer')
      .leftJoinAndSelect('part.category', 'category')
      .where('part.isActive = :isActive', { isActive: true })
      .andWhere('part.tags && :tags', { tags })
      .orderBy('part.name', 'ASC')
      .getMany();
  }

  async findLowStock(): Promise<Part[]> {
    return await this.partRepository
      .createQueryBuilder('part')
      .leftJoinAndSelect('part.manufacturer', 'manufacturer')
      .leftJoinAndSelect('part.category', 'category')
      .where('part.isActive = :isActive', { isActive: true })
      .andWhere('part.stockQuantity <= part.minStockLevel')
      .orderBy('part.stockQuantity', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id },
      relations: ['manufacturer', 'category', 'createdBy', 'partCompatibilities', 'partCompatibilities.vehicleModel'],
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  async update(id: string, updatePartDto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);

    // Check for conflicts if updating manufacturer or part number
    if (updatePartDto.manufacturerId || updatePartDto.partNumber) {
      const manufacturerId = updatePartDto.manufacturerId || part.manufacturerId;
      const partNumber = updatePartDto.partNumber || part.partNumber;

      const existingPart = await this.partRepository.findOne({
        where: {
          manufacturerId,
          partNumber,
          isActive: true,
        },
      });

      if (existingPart && existingPart.id !== id) {
        throw new ConflictException(
          `Part with number ${partNumber} already exists for this manufacturer`,
        );
      }
    }

    Object.assign(part, updatePartDto);
    return await this.partRepository.save(part);
  }

  async remove(id: string): Promise<void> {
    const part = await this.findOne(id);
    await this.partRepository.remove(part);
  }

  async softDelete(id: string): Promise<Part> {
    const part = await this.findOne(id);
    part.isActive = false;
    return await this.partRepository.save(part);
  }

  async restore(id: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    part.isActive = true;
    return await this.partRepository.save(part);
  }

  async updateStock(id: string, quantity: number): Promise<Part> {
    const part = await this.findOne(id);
    
    if (part.stockQuantity + quantity < 0) {
      throw new ConflictException('Insufficient stock quantity');
    }

    part.stockQuantity += quantity;
    return await this.partRepository.save(part);
  }
}
