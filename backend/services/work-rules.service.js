import * as WorkRule from '../models/workRules.model.js';
import { getCompany } from '../services/company.service.js';
import { getWorkSite } from '../services/work-site.service.js';
import AppError from '../utils/app-error.js';

export const getAllWorkRules = async (onlyActive, period) => {
  return WorkRule.getAllWorkRules(onlyActive, period);
};

export const getWorkRule = async id => {
  const workRule = await WorkRule.getWorkRule(id);
  if (!workRule?.id) {
    throw new AppError(400, 'No se encuentra la regla de configuración.');
  }

  return workRule;
};

export const getWorkSiteWorkRules = async (workSiteId, period) => {
  await getWorkSite(workSiteId);

  return WorkRule.getWorkSiteWorkRules(workSiteId, period);
};

export const getWorkSiteAndCompanyWorkRules = async (
  workSiteId,
  companyId,
  period,
) => {
  await getWorkSite(workSiteId);
  await getCompany(companyId);

  return WorkRule.getWorkSiteAndCompanyWorkRules(workSiteId, companyId, period);
};

export const createWorkRule = async data => {
  const { workSiteId, companyId, dayCorrection, validFrom, validTo } = data;

  await getWorkSite(workSiteId);
  await getCompany(companyId);

  const newData = {
    workSiteId,
    companyId,
    dayCorrection,
    validFrom: new Date(validFrom),
    validTo: validTo ? new Date(validTo) : null,
  };

  try {
    return WorkRule.createWorkRule(newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        409,
        'La empresa ya tiene una regla de configuración en ese periodo y esta obra',
      );
    }
    if (err.error.code === '23514') {
      throw new AppError(
        400,
        'La fecha de finalización debe ser posterior a la de comienzo.',
      );
    } else throw err;
  }
};

export const updateWorkRule = async (id, data) => {
  const workRule = await getWorkRule(id);

  const { workSiteId, companyId, dayCorrection } = data;
  if (workSiteId) await getWorkSite(workSiteId);
  if (companyId) await getCompany(companyId);

  const validFrom = data.validFrom ? new Date(data.validFrom) : null;
  const validTo = data.validTo ? new Date(data.validTo) : null;

  const newData = {
    workSiteId: workSiteId || workRule.work_site.id,
    companyId: companyId || workRule.company.id,
    dayCorrection: dayCorrection ?? workRule.day_correction_minutes,
    validFrom: validFrom || workRule.valid_from,
    validTo: validTo || workRule.valid_to,
  };

  try {
    return WorkRule.updateWorkRule(id, newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        400,
        'La empresa ya tiene una regla de configuración en ese periodo y esta obra.',
      );
    } else throw err;
  }
};

export const deleteWorkRule = async id => {
  const workRule = await WorkRule.deleteWorkRule(id);
  if (!workRule) {
    throw new AppError(
      400,
      'No se encuentra este registro de regla de configuración.',
    );
  }

  return workRule;
};
