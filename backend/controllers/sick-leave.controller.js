import * as sickLeaveService from '../services/sick-leave.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllSickLeaves = catchAsync(async (req, res, next) => {
  // Execute the query
  const sickLeaves = await sickLeaveService.getAllSickLeaves(
    req.active,
    req.period,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    results: sickLeaves.length,
    data: {
      sickLeaves,
    },
  });
});

export const getSickLeave = catchAsync(async (req, res, next) => {
  // Execute the query
  const sickLeave = await sickLeaveService.getSickLeave(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      sickLeave,
    },
  });
});

export const createSickLeave = catchAsync(async (req, res, next) => {
  // Execute the query
  const sickLeave = await sickLeaveService.createSickLeave(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      sickLeave,
    },
  });
});

export const updateSickLeave = catchAsync(async (req, res, next) => {
  // Execute the query
  const sickLeave = await sickLeaveService.updateSickLeave(
    req.params.id,
    req.body,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      sickLeave,
    },
  });
});

export const deleteSickLeave = catchAsync(async (req, res, next) => {
  const sickLeave = await sickLeaveService.deleteSickLeave(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      sickLeave,
    },
  });
});
