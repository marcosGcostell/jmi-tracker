import * as Worker from '../models/worker.model.js';
import AppError from '../utils/app-error.js';

export const getAllWorkers = async onlyActive => {
  return Worker.getAllWorkers(onlyActive);
};

export const getWorker = async id => {
  const worker = await Worker.getWorker(id);
  if (!worker) {
    throw new AppError(400, 'El trabajador no existe.');
  }

  return worker;
};

export const getWorkersFromCompany = async companyId => {
  const workers = await Worker.getWorkersFromCompany(companyId);
  if (!workers.length) {
    throw new AppError(400, 'La empresa no tiene trabajadores.');
  }

  return workers;
};

export const createWorker = async data => {
  const { companyId, fullName } = data;

  const workerAlreadyExist = await Worker.findWorker(
    companyId,
    fullName.trim(),
  );
  if (workerAlreadyExist?.id) {
    throw new AppError(
      409,
      'Ya hay un trabajdor registrado con este nombre en esta empresa.',
    );
  }

  const worker = await Worker.createWorker({
    companyId,
    fullName: fullName.trim(),
  });

  return worker;
};

export const updateWorker = async (id, data, userRole) => {
  const { fullName, userId, companyId, active } = data;

  const worker = await Worker.getWorker(id);
  if (!worker) {
    throw new AppError(400, 'El trabajador no existe.');
  }

  const newData = {
    fullName: fullName.trim() || worker.full_name,
  };

  if (userRole === 'admin') {
    newData.userId = userId ?? worker.userId;
    newData.companyId = companyId || worker.companyId;
    newData.active = active ?? worker.active ?? true;
  }

  return Worker.updateWorker(id, newData);
};

export const deleteWorker = async id => {
  const worker = await Worker.getWorker(id);
  if (!worker || !worker?.active)
    throw new AppError(400, 'El trabajador no existe o ya está deshabilitado.');

  return Worker.disableWorker(worker.id);
};
