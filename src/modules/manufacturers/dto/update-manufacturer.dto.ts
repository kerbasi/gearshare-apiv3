import { PartialType } from '@nestjs/mapped-types';
import { CreateManufacturerDto } from './create-manufacturer.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateManufacturerDto extends PartialType(CreateManufacturerDto) {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
