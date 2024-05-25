import { Controller, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Retrieve notifications for a user' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User ID',
    schema: { type: 'string', example: 'user-uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    schema: {
      example: [
        {
          id: 'uuid',
          userId: 'user-uuid',
          messageId: 'message-uuid',
          content: 'This is a notification',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      ],
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
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationsByUserId(userId);
  }
}
