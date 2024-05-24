import { InferType, object, string } from 'yup';

export const authUserSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export type AuthUserDto = InferType<typeof authUserSchema>;
