import * as SickLeave from '../../models/sick-leave.model.js';

const sickLeaveExists = async id => {
  const sickLeave = await SickLeave.getSickLeave(id);
  if (!sickLeave?.id) {
    throw new AppError(404, 'No se encuentra la baja en el registro.');
  }

  return sickLeave;
};

export default sickLeaveExists;
