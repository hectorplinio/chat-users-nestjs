import { User } from './user.model';

export const userResponse = (user: User): User => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
};

export const userResponseExample = [
  {
    id: 'uuid1',
    email: 'user1@example.com',
    name: 'User One',
    isActive: true,
  },
  {
    id: 'uuid2',
    email: 'user2@example.com',
    name: 'User Two',
    isActive: true,
  },
];
