import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './create-message.dto';

describe('MessagesService', () => {
  let service: MessagesService;
  let usersService: UsersService;

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
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a message if user exists', () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'user-uuid',
      content: 'This is a test message',
    };

    jest.spyOn(usersService, 'findOneById').mockReturnValue({
      id: 'user-uuid',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
    });

    const message = service.create(createMessageDto);

    expect(message).toHaveProperty('id');
    expect(message.userId).toBe(createMessageDto.userId);
    expect(message.content).toBe(createMessageDto.content);
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  it('should throw NotFoundException if user does not exist', () => {
    const createMessageDto: CreateMessageDto = {
      userId: 'nonexistent-user-uuid',
      content: 'This is a test message',
    };

    jest.spyOn(usersService, 'findOneById').mockImplementation(() => {
      throw new NotFoundException('User not found');
    });

    expect(() => service.create(createMessageDto)).toThrow(NotFoundException);
  });
});
