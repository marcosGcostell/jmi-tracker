import * as SickLeave from '../../models/sick-leave.model.js';

export default async (id, client = undefined) => {
  const sickLeave = await SickLeave.getSickLeave(id);
  if (!sickLeave?.id) {
    throw new AppError(404, 'No se encuentra la baja en el registro.');
  }

  return sickLeave;
};
