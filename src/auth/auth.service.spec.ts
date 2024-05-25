import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };
      jest.spyOn(usersService, 'findOneByEmail').mockReturnValue(user);

      expect(service.validateUser('test@example.com', 'password123')).toEqual(
        user,
      );
    });

    it('should return null if validation fails', () => {
      jest.spyOn(usersService, 'findOneByEmail').mockReturnValue(null);

      expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token', () => {
      const user = { id: 'user-id', email: 'test@example.com', name: 'pepe' };
      const token = 'jwt-token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      expect(service.login(user)).toEqual({ access_token: token });
    });
  });

  describe('validateAndLogin', () => {
    it('should return user data if validation is successful', () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        id: '2',
      };
      jest.spyOn(usersService, 'findOneById').mockReturnValue(user);
      jest
        .spyOn(service, 'login')
        .mockReturnValue({ access_token: 'jwt-token' });

      expect(
        service.validateAndLogin({
          email: 'test@example.com',
          password: 'password123',
          id: '2',
        }),
      ).toEqual(user);
    });

    it('should throw UnauthorizedException if validation fails', () => {
      jest.spyOn(usersService, 'findOneById').mockReturnValue(null);

      expect(() =>
        service.validateAndLogin({
          email: 'test@example.com',
          password: 'wrongpassword',
          id: 'user-id',
        }),
      ).toThrow(UnauthorizedException);
    });
  });
});
