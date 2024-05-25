import { InferType, object, string } from 'yup';

export const authUserSchema = object({
  email: string().email().required(),
  password: string().required(),
  id: string().optional(),
});

export type AuthUserDto = InferType<typeof authUserSchema>;

export interface LoginResponse {
  access_token: string;
}
