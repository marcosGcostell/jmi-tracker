import * as Worker from '../models/worker.model.js';
import AppError from '../utils/app-error.js';

export const getAllWorkers = async () => {
  return Worker.getAllWorkers();
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

export const updateWorker = async (id, data) => {
  const { fullName, userId, companyId, active } = data;

  const oldCompany = await Company.getCompany(id);
  if (!oldCompany) {
    throw new AppError(400, 'La empresa no existe.');
  }

  const newData = {
    name: name?.trim() || oldCompany.name,
    isMain: isMain ?? oldCompany.is_main ?? false,
    active: active ?? oldCompany.active ?? true,
  };

  return Company.updateCompany(id, newData);
};

export const deleteCompany = async id => {
  const company = await Company.getCompany(id);
  if (!company || !company?.active)
    throw new AppError(400, 'La empresa no existe o ya está deshabilitada');

  if (company.is_main)
    throw new AppError(400, 'No se puede deshabilitar la empresa principal');

  return Company.disableCompany(company.id);
};
