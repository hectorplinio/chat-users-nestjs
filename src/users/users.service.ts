import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './create-users.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  private readonly users = [];

  create(createUserDto: CreateUserDto) {
    const userExists = this.users.some(
      (user) => user.email === createUserDto.email,
    );
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const user = { ...createUserDto, id: uuidv4() };
    this.users.push(user);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      id: this.users[userIndex].id,
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  findOneByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  findOneById(id: string) {
    return this.users.find((user) => user.id === id);
  }
}
