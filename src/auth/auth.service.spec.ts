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
    it('should return user data if validation is successful', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);

      expect(
        await service.validateUser('test@example.com', 'password123'),
      ).toEqual(null);
    });

    it('should return null if validation fails', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      expect(
        await service.validateUser('test@example.com', 'wrongpassword'),
      ).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const user = { id: 'user-id', email: 'test@example.com' };
      const token = 'jwt-token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      expect(await service.login(user)).toEqual({ access_token: token });
    });
  });
});
