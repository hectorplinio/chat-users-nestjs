import { InferType, object, string } from 'yup';

export const createUserSchema = object({
  email: string().email().required(),
  password: string().required(),
  name: string().required(),
});

export type CreateUserDto = InferType<typeof createUserSchema>;
