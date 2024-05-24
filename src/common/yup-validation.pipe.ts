import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'yup';

@Injectable()
export class YupValidationPipe<T> implements PipeTransform {
  constructor(private schema: ObjectSchema<T>) {}

  async transform(value: T) {
    try {
      await this.schema.validate(value, { abortEarly: false });
      return value;
    } catch (err) {
      throw new BadRequestException(err.errors);
    }
  }
}
