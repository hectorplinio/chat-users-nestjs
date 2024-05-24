import { Body, ConflictException, Controller, Post } from '@nestjs/common';

import { UsersService } from './users.service';
import { YupValidationPipe } from '../common/yup-validation.pipe';
import { CreateUserDto, createUserSchema } from './create-users.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'pepe@gmail.com' },
        name: { type: 'string', example: 'Pepe' },
        password: { type: 'string', example: 'password' },
      },
      required: ['email', 'name', 'password'],
    },
  })
  @ApiCreatedResponse({
    description: 'Created',
    schema: {
      example: {
        email: 'pepe@gmail.com',
        name: 'Pepe',
        password: 'password',
        id: '3fee104a-d950-437d-b8dc-250e51ee5c92',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  create(
    @Body(new YupValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    try {
      return this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
