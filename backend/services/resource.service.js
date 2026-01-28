import * as Resource from '../models/resource.model.js';
import * as Vacation from '../models/vacation.model.js';
import * as SickLeave from '../models/sick-leave.model.js';
import AppError from '../utils/app-error.js';

export const getAllResources = async onlyActive => {
  return Resource.getAllResources(onlyActive);
};

export const getResource = async id => {
  const resource = await resource.getResource(id);
  if (!resource) {
    throw new AppError(400, 'El trabajador o equipo no existe.');
  }

  return resource;
};

export const getWorkerVacations = async (id, period) => {
  const vacations = await Vacation.getWorkerVacations(id, period);

  if (!vacations) {
    throw new AppError(400, 'Este trabajador no tiene registradas vacaciones.');
  }

  return vacations;
};

export const getWorkerSickLeaves = async (id, period) => {
  const sickLeaves = await SickLeave.getWorkerSickLeaves(id, period);

  if (!sickLeaves) {
    throw new AppError(400, 'Este trabajador no tiene registradas bajas.');
  }

  return sickLeaves;
};

export const createResource = async data => {
  const { companyId, categoryId, name, resourceType } = data;

  const resourceAlreadyExist = await Resource.findResource(
    companyId,
    name.trim(),
  );
  if (resourceAlreadyExist)
    throw new AppError(
      409,
      'Ya hay un trabajador o equipo registrado con este nombre en esta empresa.',
    );

  const resource = await Resource.createResource({
    companyId,
    categoryId,
    name: fullName.trim(),
    resourceType,
  });

  return resource;
};

export const updateResource = async (id, data, userRole) => {
  console.log(id, data, userRole);
  const { name, userId, companyId, categoryId, resourceType, active } = data;

  const resource = await Resource.getResource(id);
  if (!resource) {
    throw new AppError(400, 'El trabajador o equipo no existe.');
  }

  // Users can only change the name, type and categoy fields
  const newData = {
    name: name?.trim() || resource.name,
    userId: resource.user_id,
    companyId: resource.company_id,
    categoryId: categoryId || resource.category_id,
    resourceType: resourceType || resource.resource_type,
    active: resource.active,
  };

  if (userRole === 'admin') {
    newData.userId = userId ?? resource.user_id;
    newData.companyId = companyId || resource.company_id;
    newData.active = active ?? resource.active ?? true;
  }

  return Resource.updateResource(id, newData);
};

export const deleteResource = async id => {
  const resource = await Resource.getResource(id);
  if (!resource || !resource?.active)
    throw new AppError(
      400,
      'El trabajador o equipo no existe o ya está deshabilitado.',
    );

  return Resource.disableResource(resource.id);
};
