import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'john.doe@example.com' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    description: 'Unique username', 
    example: 'johndoe',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' })
  username: string;

  @ApiProperty({ 
    description: 'User password (must contain uppercase, lowercase, number, and special character)', 
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ 
    description: 'User first name', 
    example: 'John',
    maxLength: 100
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @ApiProperty({ 
    description: 'User last name', 
    example: 'Doe',
    maxLength: 100
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @ApiProperty({ 
    description: 'Confirm password (must match password)', 
    example: 'SecurePass123!'
  })
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
