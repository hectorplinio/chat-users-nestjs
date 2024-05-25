import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthUserDto } from './auth-users.dto';
import { User } from 'src/users/user.model';

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
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOneById: jest.fn(),
          },
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

      jest.spyOn(authService, 'validateUser').mockReturnValue(user);

      jest.spyOn(authService, 'login').mockReturnValue(result);

      expect(await authController.login(loginDto)).toBe(result);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: AuthUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'validateUser').mockReturnValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
