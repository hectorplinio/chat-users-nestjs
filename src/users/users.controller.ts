import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { YupValidationPipe } from '../common/yup-validation.pipe';
import { CreateUserDto, createUserSchema } from './create-users.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateUserDto, updateUserSchema } from './update-user.dto';
import { AuthUserDto, authUserSchema } from '../auth/auth-users.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

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

  @Put(':id')
  @ApiOperation({ summary: 'Update user data' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    schema: { type: 'string', example: 'uuid' },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'Updated User Name' },
        password: { type: 'string', example: 'newpassword123' },
      },
      required: ['email', 'name', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    schema: {
      example: {
        email: 'user@example.com',
        name: 'Updated User Name',
        password: 'newpassword123',
        id: 'uuid',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body(new YupValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
    @Body(new YupValidationPipe(authUserSchema)) authUserDto: AuthUserDto,
  ) {
    try {
      this.authService.validateAndLogin({
        id: id,
        ...authUserDto,
      });
      const updatedUser = this.usersService.update(id, updateUserDto);

      return { ...updatedUser };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }
}
