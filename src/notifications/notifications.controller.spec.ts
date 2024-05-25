import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('NotificationsController', () => {
  let app: INestApplication;
  let notificationsService: NotificationsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            getNotificationsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    notificationsService =
      moduleFixture.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('/notifications/:userId (GET) should return notifications for a user', () => {
    const userId = 'user-uuid';
    const notifications = [
      {
        id: 'uuid',
        userId: 'user-uuid',
        messageId: 'message-uuid',
        content: 'This is a notification',
        timestamp: new Date('2023-01-01T00:00:00.000Z'),
      },
    ];

    jest
      .spyOn(notificationsService, 'getNotificationsByUserId')
      .mockReturnValue(notifications);

    return request(app.getHttpServer())
      .get(`/notifications/${userId}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
