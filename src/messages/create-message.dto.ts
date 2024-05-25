import { InferType, object, string } from 'yup';

export const createMessageSchema = object({
  userId: string().required(),
  content: string().required(),
});

export type CreateMessageDto = InferType<typeof createMessageSchema>;
