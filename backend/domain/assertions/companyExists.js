import * as Company from '../../models/company.model.js';
import AppError from '../../utils/app-error.js';

export default async (id, exclusive = null, client = undefined) => {
  const company = await Company.getCompany(id, client);
  if (!company) {
    throw new AppError(404, 'La empresa no existe.');
  }
  if (exclusive === 'main' && !company.is_main) {
    throw new AppError(
      400,
      'Este recurso sólo es válido para la empresa principal.',
    );
  }
  if (exclusive === 'regular' && company.is_main) {
    throw new AppError(
      400,
      'Este recurso no es válido para la empresa principal.',
    );
  }

  return company;
};
