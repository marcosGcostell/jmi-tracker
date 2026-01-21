import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  APP_LOGO,
  PASSWORD_MIN_LENGTH,
  ENCRYPT_STRENGTH,
  PASSWORD_RESET_EXPIRES,
} from '../utils/config.js';
import * as User from '../models/user.model.js';
import * as Auth from '../models/auth.model.js';
import AppError from '../utils/app-error.js';
import sendEmail from '../utils/email.js';

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

const _generateResetCode = () => {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
};

// EXPORTED FUNCTIONS

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
  const user = await Auth.findUserToLogIn(email.toLowerCase().trim());
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

export const saveUserResetCode = async email => {
  if (!email) throw new AppError(400, 'Por favor, introduzca su email.');

  const user = await User.getUserByEmail(email.toLowerCase().trim());
  if (!user)
    throw new AppError(
      400,
      'No existe ningún usuario registrado con este email',
    );

  const resetCode = _generateResetCode();
  const resetCodeHash = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  Auth.saveResetCode(user.id, { resetCodeHash, PASSWORD_RESET_EXPIRES });

  return resetCode;
};

export const sendResetPasswordEmail = (email, resetCode) => {
  const subject = 'JMI Obras Control Horario - restablecer contraseña';
  const text = `Código para restablecer la contraseña:\n\n${resetCode}\n\nEste código es válido por ${PASSWORD_RESET_EXPIRES} minutos. Si no lo ha solicitado, por favor, cambie la contraseña en la aplicación.`;

  let html = readFileSync(
    resolve('templates', 'reset-password-email.html'),
    'utf8',
  );

  html = html.replace('{%LOGO%}', APP_LOGO);
  html = html.replace('{%EXPIRATION%}', PASSWORD_RESET_EXPIRES.toString());
  resetCode.forEach((digit, i) => {
    html = html.replace(`{%N${i}%}`, digit[i]);
  });

  sendEmail({ email, subject, text, html });
};

export const resetPassword = async (code, password) => {
  const resetCodeHash = crypto.createHash('sha256').update(token).digest('hex');
  const oldUser = await Auth.findUserByResetCode(resetCodeHash);

  if (!oldUser)
    throw new AppError(400, 'El código no es correcto o ha expirado.');
  if (!oldUser?.active)
    throw new AppError(400, 'Este usuario ya no tiene una cuenta registrada.');

  const passwordHash = await validateAndHashPassword(password);

  Auth.cleanResetCode(oldUser.id);
  const user = await User.updateUserPassword(oldUser.id, passwordHash);

  const token = _signToken(user.id);

  return { user, token };
};

export const protectRoute = async token => {
  if (!token) {
    return next(
      new AppError(
        401,
        'No has iniciado sesión! Por favor, inicia sesión para obtener acceso.',
      ),
    );
  }

  const decoded = await _verifyToken(token);
  const currentUser = await Auth.findUserToAuth(decoded.id);
  if (!currentUser || !currentUser?.active)
    throw new AppError(401, 'El usuario asociado a la cookie ya no existe.');

  if (_hasChangedPassword(currentUser.password_changed_at, decoded.iat)) {
    return next(
      new AppError(401, 'User recently changed password!. Please log in again'),
    );
  }

  currentUser.password = undefined;
  currentUser.password_changed_at = undefined;
  currentUser.active = undefined;

  return currentUser;
};

export const restrictToRoles = (userRole, authRoles) => {
  if (!authRoles.includes(userRole))
    throw new AppError(401, 'No estás autorizado a acceder a este recurso.');
};
