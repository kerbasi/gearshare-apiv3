import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateManufacturerDto {
  @ApiProperty({ 
    description: 'Manufacturer name', 
    example: 'Bosch',
    maxLength: 255
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({ 
    description: 'Manufacturer country', 
    example: 'Germany',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @ApiProperty({ 
    description: 'Manufacturer website URL', 
    example: 'https://www.bosch.com',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiProperty({ 
    description: 'Contact email address', 
    example: 'contact@bosch.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Contact email must be a valid email address' })
  contactEmail?: string;

  @ApiProperty({ 
    description: 'Contact phone number', 
    example: '+49 711 811-0',
    maxLength: 20,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  @MaxLength(20, { message: 'Contact phone must not exceed 20 characters' })
  contactPhone?: string;

  @ApiProperty({ 
    description: 'Manufacturer logo URL', 
    example: 'https://www.bosch.com/logo.png',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoUrl?: string;

  @ApiProperty({ 
    description: 'Manufacturer description', 
    example: 'German multinational engineering and technology company',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
