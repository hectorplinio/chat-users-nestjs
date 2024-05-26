import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.model';
import { AuthUserDto, LoginResponse } from './auth-users.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    id?: string,
  ): Promise<User> {
    if (id) {
      const user = await this.usersRepository.findOneBy({ id });
      return user ? user : null;
    }
    const user = await this.usersRepository.findOneBy({ email });
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  login(user: User): LoginResponse {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateAndLogin(authUserDto: AuthUserDto): Promise<User> {
    const user = await this.validateUser(
      authUserDto.email,
      authUserDto.password,
      authUserDto.id,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.login(user);
    return user;
  }
}
