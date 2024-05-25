import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-users.dto';
import { UpdateUserDto } from './update-user.dto';

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
    expect(user.isActive).toBe(true);
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

  it('should update a user', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = service.create(createUserDto);

    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };

    const updatedUser = service.update(user.id, updateUserDto);

    expect(updatedUser.email).toBe(updateUserDto.email);
    expect(updatedUser.name).toBe(updateUserDto.name);
    expect(updatedUser.password).toBe(updateUserDto.password);
  });

  it('should throw NotFoundException if user to update is not found', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };

    expect(() => service.update('nonexistent-id', updateUserDto)).toThrow(
      NotFoundException,
    );
  });

  it('should update user status', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = service.create(createUserDto);

    const updatedUser = service.updateStatus(user.id, false);

    expect(updatedUser.isActive).toBe(false);
  });

  it('should throw NotFoundException if user to update status is not found', () => {
    expect(() => service.updateStatus('nonexistent-id', false)).toThrow(
      NotFoundException,
    );
  });

  it('should find a user by email', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    service.create(createUserDto);

    const user = service.findOneByEmail(createUserDto.email);

    expect(user).toBeDefined();
    expect(user.email).toBe(createUserDto.email);
  });

  it('should return undefined if no user found by email', () => {
    const user = service.findOneByEmail('nonexistent@example.com');

    expect(user).toBeUndefined();
  });

  it('should find a user by id', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = service.create(createUserDto);

    const foundUser = service.findOneById(user.id);

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(user.id);
  });

  it('should throw NotFoundException if no user found by id', () => {
    expect(() => service.findOneById('nonexistent-id')).toThrow(
      NotFoundException,
    );
  });

  it('should find all active users', () => {
    const createUserDto1: CreateUserDto = {
      email: 'active@example.com',
      password: 'password123',
      name: 'Active User',
    };

    const createUserDto2: CreateUserDto = {
      email: 'inactive@example.com',
      password: 'password123',
      name: 'Inactive User',
    };

    const user1 = service.create(createUserDto1);
    const user2 = service.create(createUserDto2);

    service.updateStatus(user2.id, false);

    const activeUsers = service.findAllActive();

    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0]).toEqual(user1);
  });
});
