import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './message.entity';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('MessagesService', () => {
  let service: MessagesService;
  let usersService: UsersService;
  let notificationsService: NotificationsService;
  let messagesRepository: Repository<MessageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: UsersService,
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MessageEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    usersService = module.get<UsersService>(UsersService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    messagesRepository = module.get<Repository<MessageEntity>>(
      getRepositoryToken(MessageEntity),
    );

    (uuidv4 as jest.Mock).mockReturnValue('uuid');
    jest.useFakeTimers().setSystemTime(new Date('2024-05-25T12:42:19.962Z'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should create a message and a notification', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    const expectedMessage = {
      id: 'uuid',
      userId: createMessageDto.userId,
      content: createMessageDto.content,
      timestamp: new Date('2024-05-25T12:42:19.962Z').toISOString(),
    };

    usersService.findOneBy = jest
      .fn()
      .mockResolvedValue({ id: 'user-uuid', isActive: true });

    const notificationSpy = jest.spyOn(
      notificationsService,
      'createNotification',
    );

    messagesRepository.save = jest.fn().mockResolvedValue(expectedMessage);

    const message = await service.create(createMessageDto);

    expect(message).toEqual(expectedMessage);
    expect(notificationSpy).toHaveBeenCalledWith(
      createMessageDto.userId,
      expectedMessage.id,
      `New message from user ${createMessageDto.userId}: ${createMessageDto.content}`,
    );
  });

  it('should throw NotFoundException if user not found', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'nonexistent-user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.create(createMessageDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ConflictException if user is not active', async () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneBy = jest
      .fn()
      .mockResolvedValue({ id: 'user-uuid', isActive: false });

    await expect(service.create(createMessageDto)).rejects.toThrow(
      ConflictException,
    );
  });
});
