import * as authService from '../services/auth.service.js';
import sendAuthResponse from '../utils/sendAuthResponse.js';
import catchAsync from '../utils/catch-async.js';

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
  const { email } = req.body;

  const resetCode = await authService.saveUserResetCode(email);
  authService.sendResetPasswordEmail(email, resetCode);

  res.status(200).json({
    status: 'success',
    data: {
      emailSent: true,
    },
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { user, token } = authService.resetPassword(
    req.params.code,
    req.body.password,
  );

  sendAuthResponse(res, { user, token, status: 200 });
});

export const protect = catchAsync(async (req, res, next) => {
  const currentUser = authService.protectRoute(req.cookies.jwt);

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
