import * as User from '../models/user.model.js';
import * as WorkSite from '../models/work-site.model.js';
import * as authService from './auth.service.js';
import userExists from '../domain/assertions/userExists.js';
import { getPool } from '../db/pool.js';
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
  const client = await getPool().connect();
  const { email, fullName, password, role } = data;

  try {
    await client.query('BEGIN');
    const userAlreadyExist = await User.getUserByEmail(
      email.toLowerCase().trim(),
      client,
    );
    if (userAlreadyExist?.id) {
      throw new AppError(409, 'Ya hay un usuario registrado con este email');
    }

    const passwordHash = await authService.validateAndHashPassword(password);

    const user = await User.createUser(
      {
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        passwordHash,
        role: role || 'user',
      },
      client,
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateUser = async (id, data) => {
  const client = await getPool().connect();
  const { email, fullName, role, active } = data;

  try {
    await client.query('BEGIN');
    const user = await userExists(id, client);

    const newData = {
      email: email?.toLowerCase().trim() || user.email,
      fullName: fullName?.trim() || user.full_name,
      role: role || user.role || 'user',
      active: active ?? user.active ?? true,
    };

    const result = await User.updateUser(user.id, newData, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteUser = async id => {
  const client = await getPool().connect();

  try {
    const user = await userExists(id, client);
    if (!user?.active)
      throw new AppError(
        400,
        'El usuario registrado con este email ya está deshabilitado',
      );

    const result = await User.disableUser(user.id, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
