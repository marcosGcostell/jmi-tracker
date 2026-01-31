import * as WorkRuleService from '../services/work-rule.service.js';

import catchAsync from '../utils/catch-async.js';

export const getAllWorkRules = catchAsync(async (req, res, next) => {
  // Execute the queryw
  const workRule = await WorkRuleService.getAllWorkRules(
    req.active,
    req.period,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    results: workRule.length,
    data: {
      workRule,
    },
  });
});

export const getWorkRule = catchAsync(async (req, res, next) => {
  // Execute the query
  const workRule = await WorkRuleService.getWorkRule(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workRule,
    },
  });
});

export const resolveGetWorkRules = catchAsync(async (req, res, next) => {
  // Execute the query
  const workRules = await WorkRuleService.resolveGetWorkRules(
    req.workSiteId,
    req.companyId,
    req.period,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    results: workRules.length,
    data: {
      workRules,
    },
  });
});

export const resolvePostWorkRule = catchAsync(async (req, res, next) => {
  // Execute the query
  const workRule = await WorkRuleService.resolvePostWorkRule(
    req.workSiteId,
    req.companyId,
    req.body,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    results: workRule.length,
    data: {
      workRule,
    },
  });
});

export const createWorkRule = catchAsync(async (req, res, next) => {
  // Execute the query
  const workRule = await WorkRuleService.createWorkRule(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workRule,
    },
  });
});

export const updateWorkRule = catchAsync(async (req, res, next) => {
  // Execute the query
  const workRule = await WorkRuleService.updateWorkRule(
    req.params.id,
    req.body,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      workRule,
    },
  });
});

export const deleteWorkRule = catchAsync(async (req, res, next) => {
  const workRule = await WorkRuleService.deleteWorkRule(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      workRule,
    },
  });
});
