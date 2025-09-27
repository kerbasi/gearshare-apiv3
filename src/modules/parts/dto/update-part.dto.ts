import { PartialType } from '@nestjs/mapped-types';
import { CreatePartDto } from './create-part.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePartDto extends PartialType(CreatePartDto) {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
