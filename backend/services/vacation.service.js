import * as Vacation from '../models/vacation.model.js';
import vacationExists from '../domain/assertions/vacationExists.js';
import resourceExists from '../domain/assertions/resourceExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllVacations = async (onlyActive, period) => {
  return Vacation.getAllVacations(onlyActive, period);
};

export const getVacation = async id => {
  return vacationExists(id);
};

export const createVacation = async data => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    await resourceExists(data.resourceId, client);

    const vacation = await Vacation.createVacation(data, client);

    await client.query('COMMIT');
    return vacation;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err?.code === '23P01') {
      throw new AppError(
        409,
        'El trabajador ya tiene vacaciones en ese periodo',
      );
    }
    if (err?.code === '23514') {
      throw new AppError(
        400,
        'La fecha de finalización debe ser posterior a la de comienzo.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};

export const updateVacation = async (id, data) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const vacation = await vacationExists(id, client);

    const { resourceId, startDate, endDate } = data;

    const newData = {
      resourceId: resourceId || vacation.resource_id,
      startDate: startDate || vacation.start_date,
      endDate: endDate || vacation.end_date,
    };

    const result = await Vacation.updateVacation(id, newData, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err?.code === '23P01') {
      throw new AppError(
        400,
        'El trabajador ya tiene vacaciones en ese periodo.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};

export const deleteVacation = async id => {
  const vacation = await Vacation.deleteVacation(id);
  if (!vacation) {
    throw new AppError(400, 'No se encuentra este registro de vacaciones.');
  }

  return vacation;
};
