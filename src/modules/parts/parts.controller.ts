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
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartDto: CreatePartDto) {
    return await this.partsService.create(createPartDto);
  }

  @Get()
  async findAll() {
    return await this.partsService.findAll();
  }

  @Get('active')
  async findActive() {
    return await this.partsService.findActive();
  }

  @Get('featured')
  async findFeatured() {
    return await this.partsService.findFeatured();
  }

  @Get('low-stock')
  async findLowStock() {
    return await this.partsService.findLowStock();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return await this.partsService.search(query);
  }

  @Get('by-category/:categoryId')
  async findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return await this.partsService.findByCategory(categoryId);
  }

  @Get('by-manufacturer/:manufacturerId')
  async findByManufacturer(@Param('manufacturerId', ParseUUIDPipe) manufacturerId: string) {
    return await this.partsService.findByManufacturer(manufacturerId);
  }

  @Get('by-tags')
  async findByTags(@Query('tags') tags: string) {
    if (!tags) {
      return [];
    }
    const tagArray = tags.split(',').map(tag => tag.trim());
    return await this.partsService.findByTags(tagArray);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return await this.partsService.update(id, updatePartDto);
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return await this.partsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.partsService.remove(id);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.partsService.restore(id);
  }
}
