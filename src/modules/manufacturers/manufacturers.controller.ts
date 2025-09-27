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
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Manufacturers')
@Controller('manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new manufacturer' })
  @ApiResponse({ status: 201, description: 'Manufacturer successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() createManufacturerDto: CreateManufacturerDto) {
    return await this.manufacturersService.create(createManufacturerDto);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all manufacturers (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'All manufacturers retrieved successfully' })
  async findAll() {
    return await this.manufacturersService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active manufacturers (Public)' })
  @ApiResponse({ status: 200, description: 'Active manufacturers retrieved successfully' })
  async findActive() {
    return await this.manufacturersService.findActive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get manufacturer by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Manufacturer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Manufacturer not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.manufacturersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update manufacturer (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Manufacturer updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Manufacturer not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ) {
    return await this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete manufacturer (Admin only)' })
  @ApiResponse({ status: 204, description: 'Manufacturer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Manufacturer not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.manufacturersService.remove(id);
  }

  @Patch(':id/soft-delete')
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete manufacturer (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Manufacturer soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Manufacturer not found' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.manufacturersService.softDelete(id);
  }
}
