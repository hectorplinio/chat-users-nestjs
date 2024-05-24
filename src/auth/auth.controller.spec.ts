import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthUserDto } from './auth-users.dto';

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
      };
      const result = { access_token: 'jwt-token' };

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({ id: 'user-id', email: 'test@example.com' });
      jest.spyOn(authService, 'login').mockResolvedValue(result);

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
