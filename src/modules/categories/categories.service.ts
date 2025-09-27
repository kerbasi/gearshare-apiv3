import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with slug "${createCategoryDto.slug}" already exists`);
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['parent', 'children', 'parts'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActive(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByParent(parentId: string): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parentId, isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children', 'parts', 'parts.manufacturer'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'parts', 'parts.manufacturer'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async getCategoryTree(): Promise<Category[]> {
    const rootCategories = await this.findRootCategories();
    return await this.buildCategoryTree(rootCategories);
  }

  private async buildCategoryTree(categories: Category[]): Promise<Category[]> {
    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        category.children = await this.buildCategoryTree(category.children);
      }
    }
    return categories;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Check for slug conflicts
    if (updateCategoryDto.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(`Category with slug "${updateCategoryDto.slug}" already exists`);
      }
    }

    // Check for circular parent references
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      // Check if the new parent is a descendant of this category
      const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
      if (isDescendant) {
        throw new ConflictException('Category cannot have a descendant as its parent');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  private async isDescendant(categoryId: string, potentialParentId: string): Promise<boolean> {
    const children = await this.categoryRepository.find({
      where: { parentId: categoryId },
    });

    for (const child of children) {
      if (child.id === potentialParentId) {
        return true;
      }
      if (await this.isDescendant(child.id, potentialParentId)) {
        return true;
      }
    }

    return false;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new ConflictException('Cannot delete category that has child categories');
    }

    await this.categoryRepository.remove(category);
  }

  async softDelete(id: string): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = false;
    return await this.categoryRepository.save(category);
  }

  async restore(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    category.isActive = true;
    return await this.categoryRepository.save(category);
  }
}
