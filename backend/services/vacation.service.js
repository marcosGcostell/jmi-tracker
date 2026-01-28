import * as Vacation from '../models/vacation.model.js';
import * as Resource from '../models/resource.model.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';

export const getAllVacations = async (onlyActive, period) => {
  return Vacation.getAllVacations(onlyActive, period);
};

export const getVacation = async id => {
  const vacation = await Vacation.getVacation(id);
  if (!vacation?.id) {
    throw new AppError(400, 'No se encuentra el registro de vacaciones.');
  }

  return vacation;
};

export const createVacation = async data => {
  const resource = await Resource.getResource(data.resourceId);
  if (!resource?.id) {
    throw new AppError(400, 'El trabajador no existe.');
  }
  const newData = {
    resourceId: data.resourceId,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  };

  try {
    return Vacation.createVacation(newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        409,
        'El trabajador ya tiene vacaciones en ese periodo',
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

export const updateVacation = async (id, data) => {
  const vacation = await Vacation.getVacation(id);
  if (!vacation) {
    throw new AppError(400, 'No se encuentra este registro de vacaciones.');
  }

  const { resourceId } = data;
  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  if (
    (startDate && !validateDate(startDate)) ||
    (endDate && !validateDate(endDate))
  ) {
    throw new AppError(400, 'Las fechas no están en el formato correcto.');
  }

  const newData = {
    resourceId: resourceId || vacation.resource_id,
    startDate: startDate || vacation.start_date,
    endDate: endDate || vacation.end_date,
  };

  try {
    return Vacation.updateVacation(id, newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(
        400,
        'El trabajador ya tiene vacaciones en ese periodo.',
      );
    } else throw err;
  }
};

export const deleteVacation = async id => {
  const sickLeave = await Vacation.deleteVacation(id);
  if (!sickLeave) {
    throw new AppError(400, 'No se encuentra este registro de vacaciones.');
  }

  return sickLeave;
};
