import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './create-users.dto';
import { UpdateUserDto } from './update-user.dto';
import { AuthUserDto } from '../auth/auth-users.dto';
import { UpdateUserStatusDto } from './update-user-status.dto';

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
            updateStatus: jest.fn(),
            findAllActive: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateAndLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('/users (POST) should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    usersService.create = jest.fn().mockResolvedValue({
      ...createUserDto,
      id: 'uuid',
    });

    await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(createUserDto.email);
        expect(res.body.name).toBe(createUserDto.name);
      });
  });

  it('/users (POST) should return 409 if email already exists', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    usersService.create = jest
      .fn()
      .mockRejectedValue(new ConflictException('Email already exists'));

    await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toBe('Email already exists');
      });
  });

  it('/users/:id (PUT) should update user data', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto: AuthUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'uuid';

    authService.validateAndLogin = jest
      .fn()
      .mockReturnValue({ access_token: 'jwt-token' });
    usersService.update = jest
      .fn()
      .mockResolvedValue({ ...updateUserDto, id: userId });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('updated@example.com');
        expect(res.body.name).toBe('Updated User');
        expect(res.body.password).toBe('newpassword123');
      });
  });

  it('/users/:id (PUT) should return 401 if credentials are invalid', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto: AuthUserDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    const userId = 'uuid';

    authService.validateAndLogin = jest.fn().mockImplementation(() => {
      throw new UnauthorizedException('Invalid credentials');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid credentials');
      });
  });

  it('/users/:id (PUT) should return 404 if user not found', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto: AuthUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'nonexistent-uuid';

    usersService.update = jest.fn().mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });
  });

  it('/users/:id (PUT) should throw an error if an unexpected error occurs', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto: AuthUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'uuid';

    usersService.update = jest.fn().mockImplementation(() => {
      throw new InternalServerErrorException('Internal server error');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Internal server error');
      });
  });

  it('/users/:id (GET) should return user data', async () => {
    const userId = 'uuid';
    const user = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
    };

    usersService.findOneBy = jest.fn().mockResolvedValue(user);

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(user);
      });
  });

  it('/users/:id (GET) should return 404 if user not found', async () => {
    const userId = 'nonexistent-uuid';

    usersService.findOneBy = jest.fn().mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });
  });

  it('/users/:id/status (PUT) should update user status', async () => {
    const updateUserStatusDto: UpdateUserStatusDto = {
      isActive: true,
    };
    const userId = 'uuid';

    usersService.updateStatus = jest.fn().mockResolvedValue({
      id: userId,
      email: 'user@example.com',
      name: 'User Name',
      isActive: true,
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}/status`)
      .send(updateUserStatusDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(userId);
        expect(res.body.email).toBe('user@example.com');
        expect(res.body.name).toBe('User Name');
        expect(res.body.isActive).toBe(true);
      });
  });

  it('/users/:id/status (PUT) should return 404 if user not found', async () => {
    const updateUserStatusDto: UpdateUserStatusDto = {
      isActive: true,
    };
    const userId = 'nonexistent-uuid';

    usersService.updateStatus = jest.fn().mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}/status`)
      .send(updateUserStatusDto)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });
  });

  it('/users (GET) should return all active users', async () => {
    const activeUsers = [
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

    usersService.findAllActive = jest.fn().mockResolvedValue(activeUsers);

    await request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(activeUsers);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
