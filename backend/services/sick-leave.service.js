import * as SickLeave from '../models/sick-leave.model.js';
import sickLeaveExists from '../domain/assertions/sickLeaveExists.js';
import resourceExists from '../domain/assertions/resourceExists.js';
import AppError from '../utils/app-error.js';

export const getAllSickLeaves = async (onlyActive, period) => {
  return SickLeave.getAllSickLeaves(onlyActive, period);
};

export const getSickLeave = async id => {
  return sickLeaveExists(id);
};

export const createSickLeave = async data => {
  const resource = await resourceExists(data.resourceId);

  const newData = {
    resourceId: data.resourceId,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
  };

  try {
    return SickLeave.createSickLeave(newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(409, 'El trabajador ya tiene una baja en ese periodo');
    }
    if (err.error.code === '23514') {
      throw new AppError(
        400,
        'La fecha de finalización debe ser posterior a la de comienzo.',
      );
    } else throw err;
  }
};

export const updateSickLeave = async (id, data) => {
  const sickLeave = await sickLeaveExists(id);

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

  try {
    return SickLeave.updateSickLeave(id, newData);
  } catch (err) {
    if (err.error.code === '23P01') {
      throw new AppError(400, 'El trabajador ya está de baja en ese periodo.');
    } else throw err;
  }
};

export const deleteSickLeave = async id => {
  const sickLeave = await SickLeave.deleteSickLeave(id);
  if (!sickLeave) {
    throw new AppError(400, 'No se encuentra la baja en el registro.');
  }

  return sickLeave;
};
