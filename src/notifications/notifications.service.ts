import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationsRepository: Repository<NotificationEntity>,
    private readonly usersService: UsersService,
  ) {}
  async createNotification(userId: string, messageId: string, content: string) {
    const notification = {
      id: uuidv4(),
      user_id: userId,
      message_id: messageId,
      content,
      timestamp: new Date().toISOString(),
    };

    const createdNotification =
      await this.notificationsRepository.save(notification);
    return createdNotification;
  }

  async getNotificationsByUserId(userId: string) {
    const user = await this.usersService.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const filteredNotificationsByUserId =
      await this.notificationsRepository.find({
        where: { user_id: user.id },
      });

    return filteredNotificationsByUserId;
  }
}
