import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

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
    let validatePassword;

    beforeEach(() => {
      validatePassword = jest.fn();
      userRepository.findOne = jest.fn();
    });

    it('returns the username if validation is successful', () => {
      const findOneResult = { username: 'bambam', validatePassword };
      const authCredentialsDto = { username: 'bambam', password: 'Password1' };
      userRepository.findOne.mockResolvedValue(findOneResult);
      validatePassword.mockResolvedValue(true);
      expect(userRepository.validateUserPassword(authCredentialsDto))
        .resolves
        .toEqual('bambam');
    });

    it('returns null if user is not defined', () => {
      const authCredentialsDto = { username: 'failusername', password: 'failpassword' };
      userRepository.findOne.mockResolvedValue(null);
      expect(userRepository.validateUserPassword(authCredentialsDto)).resolves.toBeNull();
    });

    it('returns null if password is not valid', () => {
      const findOneResult = { username: 'bambam', validatePassword };
      const authCredentialsDto = { username: 'bambam', password: 'failpassword' };
      userRepository.findOne.mockResolvedValue(findOneResult);
      validatePassword.mockResolvedValue(false);
      expect(userRepository.validateUserPassword(authCredentialsDto))
        .resolves
        .toBeNull();
    });
  });
});