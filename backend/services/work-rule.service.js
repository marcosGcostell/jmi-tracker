import * as WorkRule from '../models/work-rule.model.js';
import workRuleExists from '../domain/assertions/workRuleExists.js';
import companyExists from '../domain/assertions/companyExists.js';
import workSiteExists from '../domain/assertions/workSiteExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllWorkRules = async (onlyActive, period) => {
  return WorkRule.getAllWorkRules(onlyActive, period);
};

export const getWorkRule = async id => {
  return workRuleExists(id);
};

export const resolveGetWorkRules = async (workSiteId, companyId, period) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    if (workSiteId) await workSiteExists(workSiteId, client);
    if (companyId) await companyExists(companyId, false, client);

    const workRule = await WorkRule.getConditionedWorkRules(
      workSiteId,
      companyId,
      period,
      client,
    );

    await client.query('COMMIT');
    return workRule;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const resolvePostWorkRules = async (workSiteId, companyId, data) => {
  if (!workSiteId || !companyId) {
    throw new AppError(
      400,
      'Se necesitan los datos de la obra y la empresa para crear una regla.',
    );
  }

  data.workSiteId = workSiteId;
  data.companyId = companyId;

  return createWorkRule(data);
};

export const createWorkRule = async data => {
  const client = await getPool().connect();
  const { workSiteId, companyId, dayCorrection, validFrom, validTo } = data;

  try {
    await client.query('BEGIN');
    await workSiteExists(workSiteId, client);
    await companyExists(companyId, false, client);

    const newData = {
      workSiteId,
      companyId,
      dayCorrection,
      validFrom: new Date(validFrom),
      validTo: validTo ? new Date(validTo) : null,
    };

    const workRule = await WorkRule.createWorkRule(newData, client);

    await client.query('COMMIT');
    return workRule;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.error.code === '23P01') {
      throw new AppError(
        400,
        'La empresa ya tiene una regla de configuración en ese periodo y esta obra',
      );
    }
    if (err.error.code === '23514') {
      throw new AppError(
        400,
        'La fecha de finalización debe ser posterior a la de comienzo.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};

export const updateWorkRule = async (id, data) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const workRule = await workRuleExists(id, client);

    // Nobody can change the work-site or the company in a work rule
    // Probably it will break the results for existing data
    const { dayCorrection } = data;
    const validFrom = data.validFrom ? new Date(data.validFrom) : null;
    const validTo = data.validTo ? new Date(data.validTo) : null;

    const newData = {
      workSiteId: workRule.work_site.id,
      companyId: workRule.company.id,
      dayCorrection: dayCorrection ?? workRule.day_correction_minutes,
      validFrom: validFrom || workRule.valid_from,
      validTo: validTo || workRule.valid_to,
    };

    const result = await WorkRule.updateWorkRule(id, newData, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.error.code === '23P01') {
      throw new AppError(
        400,
        'La empresa ya tiene una regla de configuración en ese periodo y esta obra.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};

export const deleteWorkRule = async id => {
  // TODO We shouldn't be able to delete a working rule unless it's unused
  const workRule = await WorkRule.deleteWorkRule(id);
  if (!workRule) {
    throw new AppError(
      400,
      'No se encuentra este registro de regla de configuración.',
    );
  }

  return workRule;
};
