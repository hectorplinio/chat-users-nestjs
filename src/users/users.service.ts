import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './create-users.dto';
import { v4 as uuidv4 } from 'uuid';

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

  findOneByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }
}
