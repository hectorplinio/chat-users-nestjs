import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto, createMessageSchema } from './create-message.dto';
import { YupValidationPipe } from '../common/yup-validation.pipe';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '1' },
        content: { type: 'string', example: 'Morning' },
      },
      required: ['userId', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created',
    schema: {
      example: {
        id: 'uuid',
        userId: 'user-uuid',
        content: 'This is a message',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async create(
    @Body(new YupValidationPipe(createMessageSchema))
    createMessageDto: CreateMessageDto,
  ) {
    try {
      const createdMessage = this.messagesService.create(createMessageDto);

      return createdMessage;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User not found');
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User is not active');
      }
      throw error;
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all messages for a user' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User ID',
    schema: { type: 'string', example: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    schema: {
      example: [
        {
          id: 'uuid',
          userId: 'user-uuid',
          content: 'This is a message',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'User is not active',
    schema: {
      example: {
        statusCode: 403,
        message: 'User is not active',
        error: 'Forbidden',
      },
    },
  })
  async findAllByUserId(@Param('userId') userId: string) {
    const messagesFiltetedByUserId =
      await this.messagesService.findAllByUserId(userId);

    if (!messagesFiltetedByUserId) {
      throw new ForbiddenException('User is not active');
    }
    return messagesFiltetedByUserId;
  }
}
