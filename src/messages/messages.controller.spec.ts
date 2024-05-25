import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './create-message.dto';
import { UsersService } from '../users/users.service';

describe('MessagesController', () => {
  let app: INestApplication;
  const messagesService = { create: jest.fn() };
  const usersService = { findOneById: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: messagesService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('POST /messages should create a new message', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    const expectedMessage = {
      id: 'uuid',
      userId: createMessageDto.userId,
      content: createMessageDto.content,
      timestamp: new Date().toISOString(),
    };

    usersService.findOneById.mockReturnValue({
      id: 'user-uuid',
      isActive: true,
    });
    messagesService.create.mockReturnValue(expectedMessage);

    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .expect(201);

    expect(response.body).toEqual(expectedMessage);
    expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
  });

  it('POST /messages should return 404 if user not found', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'nonexistent-user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneById.mockReturnValue(null);
    messagesService.create.mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
    expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
  });

  it('POST /messages should return 409 if user is not active', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneById.mockReturnValue({
      id: 'user-uuid',
      isActive: false,
    });
    messagesService.create.mockImplementation(() => {
      throw new ConflictException('User is not active');
    });

    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      message: 'User is not active',
      error: 'Conflict',
    });
    expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
  });

  afterAll(async () => {
    await app.close();
  });
});
