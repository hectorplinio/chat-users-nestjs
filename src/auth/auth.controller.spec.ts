import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { AuthUserDto } from './auth-users.dto';
import { User } from 'src/users/user.model';
import { Repository } from 'typeorm';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto: AuthUserDto = {
        email: 'test@example.com',
        password: 'password123',
        id: 'user-id',
      };
      const result = { access_token: 'jwt-token' };

      const user: User = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'pepe',
        isActive: true,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest.spyOn(authService, 'login').mockReturnValue(result);

      expect(await authController.login(loginDto)).toBe(result);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: AuthUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
