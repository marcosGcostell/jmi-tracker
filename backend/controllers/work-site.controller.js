import * as workSiteService from '../services/work-site.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllWorkSites = catchAsync(async (req, res, next) => {
  // Execute the query
  const workSites = await workSiteService.getAllWorkSites(req.active);

  // Send response
  res.status(200).json({
    status: 'success',
    results: workSites.length,
    data: {
      workSites,
    },
  });
});

export const getWorkSite = catchAsync(async (req, res, next) => {
  // Execute the query
  const workSite = await workSiteService.getWorkSite(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workSite,
    },
  });
});

export const createWorkSite = catchAsync(async (req, res, next) => {
  // Execute the query
  const workSite = await workSiteService.createWorkSite(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workSite,
    },
  });
});

export const updateWorkSite = catchAsync(async (req, res, next) => {
  // Execute the query
  const workSite = await workSiteService.updateWorkSite(
    req.params.id,
    req.body,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workSite,
    },
  });
});
