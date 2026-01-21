import * as userService from '../services/user.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  // Execute the query
  const users = await userService.getAllUsers();

  // Send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const createUser = catchAsync(async (req, res, next) => {
  const user = await userService.createUser(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await userService.updateUser(req.user.id, {
    fullName: req.body.fullName,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUserForAdmins = catchAsync(async (req, res, next) => {
  const { email, fullName, role } = req.body;
  const user = await userService.updateUser(req.params.id, {
    email,
    fullName,
    role,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await userService.deleteUser(req.params.email);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
