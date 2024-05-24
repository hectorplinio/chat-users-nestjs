import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  InternalServerErrorException,
} from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let app: INestApplication;
  const usersService = { create: jest.fn(), findAll: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

  afterAll(async () => {
    await app.close();
  });
});
