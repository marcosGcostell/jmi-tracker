import * as WorkSite from '../models/work-site.model.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';

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

export const createWorkSite = async data => {
  const { name, code, userIds } = data;
  const startDate = data.startDate ? new Date(data.startDate) : null;

  const WorkSiteAlreadyExist = await WorkSite.getWorkSiteByCode(code?.trim());
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

export const updateWorkSite = async (id, data) => {
  const { name, code, userIds } = data;
  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  const workSite = await WorkSite.getWorkSite(id);
  if (!workSite) {
    throw new AppError(400, 'La obra no existe.');
  }

  if (
    (startDate && !validateDate(startDate)) ||
    (endDate && !validateDate(endDate))
  ) {
    throw new AppError(400, 'Las fechas no están en el formato correcto.');
  }

  const newData = {
    name: name?.trim() || workSite.name,
    code: code?.trim() || workSite.code,
    startDate: startDate ?? workSite.start_date ?? null,
    endDate: workSite.end_date ?? null,
  };

  // This allows to set the endDate to null after is set
  if (data.endDate !== undefined) {
    newData.endDate = endDate;
  }

  try {
    return WorkSite.updateWorkSite(id, newData, userIds);
  } catch (err) {
    if (err.code === '23503') {
      throw new AppError(
        400,
        'Uno de los usuarios que se intenta asignar no existe.',
      );
    } else throw err;
  }
};
