import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

const mockCredentialsDto = { userName: 'bamers', password: 'Password1' };

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
      ],
    }).compile();
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('succesfully signs up user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrowError(ConflictException);
    });

    it('thows and internal server error if not conflict exception', () => {
      save.mockRejectedValue({ code: '500' });
      expect(userRepository.signUp(mockCredentialsDto))
        .rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'bambam';
      user.validatePassword = jest.fn();
    });

    it('returns the username if validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(result).toEqual('bambam');
    });

    it('returns null if user is not defined', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null if password is not valid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('testhash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword('Password1', 'example-salt');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 'example-salt');
      expect(result).toEqual('testhash');
    });
  });
});