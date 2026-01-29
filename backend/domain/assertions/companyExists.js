import * as Company from '../../models/company.model.js';

const companyExists = async (id, onlyMain = false) => {
  const company = await Company.getCompany(id);
  if (!company) {
    throw new AppError(404, 'La empresa no existe.');
  }
  if (onlyMain && !company.is_main) {
    throw new AppError(
      400,
      'Este recurso sólo es válido para la empresa principal.',
    );
  }

  return company;
};

export default companyExists;
