import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a notification', () => {
    const userId = 'user-uuid';
    const messageId = 'message-uuid';
    const content = 'This is a notification';

    const notification = service.createNotification(userId, messageId, content);

    expect(notification).toHaveProperty('id');
    expect(notification.userId).toBe(userId);
    expect(notification.messageId).toBe(messageId);
    expect(notification.content).toBe(content);
    expect(notification).toHaveProperty('timestamp');
  });

  it('should return notifications by userId', () => {
    const userId = 'user-uuid';
    const messageId = 'message-uuid';
    const content = 'This is a notification';

    const notification1 = service.createNotification(
      userId,
      messageId,
      content,
    );
    const notification2 = service.createNotification(
      userId,
      'another-message-uuid',
      'Another notification',
    );
    const notification3 = service.createNotification(
      'another-user-uuid',
      'different-message-uuid',
      'Different user notification',
    );

    const notifications = service.getNotificationsByUserId(userId);

    expect(notifications).toHaveLength(2);
    expect(notifications).toContainEqual(notification1);
    expect(notifications).toContainEqual(notification2);
    expect(notifications).not.toContainEqual(notification3);
  });

  it('should return an empty array if no notifications for userId', () => {
    const notifications = service.getNotificationsByUserId(
      'nonexistent-user-uuid',
    );
    expect(notifications).toHaveLength(0);
  });
});
