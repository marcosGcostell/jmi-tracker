import * as vacationService from '../services/vacation.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllVacations = catchAsync(async (req, res, next) => {
  // Execute the query
  const vacations = await vacationService.getAllVacations(req.active);

  // Send response
  res.status(200).json({
    status: 'success',
    results: vacations.length,
    data: {
      vacations,
    },
  });
});

export const getVacation = catchAsync(async (req, res, next) => {
  // Execute the query
  const vacation = await vacationService.getVacation(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      vacation,
    },
  });
});

export const createVacation = catchAsync(async (req, res, next) => {
  // Execute the query
  const vacation = await vacationService.createVacation(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      vacation,
    },
  });
});

export const updateVacation = catchAsync(async (req, res, next) => {
  // Execute the query
  const vacation = await vacationService.updateVacation(
    req.params.id,
    req.body,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      vacation,
    },
  });
});

export const deleteVacation = catchAsync(async (req, res, next) => {
  const vacation = await vacationService.deleteVacation(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      vacation,
    },
  });
});
