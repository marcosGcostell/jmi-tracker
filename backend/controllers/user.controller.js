import User from '../models/user-model.js';
import catchAsync from '../models/utils/catch-async.js';
import AppError from '../models/utils/app-error.js';
import { RESERVED_USER_NAMES } from '../models/utils/config.js';

const _isValidUserName = username => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      message:
        'User name should start with a letter and use only letters, numbers or underscore(_)',
    };
  }

  if (RESERVED_USER_NAMES.includes(username.toLowerCase())) {
    return {
      valid: false,
      message: 'This user name is reserved',
    };
  }

  return { valid: true };
};

const _filterFields = (obj, allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

export const validateUserName = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  // Continue to validate other fields if no data
  if (!username) return next();

  const result = _isValidUserName(username);

  if (!result.valid) {
    return next(new AppError(400, result.message));
  }

  next();
});

export const validateUserData = catchAsync(async (req, res, next) => {
  const { data } = req.body;
  // Continue to update other fields if no data
  if (!data) return next();

  next();
});

export const userExists = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;

  if (!username && !email) {
    return next(new AppError(400, 'Field can not be empty'));
  }
  if (email && !User.isValidEmail(email)) {
    return next(new AppError(400, 'Please provide a valid email'));
  }

  const user = await User.findOne({
    $or: [{ email }, { usernameToLower: username?.toLowerCase() }],
  });

  const checkedField = username ? 'username' : 'email';
  if (user) {
    return next(
      new AppError(400, `User with this ${checkedField} already exists`),
    );
  }

  res.status(200).json({
    status: 'success',
    isValid: true,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  // Execute the query
  const users = await User.find();

  // Send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const createUser = catchAsync(async (req, res, next) => {});

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
  const allowedFields = ['name', 'username', 'email', 'data', 'config'];
  const filteredBody = _filterFields(req.body, allowedFields);

  // Nested fields shoud be flattened and use $set operator
  // in order to not loose all the missing data
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: filteredBody },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {});
