import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, IsUrl, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ 
    description: 'Category name', 
    example: 'Engine Parts',
    maxLength: 255
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({ 
    description: 'Category description', 
    example: 'All engine-related auto parts',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ 
    description: 'Parent category ID for hierarchical structure', 
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: 'Parent ID must be a valid UUID' })
  parentId?: string;

  @ApiProperty({ 
    description: 'URL-friendly category identifier', 
    example: 'engine-parts',
    maxLength: 255
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  slug: string;

  @ApiProperty({ 
    description: 'Category image URL', 
    example: 'https://example.com/images/engine-parts.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @ApiProperty({ 
    description: 'Sort order for category display', 
    example: 1,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order must be a non-negative number' })
  sortOrder?: number;
}
