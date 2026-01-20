import * as User from '../models/user.model.js';
import * as authService from './auth.service.js';
import AppError from '../utils/app-error.js';

export const createUser = async data => {
  const { email, fullName, password, role } = data;

  const userAlreadyExist = await User.getUserByEmail(email.toLowerCase());
  if (userAlreadyExist?.id) {
    throw new AppError(409, 'Ya hay un usuario registrado con este email');
  }

  const passwordHash = await authService.validateAndHashPassword(password);

  const user = await User.createUser({
    email: email.toLowerCase().trim(),
    fullName: fullName.toLowerCase().trim(),
    passwordHash,
    role,
  });

  return user;
};
