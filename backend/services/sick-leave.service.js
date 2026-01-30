import * as SickLeave from '../models/sick-leave.model.js';
import sickLeaveExists from '../domain/assertions/sickLeaveExists.js';
import resourceExists from '../domain/assertions/resourceExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllSickLeaves = async (onlyActive, period) => {
  return SickLeave.getAllSickLeaves(onlyActive, period);
};

export const getSickLeave = async id => {
  return sickLeaveExists(id);
};

export const createSickLeave = async data => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const resource = await resourceExists(data.resourceId, client);

    const newData = {
      resourceId: data.resourceId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };

    const sickLeave = await SickLeave.createSickLeave(newData, client);

    await client.query('COMMIT');
    return sickLeave;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.error.code === '23P01') {
      throw new AppError(409, 'El trabajador ya tiene una baja en ese periodo');
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

export const updateSickLeave = async (id, data) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const sickLeave = await sickLeaveExists(id, client);

    const { resourceId } = data;
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;

    const newData = {
      resourceId: resourceId || sickLeave.resource_id,
      startDate: startDate || sickLeave.start_date,
      endDate: endDate || sickLeave.end_date,
    };

    // Allows to set end_date to null
    if (data.endDate === null) newData.endDate = null;

    const result = await SickLeave.updateSickLeave(id, newData, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.error.code === '23P01') {
      throw new AppError(400, 'El trabajador ya está de baja en ese periodo.');
    } else throw err;
  } finally {
    client.release();
  }
};

export const deleteSickLeave = async id => {
  const sickLeave = await SickLeave.deleteSickLeave(id);
  if (!sickLeave) {
    throw new AppError(400, 'No se encuentra la baja en el registro.');
  }

  return sickLeave;
};
