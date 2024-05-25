import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './create-message.dto';
import { Message } from './message.model';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  create(createMessageDto: CreateMessageDto): Message {
    const user = this.usersService.findOneById(createMessageDto.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ConflictException('User is not active');
    }

    const message: Message = {
      id: uuidv4(),
      userId: createMessageDto.userId,
      content: createMessageDto.content,
      timestamp: new Date(),
    };

    this.messages.push(message);

    this.notificationsService.createNotification(
      createMessageDto.userId,
      message.id,
      `New message from user ${createMessageDto.userId}: ${createMessageDto.content}`,
    );

    return message;
  }

  findAllByUserId(userId: string) {
    const user = this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.messages.filter((message) => message.userId === userId);
  }
}
