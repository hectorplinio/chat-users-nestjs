import {
  Body,
  ConflictException,
  Controller,
  Get,
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
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateUserDto, updateUserSchema } from './update-user.dto';
import { AuthUserDto, authUserSchema } from '../auth/auth-users.dto';
import { AuthService } from '../auth/auth.service';
import { UpdateUserStatusDto } from './update-user-status.dto';
import { userResponseExample } from './user.response';

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
      example: userResponseExample[0],
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
  async create(
    @Body(new YupValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    try {
      const userCreated = await this.usersService.create(createUserDto);

      return userCreated;
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
      example: userResponseExample[0],
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
  async update(
    @Param('id') id: string,
    @Body(new YupValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
    @Body(new YupValidationPipe(authUserSchema)) authUserDto: AuthUserDto,
  ) {
    try {
      this.authService.validateAndLogin({
        id: id,
        ...authUserDto,
      });
      const updatedUser = await this.usersService.update(id, updateUserDto);

      return updatedUser;
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

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve user data' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    schema: { type: 'string', example: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    schema: {
      example: userResponseExample[0],
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
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOneBy({ id });

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    schema: { type: 'string', example: 'uuid' },
  })
  @ApiBody({
    description: 'Update user status',
    schema: {
      example: {
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    schema: {
      example: userResponseExample[0],
    },
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    try {
      const updatedUser = await this.usersService.updateStatus(
        id,
        updateUserStatusDto.isActive,
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all active users' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    schema: {
      example: userResponseExample,
    },
  })
  async getAllActiveUsers() {
    const users = await this.usersService.findAllActive();

    return users;
  }
}
