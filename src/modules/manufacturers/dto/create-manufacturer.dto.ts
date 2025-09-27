import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateManufacturerDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Contact email must be a valid email address' })
  contactEmail?: string;

  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  @MaxLength(20, { message: 'Contact phone must not exceed 20 characters' })
  contactPhone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoUrl?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
