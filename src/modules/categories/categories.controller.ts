import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - category already exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all categories (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'All categories retrieved successfully' })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active categories (Public)' })
  @ApiResponse({ status: 200, description: 'Active categories retrieved successfully' })
  async findActive() {
    return await this.categoriesService.findActive();
  }

  @Get('tree')
  @Public()
  @ApiOperation({ summary: 'Get category tree structure (Public)' })
  @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
  async getCategoryTree() {
    return await this.categoriesService.getCategoryTree();
  }

  @Get('root')
  @Public()
  @ApiOperation({ summary: 'Get root categories (Public)' })
  @ApiResponse({ status: 200, description: 'Root categories retrieved successfully' })
  async findRootCategories() {
    return await this.categoriesService.findRootCategories();
  }

  @Get('by-parent/:parentId')
  @Public()
  @ApiOperation({ summary: 'Get categories by parent (Public)' })
  @ApiResponse({ status: 200, description: 'Categories by parent retrieved successfully' })
  async findByParent(@Param('parentId', ParseUUIDPipe) parentId: string) {
    return await this.categoriesService.findByParent(parentId);
  }

  @Get('by-slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get category by slug (Public)' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
  }

  @Patch(':id/soft-delete')
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete category (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Category soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.softDelete(id);
  }

  @Patch(':id/restore')
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore soft deleted category (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Category restored successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.restore(id);
  }
}
