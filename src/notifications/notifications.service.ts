import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from './notification.model';

@Injectable()
export class NotificationsService {
  private notifications = [];

  createNotification(userId: string, messageId: string, content: string) {
    const notification = {
      id: uuidv4(),
      userId,
      messageId,
      content,
      timestamp: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }

  getNotificationsByUserId(userId: string): Notification[] {
    return this.notifications.filter(
      (notification) => notification.userId === userId,
    );
  }
}
