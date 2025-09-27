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
} from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createManufacturerDto: CreateManufacturerDto) {
    return await this.manufacturersService.create(createManufacturerDto);
  }

  @Get()
  async findAll() {
    return await this.manufacturersService.findAll();
  }

  @Get('active')
  async findActive() {
    return await this.manufacturersService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.manufacturersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ) {
    return await this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.manufacturersService.remove(id);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.manufacturersService.softDelete(id);
  }
}
