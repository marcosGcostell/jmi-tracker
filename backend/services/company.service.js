import * as Company from '../models/company.model.js';
import AppError from '../utils/app-error.js';

export const getAllCompanies = async () => {
  return Company.getAllCompanies();
};

export const getCompany = async id => {
  const company = await Company.getCompany(id);
  if (!company) {
    throw new AppError(400, 'La empresa no existe.');
  }

  return company;
};

export const createCompany = async name => {
  if (!name) {
    throw new AppError(400, 'Se necesita un nombre para crear una empresa.');
  }

  const companyAlreadyExist = await Company.getCompanyByName(name.trim());
  if (companyAlreadyExist?.id) {
    throw new AppError(409, 'Ya hay un empresa registrada con este nombre');
  }

  const company = await Company.createCompany({
    name: name.trim(),
  });

  return company;
};

export const updateCompany = async (id, data) => {
  const { name, isMain, active } = data;

  const oldCompany = await Company.getCompany(id);
  if (!oldCompany) {
    throw new AppError(400, 'La empresa no existe.');
  }

  const company = await Company.updateCompany(id, {
    name: name?.trim() || oldCompany.name,
    isMain: isMain ?? oldCompany.is_main ?? false,
    active: active ?? oldCompany.active ?? true,
  });

  return company;
};

export const deleteCompany = async id => {
  const company = await Company.getCompany(id);
  if (!company || !company?.active)
    throw new AppError(400, 'La empresa no existe o ya está deshabilitada');

  return Company.disableCompany(company.id);
};
