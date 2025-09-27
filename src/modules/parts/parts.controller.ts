import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Parts')
@Controller('parts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new auto part' })
  @ApiResponse({ status: 201, description: 'Part successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - part already exists' })
  async create(@Body() createPartDto: CreatePartDto) {
    return await this.partsService.create(createPartDto);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all parts (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'All parts retrieved successfully' })
  async findAll() {
    return await this.partsService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active parts (Public)' })
  @ApiResponse({ status: 200, description: 'Active parts retrieved successfully' })
  async findActive() {
    return await this.partsService.findActive();
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured parts (Public)' })
  @ApiResponse({ status: 200, description: 'Featured parts retrieved successfully' })
  async findFeatured() {
    return await this.partsService.findFeatured();
  }

  @Get('low-stock')
  @Roles('admin', 'manager')
  async findLowStock() {
    return await this.partsService.findLowStock();
  }

  @Get('search')
  @Public()
  async search(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return await this.partsService.search(query);
  }

  @Get('by-category/:categoryId')
  @Public()
  async findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return await this.partsService.findByCategory(categoryId);
  }

  @Get('by-manufacturer/:manufacturerId')
  @Public()
  async findByManufacturer(@Param('manufacturerId', ParseUUIDPipe) manufacturerId: string) {
    return await this.partsService.findByManufacturer(manufacturerId);
  }

  @Get('by-tags')
  @Public()
  async findByTags(@Query('tags') tags: string) {
    if (!tags) {
      return [];
    }
    const tagArray = tags.split(',').map(tag => tag.trim());
    return await this.partsService.findByTags(tagArray);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return await this.partsService.update(id, updatePartDto);
  }

  @Patch(':id/stock')
  @Roles('admin', 'manager')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return await this.partsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.partsService.remove(id);
  }

  @Patch(':id/soft-delete')
  @Roles('admin', 'manager')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.softDelete(id);
  }

  @Patch(':id/restore')
  @Roles('admin', 'manager')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.restore(id);
  }
}
