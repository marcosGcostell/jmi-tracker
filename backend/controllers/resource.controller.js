import * as resourceService from '../services/resource.service.js';
import * as sickLeaveService from '../services/sick-leave.service.js';
import catchAsync from '../utils/catch-async.js';

export const getAllResources = catchAsync(async (req, res, next) => {
  // Execute the query
  const resources = await resourceService.getAllResources(req.active);

  // Send response
  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources,
    },
  });
});

export const getResource = catchAsync(async (req, res, next) => {
  // Execute the query
  const resource = await resourceService.getResource(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      resource,
    },
  });
});

export const getWorkerVacations = catchAsync(async (req, res, next) => {
  const vacations = await resourceService.getWorkerVacations(
    req.params.id,
    req.period,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      vacations,
    },
  });
});

export const getWorkerSickLeaves = catchAsync(async (req, res, next) => {
  const sickLeaves = await sickLeaveService.getWorkerSickLeaves(
    req.params.id,
    req.period,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      sickLeaves,
    },
  });
});

export const createResource = catchAsync(async (req, res, next) => {
  // Execute the query
  const resource = await resourceService.createResource(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      resource,
    },
  });
});

export const updateResource = catchAsync(async (req, res, next) => {
  // Execute the query
  const resource = await resourceService.updateResource(
    req.params.id,
    req.body,
    req.user.role,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      resource,
    },
  });
});

export const deleteResource = catchAsync(async (req, res, next) => {
  const resource = await resourceService.deleteResource(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      resource,
    },
  });
});
