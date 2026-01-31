import * as WorkSite from '../../models/work-site.model.js';
import AppError from '../../utils/app-error.js';

export default async (id, client = undefined) => {
  const workSite = await WorkSite.getWorkSite(id, client);
  if (!workSite) {
    throw new AppError(404, 'La obra no existe.');
  }

  return workSite;
};
