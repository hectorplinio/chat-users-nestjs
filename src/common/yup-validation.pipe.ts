import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema<any>) {}

  async transform(value: any) {
    try {
      await this.schema.validate(value, { abortEarly: false });
      return value;
    } catch (err) {
      throw new BadRequestException(err.errors);
    }
  }
}
