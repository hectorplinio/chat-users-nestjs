import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('MessagesService', () => {
  let service: MessagesService;
  let usersService: UsersService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    usersService = module.get<UsersService>(UsersService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    (uuidv4 as jest.Mock).mockReturnValue('uuid');
    jest.useFakeTimers().setSystemTime(new Date('2024-05-25T12:42:19.962Z'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should create a message and a notification', () => {
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

    usersService.findOneById = jest
      .fn()
      .mockReturnValue({ id: 'user-uuid', isActive: true });

    const notificationSpy = jest.spyOn(
      notificationsService,
      'createNotification',
    );

    service.create(createMessageDto);

    expect(notificationSpy).toHaveBeenCalledWith(
      createMessageDto.userId,
      expectedMessage.id,
      `New message from user ${createMessageDto.userId}: ${createMessageDto.content}`,
    );
  });

  it('should throw NotFoundException if user not found', () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'nonexistent-user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneById = jest.fn().mockReturnValue(null);

    expect(() => service.create(createMessageDto)).toThrow(NotFoundException);
  });

  it('should throw ConflictException if user is not active', () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    usersService.findOneById = jest
      .fn()
      .mockReturnValue({ id: 'user-uuid', isActive: false });

    expect(() => service.create(createMessageDto)).toThrow(ConflictException);
  });
});
