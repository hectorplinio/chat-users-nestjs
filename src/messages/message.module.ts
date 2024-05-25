import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [UsersModule],
  providers: [MessagesService, NotificationsService],
  controllers: [MessagesController],
})
export class MessagesModule {}
