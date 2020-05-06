import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

describe('User entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.salt = 'spec-salt';
    user.password = 'spec-saltPassword1';
  });

  describe('validatePassword', () => {
    it('returns true if password is valid', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('spec-saltPassword1');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('Password1');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 'spec-salt');
      expect(result).toEqual(true);
    });

    it('returns false if password is invalid', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('wrong-password');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('fail-password');
      expect(bcrypt.hash).toHaveBeenCalledWith('fail-password', 'spec-salt');
      expect(result).toEqual(false);
    });
  });
});