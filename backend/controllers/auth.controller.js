import { readFileSync } from 'fs';
import { resolve } from 'path';
import crypto from 'crypto';

import User from '../models/user-model.js';
import * as authService from './auth.service.js';
import sendAuthResponse from '../utils/sendAuthResponse.js';
import sendEmail from '../models/utils/email.js';
import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';
import { APP_LOGO } from '../client/src/utils/config.js';

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);

  sendAuthResponse(res, { user, token, status: 200 });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, password } = req.body;
  const { user, token } = await authService.updatePassword(req.user, {
    oldPassword,
    password,
  });

  sendAuthResponse(res, { user, token, status: 200 });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return next(new AppError(400, 'Please, provide email or username.'));
  }

  const user = await User.findOne({
    $or: [{ email }, { usernameToLower: username?.toLowerCase() }],
  });

  if (!user) {
    return next(
      new AppError(
        400,
        'Could not find an account with this email or username.',
      ),
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const subject = 'Kuantik draftKing - reset your password';
  const text = `Request code for reset your password:\n\n${resetToken}\n\nThis code is valid for 5 minutes. If you don't request it, change your password in the application`;
  let html = readFileSync(
    resolve('templates', 'reset-password-email.html'),
    'utf8',
  );
  html = html.replace('{%LOGO%}', APP_LOGO);
  html = html.replace('{%TOKEN%}', resetToken);

  sendEmail({ email: user.email, subject, text, html });

  res.status(200).json({
    status: 'success',
    data: {
      emailSent: true,
    },
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return next(
      new AppError(
        400,
        'Please, provide the request code to reset the password.',
      ),
    );
  }

  const { password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        400,
        'Please, provide you password and the password confirmed.',
      ),
    );
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(401, 'The request code is not correct or it has expired'),
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  _loginUser(res, user, 200);
});

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError(401, 'You are not logged in! Please log in to get access.'),
    );
  }

  const decoded = await _verifyToken(token);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(401, 'The user belonging to this token no longer exists.'),
    );
  }

  if (currentUser.hasChangedPassword(decoded.iat)) {
    return next(
      new AppError(401, 'User recently changed password!. Please log in again'),
    );
  }

  // Grant ACCESS to the protected route
  req.user = currentUser;
  next();
});

export const protectInternal = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(new AppError(403, 'Forbidden'));
  }

  const token = req.headers.authorization.split(' ')[1];
  if (token !== process.env.WORKER_SECRET) {
    return next(new AppError(403, 'Forbidden'));
  }
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(401, 'You are not authorized to this resource'));
    }
    next();
  };
