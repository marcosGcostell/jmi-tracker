import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PASSWORD_MIN_LENGTH, ENCRYPT_STRENGTH } from '../utils/config.js';
import * as User from '../models/user.model.js';
import * as Auth from '../models/auth.model.js';
import AppError from '../utils/app-error.js';

const FORBIDDEN_CHARS_REGEX = /[\s\x00-\x1F\x7F]/;
const LOWERCASE_REGEX = /[a-z]/;
const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_OR_SYMBOL_REGEX = /[0-9!@#$%^&*()[\]{}\-_=+;:,.<>?]/;

const _comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const _hasChangedPassword = (passwordChangedAt, JWTTimestamp) => {
  if (!passwordChangedAt) return false;

  const passwordTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);

  return JWTTimestamp < passwordTimestamp;
};

const _signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const _verifyToken = token =>
  new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return rej(err);
      }
      res(decoded);
    });
  });

const _validatePasswordPolicy = password => {
  if (typeof password !== 'string')
    return 'El formato de la contraseña no es correcto';

  if (password.length < PASSWORD_MIN_LENGTH)
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;

  if (FORBIDDEN_CHARS_REGEX.test(password))
    return 'La contraseña tiene caracteres prohibidos (espacios o caracteres de control)';

  if (!LOWERCASE_REGEX.test(password))
    return 'La contraseña debe contener al menos una letra minúscula';

  if (!UPPERCASE_REGEX.test(password))
    return 'La contraseña debe contener al menos una letra mayúscula';

  if (!NUMBER_OR_SYMBOL_REGEX.test(password))
    return 'La contraseña debe contener al menos un número o un símbolo';

  return '';
};

const _hashPassword = async plainPassword => {
  return bcrypt.hash(plainPassword, ENCRYPT_STRENGTH);
};

export const validateAndHashPassword = async password => {
  const passwordError = _validatePasswordPolicy(password);
  if (passwordError.length) {
    throw new AppError(
      422,
      `La contraseña no cumple los requisitos mínimos de seguridad: ${passwordError}`,
    );
  }

  return _hashPassword(password);
};

export const login = async (email, password) => {
  // Validate request data
  if (!email || !password) {
    throw new AppError(400, 'Por favor, introduzca su email y su contraseña');
  }

  // Check user and password
  const user = await Auth.findUserToLogIn(email);
  const isPasswordValid = await _comparePassword(password, user.password);
  if (!user || !isPasswordValid || !user?.active)
    throw new AppError(401, 'El email o la contraseña son incorrectos');

  // Sign token and clean user
  const token = _signToken(user.id);
  user.password = undefined;
  user.active = undefined;

  return { user, token };
};

export const updatePassword = async (loggedUser, { oldPassword, password }) => {
  const oldUser = await Auth.findUserToAuth(loggedUser.id);
  const isPasswordValid = await _comparePassword(oldPassword, oldUser.password);

  if (!isPasswordValid)
    throw new AppError(401, 'La contraseña actual no es correcta.');

  const passwordHash = await validateAndHashPassword(password);

  const user = await User.updateUserPassword(oldUser.id, passwordHash);
  const token = _signToken(user.id);

  return { user, token };
};
