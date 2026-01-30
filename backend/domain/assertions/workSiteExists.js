import * as WorkSite from '../../models/work-site.model.js';

export default async (id, client = undefined) => {
  const workSite = await WorkSite.getWorkSite(id);
  if (!workSite) {
    throw new AppError(404, 'La obra no existe.');
  }

  return workSite;
};
