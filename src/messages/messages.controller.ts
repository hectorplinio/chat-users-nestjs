import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
  create(
    @Body(new YupValidationPipe(createMessageSchema))
    createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.create(createMessageDto);
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
  findAllByUserId(@Param('userId') userId: string) {
    return this.messagesService.findAllByUserId(userId);
  }
}
