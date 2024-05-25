import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

describe('UsersController', () => {
  let app: INestApplication;
  const usersService = {
    create: jest.fn(),
    update: jest.fn(),
    findOneById: jest.fn(),
    findOneByEmail: jest.fn(),
    updateStatus: jest.fn(),
    findAllActive: jest.fn(),
  };
  const authService = { validateAndLogin: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('/users (POST)', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };
    usersService.create.mockReturnValue({ ...createUserDto, id: 'uuid' });

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
  });

  it('should return 409 if email already exists', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };
    usersService.create.mockImplementation(() => {
      throw new ConflictException('Email already exists');
    });

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toBe('Email already exists');
      });
  });
  it('should throw an error if an unexpected error occurs', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };
    usersService.create.mockImplementation(() => {
      throw new InternalServerErrorException('Unexpected error');
    });

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Unexpected error');
      });
  });

  it('/users/:id (PUT) should update user data', async () => {
    const updateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'uuid';

    authService.validateAndLogin.mockReturnValue({ access_token: 'jwt-token' });
    usersService.update.mockReturnValue({ ...updateUserDto, id: userId });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(200);
  });

  it('/users/:id (PUT) should return 401 if credentials are invalid', async () => {
    const updateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    const userId = 'uuid';

    authService.validateAndLogin.mockImplementation(() => {
      throw new UnauthorizedException('Invalid credentials');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(401);
  });

  it('/users/:id (PUT) should return 404 if user not found', async () => {
    const updateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'nonexistent-uuid';

    usersService.update.mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(404);
  });

  it('/users/:id (PUT) should throw an error if an unexpected error occurs', async () => {
    const updateUserDto = {
      email: 'updated@example.com',
      name: 'Updated User',
      password: 'newpassword123',
    };
    const authUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const userId = 'uuid';

    usersService.update.mockImplementation(() => {
      throw new InternalServerErrorException('Internal server error');
    });

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({ ...updateUserDto, ...authUserDto })
      .expect(500);
  });

  it('/users/:id (GET) should return user data', async () => {
    const userId = 'uuid';
    const user = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
    };

    usersService.findOneById.mockReturnValue(user);

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(user);
      });
  });

  it('/users/:id (GET) should return 404 if user not found', async () => {
    const userId = 'nonexistent-uuid';

    usersService.findOneById.mockImplementation(() => {
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
    const updateUserStatusDto = {
      isActive: true,
    };
    const userId = 'uuid';

    usersService.updateStatus.mockReturnValue({
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
    const updateUserStatusDto = {
      isActive: true,
    };
    const userId = 'nonexistent-uuid';

    usersService.updateStatus.mockImplementation(() => {
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

    usersService.findAllActive.mockReturnValue(activeUsers);

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
