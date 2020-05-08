import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository }
      ]
    }).compile();
    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates and returns the user based based on JWT payload', async () => {
      const user = new User();
      user.username = 'bambam';
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate({ username: 'bambam' });
      expect(userRepository.findOne).toHaveBeenCalledWith({ username: 'bambam' })
      expect(result).toEqual(user);
    });

    it('throws an unauthorized exception if user cannot be found', () => {
      const user = new User();
      user.username = 'testfaile'
      userRepository.findOne.mockResolvedValue(undefined);
      expect(jwtStrategy.validate(user)).rejects.toThrowError(UnauthorizedException)
    });
  });
});