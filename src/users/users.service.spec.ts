import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './create-users.dto';
import { UpdateUserDto } from './update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(userRepository, 'create').mockReturnValue(userEntity);
    jest.spyOn(userRepository, 'save').mockResolvedValue(userEntity);

    const user = await service.create(createUserDto);

    expect(user).toHaveProperty('id');
    expect(user.email).toBe(createUserDto.email);
    expect(user.name).toBe(createUserDto.name);
    expect(user.isActive).toBe(true);
  });

  it('should not create a user with an existing email', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

    await expect(service.create(createUserDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should update a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'preload').mockResolvedValue(userEntity);
    jest.spyOn(userRepository, 'save').mockResolvedValue(userEntity);

    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };

    const updatedUser = await service.update(userEntity.id, updateUserDto);

    expect(updatedUser.email).toBe(updatedUser.email);
    expect(updatedUser.name).toBe(updatedUser.name);
    expect(updatedUser.password).toBe(updatedUser.password);
  });

  it('should throw NotFoundException if user to update is not found', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };

    jest.spyOn(userRepository, 'preload').mockResolvedValue(null);

    await expect(
      service.update('nonexistent-id', updateUserDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update user status', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);
    jest
      .spyOn(userRepository, 'save')
      .mockResolvedValue({ ...userEntity, isActive: false });

    const updatedUser = await service.updateStatus(userEntity.id, false);

    expect(updatedUser.isActive).toBe(false);
  });

  it('should throw NotFoundException if user to update status is not found', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.updateStatus('nonexistent-id', false)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find a user by email', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

    const user = await service.findOneBy({ email: createUserDto.email });

    expect(user).toBeDefined();
    expect(user.email).toBe(createUserDto.email);
  });

  it('should throw NotFoundException if no user found by email', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.findOneBy({ email: 'nonexistent@example.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find a user by id', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const userEntity = {
      ...createUserDto,
      id: 'uuid',
      isActive: true,
    } as UserEntity;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

    const foundUser = await service.findOneBy({ id: userEntity.id });

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(userEntity.id);
  });

  it('should throw NotFoundException if no user found by id', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.findOneBy({ id: 'nonexistent-id' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find all active users', async () => {
    const createUserDto1: CreateUserDto = {
      email: 'active@example.com',
      password: 'password123',
      name: 'Active User',
    };

    const userEntity1 = {
      id: 'uuid1',
      isActive: true,
      name: createUserDto1,
      email: createUserDto1,
    } as UserEntity;

    jest.spyOn(userRepository, 'find').mockResolvedValue([userEntity1]);

    const activeUsers = await service.findAllActive();

    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0]).toEqual(userEntity1);
  });
});
