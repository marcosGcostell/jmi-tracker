import * as Schedule from '../models/schedule.model.js';
import scheduleExists from '../domain/assertions/scheduleExists.js';
import companyExists from '../domain/assertions/companyExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllSchedules = async (onlyActive, period) => {
  return Schedule.getAllSchedules(onlyActive, period);
};

export const getSchedule = async id => {
  return scheduleExists(id);
};

export const getCompanySchedules = async (companyId, period, date) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    await companyExists(companyId, 'main', client);

    const schedules = await Schedule.getCompanySchedules(
      companyId,
      date,
      client,
    );

    await client.query('COMMIT');
    return schedules;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const createSchedule = async data => {
  const client = await getPool().connect();
  const { companyId, startTime, endTime, dayCorrection, validFrom, validTo } =
    data;

  try {
    await client.query('BEGIN');
    await companyExists(companyId, 'main', client);

    const newData = {
      companyId,
      startTime,
      endTime,
      dayCorrection,
      validFrom,
      validTo: validTo ?? null,
    };

    const schedule = await Schedule.createSchedule(newData, client);

    await client.query('COMMIT');
    return schedule;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err?.code === '23P01') {
      throw new AppError(
        409,
        'La empresa ya tiene un horario activo en ese periodo',
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

export const updateSchedule = async (id, data) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const schedule = await scheduleExists(id, client);

    const { companyId, startTime, endTime, dayCorrection, validFrom, validTo } =
      data;
    if (companyId) await companyExists(companyId, 'main', client);

    const newData = {
      companyId: companyId || schedule.company.id,
      startTime: startTime || schedule.start_time,
      endTime: endTime || schedule.end_time,
      dayCorrection: dayCorrection ?? schedule.day_correction_minutes,
      validFrom: validFrom || schedule.valid_from,
      validTo: validTo || schedule.valid_to,
    };

    // Allows you to change validTo to null
    if (validTo === null) newData.validTo = null;

    const result = await Schedule.updateSchedule(id, newData, client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err?.code === '23P01') {
      throw new AppError(
        400,
        'La empresa ya tiene un horario activo en ese periodo.',
      );
    } else throw err;
  } finally {
    client.release();
  }
};

export const deleteSchedule = async id => {
  const schedule = await Schedule.deleteSchedule(id);
  if (!schedule) {
    throw new AppError(400, 'No se encuentra este registro de horarios.');
  }

  return schedule;
};
