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
  const user = req.params?.id
    ? await userService.getUser(req.params.id)
    : req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
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

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await userService.deleteUser(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const findMyWorkSites = catchAsync(async (req, res, next) => {
  // Execute the query
  const workSites = await userService.findMyWorkSites(
    req.params.id,
    req.active,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    results: workSites.length,
    data: {
      workSites,
    },
  });
});
