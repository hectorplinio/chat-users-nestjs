import { BadRequestException } from '@nestjs/common';
import { YupValidationPipe } from './yup-validation.pipe';
import * as Yup from 'yup';

describe('YupValidationPipe', () => {
  let pipe: YupValidationPipe<{ email: string; password: string }>;
  let schema: Yup.ObjectSchema<{ email: string; password: string }>;
  beforeEach(() => {
    schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });
    pipe = new YupValidationPipe(schema);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should validate and return the value if valid', async () => {
    const validValue = { email: 'test@example.com', password: 'password123' };
    await expect(pipe.transform(validValue)).resolves.toEqual(validValue);
  });

  it('should throw BadRequestException if validation fails', async () => {
    const invalidValue = { email: 'invalid-email', password: '' };
    await expect(pipe.transform(invalidValue)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException with appropriate error messages', async () => {
    const invalidValue = { email: 'invalid-email', password: '' };
    try {
      await pipe.transform(invalidValue);
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.response).toEqual({
        statusCode: 400,
        message: [
          'email must be a valid email',
          'password is a required field',
        ],
        error: 'Bad Request',
      });
    }
  });
});
