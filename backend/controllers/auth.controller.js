import * as authService from '../services/auth.service.js';
import sendAuthResponse from '../domain/helpers/sendAuthResponse.js';
import catchAsync from '../utils/catch-async.js';

export const login = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.login(req.body);

  sendAuthResponse(res, { user, token, status: 200 });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.updatePassword(req.user, req.body);

  sendAuthResponse(res, { user, token, status: 200 });
});

export const updateUserPassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.updateUserPassword(
    req.params.id,
    req.body,
  );

  sendAuthResponse(res, { user, token, status: 200 });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const resetCode = await authService.saveUserResetCode(req.body.email);
  authService.sendResetPasswordEmail(req.body.email, resetCode);

  res.status(200).json({
    status: 'success',
    data: {
      emailSent: true,
    },
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.resetPassword(
    req.params.code,
    req.body.password,
  );

  sendAuthResponse(res, { user, token, status: 200 });
});

export const protect = catchAsync(async (req, res, next) => {
  const currentUser = await authService.protectRoute(req.cookies.jwt);

  // Grant ACCESS to the protected route
  req.user = currentUser;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    authService.restrictToRoles(req.user.role, roles);

    next();
  };
