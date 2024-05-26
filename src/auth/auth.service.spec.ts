import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
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
      } as UserEntity;

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      const response = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(response).toEqual(user);
    });

    it('should return null if validation fails', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

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
      } as UserEntity;
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
      } as UserEntity;

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);
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
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

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
