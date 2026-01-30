import * as Company from '../models/company.model.js';
import * as Resource from '../models/resource.model.js';
import * as Category from '../models/category.model.js';
import companyExists from '../domain/assertions/companyExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllCompanies = async onlyActive => {
  return Company.getAllCompanies(onlyActive);
};

export const getCompany = async id => {
  return companyExists(id);
};

export const getCompanyResources = async (id, onlyActive, date) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const company = await companyExists(id, client);

    if (company.is_main && date) {
      return Resource.getCompanyResourcesWithStatus(
        id,
        onlyActive,
        date,
        client,
      );
    }

    const resources = await Resource.getCompanyResources(
      id,
      onlyActive,
      client,
    );

    if (!resources.length) {
      throw new AppError(400, 'La empresa no tiene trabajadores.');
    }

    return resources;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getCompanyCategories = async (id, plusGlobal) => {
  const categories = await Category.getCompanyCategories(id, plusGlobal);

  if (!categories) {
    throw new AppError(
      400,
      'Esta empresa no tiene ninguna categoría registrada.',
    );
  }

  return categories;
};

export const createCompany = async name => {
  const companyAlreadyExist = await Company.getCompanyByName(name.trim());

  if (companyAlreadyExist?.id) {
    throw new AppError(409, 'Ya hay un empresa registrada con este nombre');
  }

  const company = await Company.createCompany({
    name: name.trim(),
  });

  return company;
};

export const updateCompany = async (id, data, isAdmin) => {
  const { name, isMain, active } = data;

  const company = await companyExists(id);

  if (company.is_main && !isAdmin) {
    throw new AppError(
      403,
      'No tiene permiso para modificar la empresa principal.',
    );
  }

  const newData = {
    name: name?.trim() || company.name,
    isMain: isMain ?? company.is_main ?? false,
    active: active ?? company.active ?? true,
  };

  return Company.updateCompany(id, newData);
};

export const deleteCompany = async id => {
  const company = await companyExists(id);
  if (!company?.active)
    throw new AppError(400, 'La empresa ya está deshabilitada.');

  if (company.is_main)
    throw new AppError(400, 'No se puede deshabilitar la empresa principal.');

  return Company.disableCompany(company.id);
};
