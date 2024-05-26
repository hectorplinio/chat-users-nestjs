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
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { userId: id } = createMessageDto;
    const user = await this.usersService.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ConflictException('User is not active');
    }

    const message: Message = {
      id: uuidv4(),
      user_id: createMessageDto.userId,
      content: createMessageDto.content,
      timestamp: new Date(),
    };

    const savedMessage = await this.messagesRepository.save(message);

    await this.notificationsService.createNotification(
      createMessageDto.userId,
      message.id,
      `New message from user ${createMessageDto.userId}: ${createMessageDto.content}`,
    );

    return savedMessage;
  }

  async findAllByUserId(userId: string) {
    const user = await this.usersService.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const filteredMessagesByUserId = await this.messagesRepository.find({
      where: { user_id: user.id },
    });

    return filteredMessagesByUserId;
  }
}
