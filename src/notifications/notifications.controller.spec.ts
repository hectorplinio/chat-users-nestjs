import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import * as request from 'supertest';
import { INestApplication, NotFoundException } from '@nestjs/common';

describe('NotificationsController', () => {
  let app: INestApplication;
  const notificationsService = { getNotificationsByUserId: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('/notifications/:userId (GET) should return notifications for a user', async () => {
    const userId = 'user-uuid';
    const notifications = [
      {
        id: 'uuid',
        userId: 'user-uuid',
        messageId: 'message-uuid',
        content: 'This is a notification',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    ];

    notificationsService.getNotificationsByUserId.mockReturnValue(
      notifications,
    );

    const response = await request(app.getHttpServer())
      .get(`/notifications/${userId}`)
      .expect(200);

    expect(response.body).toEqual(notifications);
    expect(notificationsService.getNotificationsByUserId).toHaveBeenCalledWith(
      userId,
    );
  });

  it('/notifications/:userId (GET) should return 404 if user not found', async () => {
    const userId = 'nonexistent-user-uuid';

    jest
      .spyOn(notificationsService, 'getNotificationsByUserId')
      .mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

    const response = await request(app.getHttpServer())
      .get(`/notifications/${userId}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
    expect(notificationsService.getNotificationsByUserId).toHaveBeenCalledWith(
      userId,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
