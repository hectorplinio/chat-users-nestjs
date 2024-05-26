import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './create-users.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './update-user.dto';
import { User } from './user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { userResponse } from './user.response';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersRepository.save({
      ...createUserDto,
      id: uuidv4(),
      isActive: true,
    });

    return userResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.preload({ id, ...updateUserDto });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userUpdated = await this.usersRepository.save(user);

    return userResponse(userUpdated);
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;
    const userUpdated = await this.usersRepository.save(user);

    return userResponse(userUpdated);
  }

  async findOneBy(options: { id?: string; email?: string }): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: options,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return userResponse(user);
  }

  async findAllActive(): Promise<User[]> {
    const findAllUsers = await this.usersRepository.find({
      where: { isActive: true },
    });

    const findAllUsersResponse = findAllUsers.map((user) => userResponse(user));

    return findAllUsersResponse;
  }
}
