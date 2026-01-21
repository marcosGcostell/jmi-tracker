import * as User from '../models/user.model.js';
import * as Auth from '../models/auth.model.js';
import * as authService from './auth.service.js';
import AppError from '../utils/app-error.js';

export const getAllUsers = async () => {
  return User.getAllUsers();
};

export const createUser = async data => {
  const { email, fullName, password, role } = data;

  const userAlreadyExist = await User.getUserByEmail(
    email.toLowerCase().trim(),
  );
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

export const updateUser = async (id, data) => {
  const user = await User.getUser(id);
  if (!user)
    throw new AppError(
      401,
      'No has iniciado sesión! Por favor, inicia sesión para obtener acceso.',
    );

  const data = {
    email: data.email || user.email,
    fullName: data.fullName || user.full_name,
    role: data.role || user.role,
  };

  return User.updateUser(user.id, data);
};

export const deleteUser = async email => {
  const user = await Auth.findUserToLogIn(email.toLowerCase().trim());
  if (!user || !user?.active)
    throw new AppError(
      400,
      'No existe ningún usuario registrado con este email o ya está deshabilitado',
    );

  return User.disableUser(user.id);
};
