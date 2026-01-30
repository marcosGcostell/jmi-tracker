import * as Company from '../../models/company.model.js';

export default async (id, onlyMain = false, client = undefined) => {
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
