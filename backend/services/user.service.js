import * as User from '../models/user.model.js';
import * as WorkSite from '../models/work-site.model.js';
import * as authService from './auth.service.js';
import userExists from '../domain/assertions/userExists.js';
import AppError from '../utils/app-error.js';

export const getAllUsers = async () => {
  return User.getAllUsers();
};

export const getUser = async id => {
  return userExists(id);
};

export const findMyWorkSites = async (userId, onlyActive) => {
  const workSites = await WorkSite.findMyWorkSites(userId, onlyActive);
  if (!workSites.length) {
    throw new AppError(400, 'El usuario no tiene obras asignadas.');
  }

  return workSites;
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
    fullName: fullName.trim(),
    passwordHash,
    role: role || 'user',
  });

  return user;
};

export const updateUser = async (id, data) => {
  const { email, fullName, role, active } = data;

  const user = await userExists(id);

  const newData = {
    email: email?.toLowerCase().trim() || user.email,
    fullName: fullName?.trim() || user.full_name,
    role: role || user.role || 'user',
    active: active ?? user.active ?? true,
  };

  return User.updateUser(user.id, newData);
};

export const deleteUser = async id => {
  const user = await userExists(id);
  if (!user?.active)
    throw new AppError(
      400,
      'El usuario registrado con este email ya está deshabilitado',
    );

  return User.disableUser(user.id);
};
