import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const user = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  isActive: true,
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let usersService: UsersService;
  let notificationsRepository: Repository<NotificationEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: UsersService,
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NotificationEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    usersService = module.get<UsersService>(UsersService);
    notificationsRepository = module.get<Repository<NotificationEntity>>(
      getRepositoryToken(NotificationEntity),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a notification', async () => {
    const userId = 'user-uuid';
    const messageId = 'message-uuid';
    const content = 'This is a notification';
    const createdAt = new Date();

    (uuidv4 as jest.Mock).mockReturnValue('uuid');
    jest.spyOn(notificationsRepository, 'save').mockResolvedValue({
      id: 'uuid',
      user_id: userId,
      message_id: messageId,
      content,
      timestamp: createdAt,
    });

    const notification = await service.createNotification(
      userId,
      messageId,
      content,
    );

    expect(notification).toHaveProperty('id', 'uuid');
    expect(notification).toHaveProperty('user_id', userId);
    expect(notification).toHaveProperty('message_id', messageId);
    expect(notification).toHaveProperty('content', content);
    expect(notification).toHaveProperty('timestamp', createdAt);
  });

  it('should return notifications by userId', async () => {
    const userId = 'user-uuid';
    const notifications = [
      {
        id: 'uuid1',
        user_id: userId,
        message_id: 'message-uuid1',
        content: 'This is a notification 1',
        timestamp: new Date(),
      },
      {
        id: 'uuid2',
        user_id: userId,
        message_id: 'message-uuid2',
        content: 'This is a notification 2',
        timestamp: new Date(),
      },
    ];

    jest.spyOn(usersService, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(notificationsRepository, 'find')
      .mockResolvedValue(notifications);

    const result = await service.getNotificationsByUserId(userId);

    expect(result).toHaveLength(2);
    expect(result).toEqual(notifications);
  });

  it('should throw NotFoundException if user not found', async () => {
    const userId = 'nonexistent-user-uuid';

    jest.spyOn(usersService, 'findOneBy').mockResolvedValue(null);

    await expect(service.getNotificationsByUserId(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return an empty array if no notifications for userId', async () => {
    const userId = 'user-uuid';

    jest.spyOn(usersService, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(notificationsRepository, 'find').mockResolvedValue([]);

    const result = await service.getNotificationsByUserId(userId);

    expect(result).toHaveLength(0);
  });
});
