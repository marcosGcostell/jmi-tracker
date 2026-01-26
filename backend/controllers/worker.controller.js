import * as workerService from '../services/worker.service.js';
import catchAsync from '../utils/catch-async.js';

export const getAllWorkers = catchAsync(async (req, res, next) => {
  // Execute the query
  const workers = await workerService.getAllWorkers(req.active);

  // Send response
  res.status(200).json({
    status: 'success',
    results: workers.length,
    data: {
      workers,
    },
  });
});

export const getWorker = catchAsync(async (req, res, next) => {
  // Execute the query
  const worker = await workerService.getWorker(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});

export const getWorkerVacations = catchAsync(async (req, res, next) => {
  const vacations = await workerService.getWorkerVacations(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      vacations,
    },
  });
});

export const createWorker = catchAsync(async (req, res, next) => {
  // Execute the query
  const worker = await workerService.createWorker(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});

export const updateWorker = catchAsync(async (req, res, next) => {
  // Execute the query
  const worker = await workerService.updateWorker(
    req.params.id,
    req.body,
    req.user.role,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});

export const deleteWorker = catchAsync(async (req, res, next) => {
  const worker = await workerService.deleteWorker(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});
