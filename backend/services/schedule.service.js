import * as Schedule from '../models/schedule.model.js';
import scheduleExists from '../domain/assertions/scheduleExists.js';
import companyExists from '../domain/assertions/companyExists.js';
import AppError from '../utils/app-error.js';

export const getAllSchedules = async (onlyActive, period) => {
  return Schedule.getAllSchedules(onlyActive, period);
};

export const getSchedule = async id => {
  return scheduleExists(id);
};

export const getCompanySchedules = async (companyId, period) => {
  await companyExists(companyId, true);

  return Schedule.getCompanySchedules(companyId, period);
};

export const createSchedule = async data => {
  const { companyId, startTime, endTime, dayCorrection, validFrom, validTo } =
    data;

  await companyExists(companyId, true);

  const newData = {
    companyId,
    startTime,
    endTime,
    dayCorrection,
    validFrom: new Date(validFrom),
    validTo: validTo ? new Date(validTo) : null,
  };

  try {
    return Schedule.createSchedule(newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        409,
        'La empresa ya tiene un horario activo en ese periodo',
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

export const updateSchedule = async (id, data) => {
  const schedule = await scheduleExists(id);

  const { companyId, startTime, endTime, dayCorrection } = data;
  if (companyId) await companyExists(companyId, true);

  const validFrom = data.validFrom ? new Date(data.validFrom) : null;
  const validTo = data.validTo ? new Date(data.validTo) : null;

  const newData = {
    companyId: companyId || schedule.company.id,
    startTime: startTime || schedule.start_time,
    endTime: endTime || schedule.end_time,
    dayCorrection: dayCorrection ?? schedule.day_correction_minutes,
    validFrom: validFrom || schedule.valid_from,
    validTo: validTo || schedule.valid_to,
  };

  try {
    return Schedule.updateSchedule(id, newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        400,
        'La empresa ya tiene un horario activo en ese periodo.',
      );
    } else throw err;
  }
};

export const deleteSchedule = async id => {
  const schedule = await Schedule.deleteSchedule(id);
  if (!schedule) {
    throw new AppError(400, 'No se encuentra este registro de horarios.');
  }

  return schedule;
};
