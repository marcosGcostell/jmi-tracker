import validator from 'validator';

import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';

export const validateUserData = catchAsync(async (req, res, next) => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    return next(
      new AppError(
        400,
        'Se necesita un email, un nombre y una contraseña para crear un usuario',
      ),
    );
  }

  if (!validator.isEmail(email.toLowerCase())) {
    return next(new AppError(400, 'Por favor, introduce un email válido'));
  }

  next();
});

export const validateNewPassword = catchAsync(async (req, res, next) => {
  const { oldPassword, password, passwordConfirm } = req.body;

  if (!oldPassword || !password || !passwordConfirm) {
    return next(
      new AppError(
        400,
        'Se necesita la contraseña actual, la nueva y la confirmación de la nueva contraseña para cambiar la contraseña.',
      ),
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError(
        400,
        'El campo de confirmación de contraseña ha de ser idéntico a la nueva contraseña.',
      ),
    );
  }

  next();
});

export const validatePasswordReset = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!code) {
    return next(
      new AppError(
        400,
        'Se necesita enviar el código de confirmación para restablecer la contraseña.',
      ),
    );
  }

  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        400,
        'Se necesita la nueva contraseña y su campo de confirmación para restablecer la contraseña.',
      ),
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError(
        400,
        'El campo de confirmación de contraseña ha de ser idéntico a la nueva contraseña.',
      ),
    );
  }

  next();
});
