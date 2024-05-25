import { InferType, object, string } from 'yup';

export const updateUserSchema = object({
  email: string().email().required(),
  password: string().required(),
  name: string().required(),
});

export type UpdateUserDto = InferType<typeof updateUserSchema>;
