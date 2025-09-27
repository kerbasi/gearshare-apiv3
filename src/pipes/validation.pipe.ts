import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = this.buildErrorMessages(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
        statusCode: 400,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private buildErrorMessages(errors: any[]): string[] {
    const errorMessages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          errorMessages.push(message as string);
        });
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.buildErrorMessages(error.children);
        errorMessages.push(...nestedErrors);
      }
    });

    return errorMessages;
  }
}
