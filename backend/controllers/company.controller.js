import * as companyService from '../services/company.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllCompanies = catchAsync(async (req, res, next) => {
  // Execute the query
  const companies = await companyService.getAllCompanies(req.active);

  // Send response
  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: {
      companies,
    },
  });
});

export const getCompany = catchAsync(async (req, res, next) => {
  // Execute the query
  const company = await companyService.getCompany(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});

export const getCompanyResources = catchAsync(async (req, res, next) => {
  // Execute the query
  const resources = await companyService.getCompanyResources(
    req.params.id,
    req.active,
    req.date,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      resources,
    },
  });
});

export const createCompany = catchAsync(async (req, res, next) => {
  // Execute the query
  const company = await companyService.createCompany(req.body?.name);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});

export const udpateCompany = catchAsync(async (req, res, next) => {
  // Execute the query
  const data = req.user.role === 'admin' ? req.body : { name: req.body?.name };
  const company = await companyService.updateCompany(
    req.params.id,
    data,
    req.user.role === 'admin',
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});

export const deleteCompany = catchAsync(async (req, res, next) => {
  const company = await companyService.deleteCompany(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});
