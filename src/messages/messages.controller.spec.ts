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

describe('MessagesController', () => {
  let app: INestApplication;
  const messagesService = { create: jest.fn(), findAllByUserId: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: messagesService,
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

    messagesService.create.mockImplementation(() => {
      throw new NotFoundException('User is not active');
    });

    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User is not active',
      error: 'Not Found',
    });
    expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
  });

  it('POST /messages should return 409 if user is not active', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    messagesService.create.mockImplementation(() => {
      throw new ConflictException('User not found');
    });

    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      message: 'User not found',
      error: 'Conflict',
    });
    expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
  });

  it('GET /messages/:userId should return all messages for a user', async () => {
    const userId = 'user-uuid';
    const messages = [
      {
        id: 'uuid1',
        userId: 'user-uuid',
        content: 'This is a test message 1',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'uuid2',
        userId: 'user-uuid',
        content: 'This is a test message 2',
        timestamp: '2023-01-02T00:00:00.000Z',
      },
    ];

    messagesService.findAllByUserId.mockReturnValue(messages);

    const response = await request(app.getHttpServer())
      .get(`/messages/${userId}`)
      .expect(200);

    expect(response.body).toEqual(messages);
    expect(messagesService.findAllByUserId).toHaveBeenCalledWith(userId);
  });

  it('GET /messages/:userId should return 404 if user not found', async () => {
    const userId = 'nonexistent-user-uuid';

    messagesService.findAllByUserId.mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    const response = await request(app.getHttpServer())
      .get(`/messages/${userId}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
    expect(messagesService.findAllByUserId).toHaveBeenCalledWith(userId);
  });

  afterAll(async () => {
    await app.close();
  });
});
