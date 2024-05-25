import { boolean, InferType, object } from 'yup';

export const UpdateUserStatusDto = object({
  isActive: boolean().required(),
});

export type UpdateUserStatusDto = InferType<typeof UpdateUserStatusDto>;
