import * as WorkSite from '../models/work-site.model.js';
import AppError from '../utils/app-error.js';
import validator from '../utils/validators.js';

export const getAllWorkSites = async onlyActive => {
  return WorkSite.getAllWorkSites(onlyActive);
};

export const getWorkSite = async id => {
  const workSite = await WorkSite.getWorkSite(id);
  if (!workSite) {
    throw new AppError(400, 'La obra no existe.');
  }

  return workSite;
};

export const getMyWorkSites = async (userId, onlyActive) => {
  const workSites = await WorkSite.getMyWorkSites(userId, onlyActive);
  if (!workSites.length) {
    throw new AppError(400, 'El usuario no tiene obras asignadas.');
  }

  return workSites;
};

export const createWorkSite = async (data, userIds) => {
  const { name, code, startDate } = data;

  const WorkSiteAlreadyExist = await WorkSite.getWorkSiteByName(code?.trim());
  if (WorkSiteAlreadyExist?.id) {
    throw new AppError(409, 'Ya hay una obra registrada con este código.');
  }

  const newData = {
    name: name?.trim(),
    code: code?.trim(),
    startDate,
  };

  try {
    return WorkSite.createWorkSite(newData, userIds);
  } catch (err) {
    if (err.code === '23503') {
      throw new AppError(
        400,
        'Uno de los usuarios que se intenta asignar, no existe.',
      );
    }
    throw err;
  }
};

export const updateWorkSite = async (id, data, userIds) => {
  const { name, code, startDate, endDate } = data;

  const workSite = await WorkSite.getWorkSite(id);
  if (!workSite) {
    throw new AppError(400, 'La obra no existe.');
  }

  if (
    (startDate && !validator.validateDate(startDate)) ||
    (endDate && !validator.validateDate(endDate))
  ) {
    throw new AppError(400, 'Las fechas no están en el formato correcto.');
  }

  const newData = {
    name: name?.trim() || workSite.name,
    code: code?.trim() || workSite.code,
    startDate: startDate || workSite.start_date,
    endDate: endDate || workSite.end_date,
  };

  try {
    return WorkSite.updateWorkSite(id, newData);
  } catch (err) {
    if (err.code === '23503') {
      throw new AppError(
        400,
        'Uno de los usuarios que se intenta asignar no existe.',
      );
    }
    throw err;
  }
};
