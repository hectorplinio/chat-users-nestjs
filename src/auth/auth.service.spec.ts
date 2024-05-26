import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  const usersService = { findOneBy: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        id: '2',
        name: 'pepe',
        isActive: true,
      };

      usersService.findOneBy.mockReturnValue(user);

      const response = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(response).toEqual(user);
    });

    it('should return null if validation fails', async () => {
      usersService.findOneBy.mockReturnValue(null);

      const response = await service.validateUser(
        'test@example.com',
        'password123',
      );
      expect(response).toEqual(null);
    });
  });

  describe('login', () => {
    it('should return a JWT token', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'pepe',
        isActive: true,
      };
      const token = 'jwt-token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const response = service.login(user);

      expect(response).toEqual({ access_token: token });
    });
  });

  describe('validateAndLogin', () => {
    it('should return user data if validation is successful', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        id: '2',
        name: 'pepe',
        isActive: true,
      };
      usersService.findOneBy.mockReturnValue(user);
      jest
        .spyOn(service, 'login')
        .mockReturnValue({ access_token: 'jwt-token' });

      const response = await service.validateAndLogin({
        email: 'test@example.com',
        password: 'password123',
        id: '2',
      });

      expect(response).toEqual(user);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      usersService.findOneBy.mockReturnValue(null);

      await expect(
        service.validateAndLogin({
          email: 'test@example.com',
          password: 'wrongpassword',
          id: 'user-id',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
