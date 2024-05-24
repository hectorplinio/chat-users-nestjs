import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-users.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = service.create(createUserDto);

    expect(user).toHaveProperty('id');
    expect(user.email).toBe(createUserDto.email);
    expect(user.password).toBe(createUserDto.password);
    expect(user.name).toBe(createUserDto.name);
  });

  it('should not create a user with an existing email', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    service.create(createUserDto);

    expect(() => service.create(createUserDto)).toThrow(ConflictException);
  });
});
