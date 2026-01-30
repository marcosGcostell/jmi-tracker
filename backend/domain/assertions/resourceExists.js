import * as Resource from '../../models/resource.model.js';

export default async (id, client = undefined) => {
  const resource = await Resource.getResource(id);
  if (!resource) {
    throw new AppError(404, 'El trabajador o equipo no existe.');
  }

  return resource;
};
