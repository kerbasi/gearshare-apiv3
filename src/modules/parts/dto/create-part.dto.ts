import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, IsNumber, IsArray, IsBoolean, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartDto {
  @IsString({ message: 'Part number must be a string' })
  @IsNotEmpty({ message: 'Part number is required' })
  @MaxLength(100, { message: 'Part number must not exceed 100 characters' })
  partNumber: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsUUID(4, { message: 'Manufacturer ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Manufacturer ID is required' })
  manufacturerId: string;

  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with max 2 decimal places' })
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cost must be a number with max 2 decimal places' })
  @Min(0, { message: 'Cost must be a positive number' })
  cost?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Weight must be a number with max 3 decimal places' })
  @Min(0, { message: 'Weight must be a positive number' })
  weight?: number;

  @IsOptional()
  @IsObject({ message: 'Dimensions must be an object' })
  dimensions?: Record<string, any>;

  @IsOptional()
  @IsObject({ message: 'Specifications must be an object' })
  specifications?: Record<string, any>;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string URL' })
  images?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Stock quantity must be a number' })
  @Min(0, { message: 'Stock quantity must be a non-negative number' })
  stockQuantity?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum stock level must be a number' })
  @Min(0, { message: 'Minimum stock level must be a non-negative number' })
  minStockLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum stock level must be a number' })
  @Min(0, { message: 'Maximum stock level must be a non-negative number' })
  maxStockLevel?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is featured must be a boolean value' })
  isFeatured?: boolean;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsUUID(4, { message: 'Created by ID must be a valid UUID' })
  createdById?: string;
}
