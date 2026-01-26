import * as Worker from '../models/worker.model.js';
import * as Vacation from '../models/vacation.model.js';
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

export const getWorkerVacations = async id => {
  const vacations = await Vacation.getWorkerVacations(id);

  if (!vacations) {
    throw new AppError(400, 'Este trabajador no tiene registradas vacaciones.');
  }

  return vacations;
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
  console.log(id, data, userRole);
  const { fullName, userId, companyId, active } = data;

  const worker = await Worker.getWorker(id);
  if (!worker) {
    throw new AppError(400, 'El trabajador no existe.');
  }

  // Users can only change the fullName field
  const newData = {
    fullName: fullName?.trim() || worker.full_name,
    userId: worker.userId,
    companyId: worker.company.id,
    active: worker.active,
  };

  if (userRole === 'admin') {
    newData.userId = userId ?? worker.userId;
    newData.companyId = companyId || worker.company.id;
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
