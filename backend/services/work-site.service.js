import * as WorkSite from '../models/work-site.model.js';
import workSiteExists from '../domain/assertions/workSiteExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllWorkSites = async onlyActive => {
  return WorkSite.getAllWorkSites(onlyActive);
};

export const getWorkSite = async id => {
  return workSiteExists(id);
};

export const createWorkSite = async data => {
  const client = await getPool().connect();
  const { name, code, userIds } = data;
  const startDate = data.startDate ? new Date(data.startDate) : null;

  try {
    await client.query('BEGIN');
    const WorkSiteAlreadyExist = await WorkSite.getWorkSiteByCode(
      code?.trim(),
      client,
    );
    if (WorkSiteAlreadyExist?.id) {
      throw new AppError(400, 'Ya hay una obra registrada con este código.');
    }

    const newData = {
      name: name?.trim(),
      code: code?.trim(),
      startDate,
    };

    const workSite = await WorkSite.createWorkSite(newData, userIds, client);

    await client.query('COMMIT');
    return workSite;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
      throw new AppError(
        400,
        'Uno de los usuarios que se intenta asignar, no existe.',
      );
    }
    throw err;
  } finally {
    client.release();
  }
};

export const updateWorkSite = async (id, data) => {
  const client = await getPool().connect();
  const { name, code, userIds } = data;
  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  try {
    await client.query('BEGIN');
    const workSite = await workSiteExists(id, client);

    const newData = {
      name: name?.trim() || workSite.name,
      code: code?.trim() || workSite.code,
      startDate: startDate ?? workSite.start_date ?? null,
      endDate: endDate ?? workSite.end_date ?? null,
    };

    // This allows to set the endDate to null after is set
    if (data.endDate !== null) newData.endDate = null;

    const result = await WorkSite.updateWorkSite(id, newData, userIds, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
      throw new AppError(
        400,
        'Uno de los usuarios que se intenta asignar no existe.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};
